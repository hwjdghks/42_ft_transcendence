import { trans } from '../language.js';
import { getProfileData, postMatchResult } from '../api/scriptApi.js';

const BALL_RADIUS = 0.5;

function initializePingPongGame(parentContainer, configJson, currentMatch) {
  const gameContainer = parentContainer.querySelector('#gameContainer');
  if (!gameContainer) {
    return () => {};
  }

  // Session data에서 게임 정보를 읽어오기
  const config = prepareGameConfig(configJson);
  
  // three js 세팅
  const { scene, camera, renderer } = createSceneAndRenderer(gameContainer, config);
  const { leftPaddle, rightPaddle, ball, ballVelocity, obstacles } = createGameObjects(scene, config);
  const { keysPressed, removeKeyListeners } = setupKeyListeners();
  
  // 기본 게임 플래그 세팅
  let gameScore = { player1: 0, player2: 0 };
  let gameOver = false;
  let scoringInProgress = false;
  let isCountdownActive = false;
  
  // 카운트다운 오버레이 세팅
  const countdownOverlay = document.getElementById('countdownOverlay');

  // 프레임 단위로 호출되어 게임 상황을 업데이트 하는 함수
  function update() {
    if (gameOver || isCountdownActive) return;
    
    movePaddles(leftPaddle, rightPaddle, keysPressed, config);
    moveBall(ball, ballVelocity, config);
    checkPaddleCollision(ball, ballVelocity, leftPaddle, rightPaddle, config);
    checkObstacleCollision(ball, ballVelocity, obstacles);
    
    // 득점 - 득점 사이, 즉 플레이 중인지 검사
    if (!scoringInProgress) { // 플레이 중이 아니라면 -> 방금 득점이 된 상태
      handleScoring(
        ball, ballVelocity, gameScore, config, currentMatch,
        () => { scoringInProgress = true; },
        endGame,
        (countdownTime, direction) => startCountdown(countdownTime, direction)
        );
      }
      // 스코어 보드 세팅
      const scoreBoard = document.getElementById('scoreBoard');
      if (scoreBoard) {
        scoreBoard.innerText = `${currentMatch.player1}: ${gameScore.player1} | ${currentMatch.player2}: ${gameScore.player2}`;
      }
    }
    
    // 카운트 다운 함수
    function startCountdown(time, direction) {
      isCountdownActive = true;
      countdownOverlay.style.display = 'block';
      countdownOverlay.innerText = `${time}`;
      
      // 1초(1000밀리초) 마다 카운트 다운 1초 감소
      const intervalId = setInterval(() => {
        time--;
        if (time > 0) {
          countdownOverlay.innerText = `${time}`;
        } else {
          clearInterval(intervalId);
          countdownOverlay.style.display = 'none';
          resetBall(ball, ballVelocity, config, direction);
          isCountdownActive = false;
          scoringInProgress = false;
        }
      }, 1000);
    }
    
    // 게임 종료 시 호출되는 함수
    async function endGame(winMessage) {
      try {
        const response = await getProfileData();
        gameOver = true;
        const winnerMessage = document.getElementById('winnerMessage');
        const profileUsername = response.username;
        const currentMatch = JSON.parse(sessionStorage.getItem('currentMatch'));
        const matches = JSON.parse(sessionStorage.getItem('matches')) || [];
        const { winnerName, userScore, opponentScore, opponentName } = determineWinner(
          profileUsername, currentMatch, gameScore
          );
          
          const displayMessage = winMessage || `${winnerName} ${trans[window.curLang].gameWin}`;
          
          winnerMessage.innerHTML = `
          <div style="text-align: center;">
          <div style="font-size: 24px; margin-bottom: 10px;">${displayMessage}</div>
          <div>${gameScore.player1} - ${gameScore.player2}</div>
          <button id="exitButton" class="btn btn-primary" style="margin-top: 20px;">
          ${trans[window.curLang].gameBackBtn}
          </button>
          </div>
      `;
      winnerMessage.style.display = 'block';
    
      // Session data 업데이트
      updateMatchStorage(currentMatch, matches, gameScore, winnerName);
      
      let finishedGames = JSON.parse(sessionStorage.getItem('finishedGames')) || [];
      if (currentMatch.id) {
        finishedGames.push(currentMatch.id);
        sessionStorage.setItem('finishedGames', JSON.stringify(finishedGames));
      }
      
      // 만약 방금 종료된 게임이 실제 플레이어의 경기였다면 백앤드로 전송(전적 업데이트)
      if (currentMatch.player1 === profileUsername) {
        const matchResultData = createMatchResultData(profileUsername, currentMatch, opponentName, userScore, opponentScore, winnerName);
        try {
          await postMatchResult(matchResultData);
        } catch (error) {
          alert('Error: ' + error.message);
        }
      }
      document.getElementById('exitButton').addEventListener('click', () => {
        getProfileData();
        window.location.hash = '#gameplay/tournament';
      });
    } catch (error) {
      alert('Error: ' + error.message);
    }
  }
  
  // 브라우저의 프레임 마다 animate->update 함수 호출을 통해 게임을 렌더함. 즉, 다음 프레임의 update를 예약 걸어두는 것.
  let requestId;
  function animate() {
    update();
    renderer.render(scene, camera);
    requestId = requestAnimationFrame(animate);
  }
  
  scoringInProgress = true;
  startCountdown(3, 1);
  animate();
  
  // 게임 창 이탈 시 자원 정리 & 키보드 게임 키 입력을 방지
  function cleanup() {
    cancelAnimationFrame(requestId);
    removeKeyListeners();
  }


  

  
  return cleanup;
}

function prepareGameConfig(configJson) {
  const defaultConfig = {
    winningScore: 7,
    ballSpeed: 0.2,
    paddleSpeed: 0.6,
    paddleSize: { width: 0.3, height: 4, depth: 1 },
    boundaryY: 10,
    boundaryX: 13,
    mapSkin: 0x001133,
    obstacleCount: 0
  };
  let config = { ...defaultConfig };

  if (configJson) {
    try {
      const parsed = typeof configJson === 'string' ? JSON.parse(configJson) : configJson;
      if (parsed.ballSpeed) {
        config.ballSpeed = defaultConfig.ballSpeed * parsed.ballSpeed;
      }
      if (parsed.paddleSize) {
        config.paddleSize = {
          ...defaultConfig.paddleSize,
          height: defaultConfig.paddleSize.height * parsed.paddleSize,
        };
      }
      if (parsed.obstacles) {
        config.obstacleCount = parsed.obstacles;
      }
    } catch (e) {
      console.error("Invalid config JSON, using default config:", e);
    }
  }
  return config;
}

function createSceneAndRenderer(gameContainer, config) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x444444);

  const containerWidth = gameContainer.clientWidth;
  const containerHeight = gameContainer.clientHeight || containerWidth;
  
  const camera = new THREE.PerspectiveCamera(45, containerWidth / containerHeight, 0.1, 1000);
  camera.position.set(0, 0, 28);
  camera.lookAt(0, 0, 0);
  
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(containerWidth, containerHeight);
  gameContainer.appendChild(renderer.domElement);
  
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';
  
  window.addEventListener('resize', () => {
    const newWidth = gameContainer.clientWidth;
    const newHeight = gameContainer.clientHeight || newWidth;
    renderer.setSize(newWidth, newHeight);
    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
  });
  
  const ambientLight = new THREE.AmbientLight(0xaaaaaa);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
  directionalLight.position.set(0, 1, 1);
  scene.add(directionalLight);

  addPingPongRoom(scene, config);

  return { scene, camera, renderer };
}

function addPingPongRoom(scene, config) {
  // 탁구대 표면 (플레이 영역과 동일한 크기)
  const tableGeometry = new THREE.PlaneGeometry(config.boundaryX * 2, config.boundaryY * 2);
  const tableMaterial = new THREE.MeshPhongMaterial({ color: 0x006600 });
  const tableSurface = new THREE.Mesh(tableGeometry, tableMaterial);

  // 게임 오브젝트(공, 패들)보다 약간 뒤에 배치 (z = -0.5)
  tableSurface.position.set(0, 0, -0.5);
  scene.add(tableSurface);

  // 중앙 네트 (세로로 얇은 흰색 판)
  const netGeometry = new THREE.PlaneGeometry(0.1, config.boundaryY * 2);
  const netMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
  const net = new THREE.Mesh(netGeometry, netMaterial);
  net.position.set(0, 0, -0.48);
  scene.add(net);

  // 배경 벽면
  const wallGeometry = new THREE.PlaneGeometry(50, 30);
  const wallMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
  const wall = new THREE.Mesh(wallGeometry, wallMaterial);
  wall.position.set(0, 0, -30);
  scene.add(wall);
}

function createGameObjects(scene, config) {
  const paddleMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
  const ballMaterial = new THREE.MeshPhongMaterial({ color: 0xffdd00 });
  const obstacleMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });

  const leftPaddle = new THREE.Mesh(
    new THREE.BoxGeometry(config.paddleSize.width, config.paddleSize.height, config.paddleSize.depth),
    paddleMaterial
  );
  leftPaddle.position.set(-11, 0, 0);
  scene.add(leftPaddle);

  const rightPaddle = new THREE.Mesh(
    new THREE.BoxGeometry(config.paddleSize.width, config.paddleSize.height, config.paddleSize.depth),
    paddleMaterial
  );
  rightPaddle.position.set(11, 0, 0);
  scene.add(rightPaddle);

  const ball = new THREE.Mesh(new THREE.SphereGeometry(BALL_RADIUS, 32, 32), ballMaterial);
  ball.position.set(0, 0, 0);
  scene.add(ball);
  const ballVelocity = new THREE.Vector3(config.ballSpeed, config.ballSpeed, 0);

  const obstacles = createObstacles(scene, config, obstacleMaterial);

  return { leftPaddle, rightPaddle, ball, ballVelocity, obstacles };
}

// 장애물 생성 함수
function createObstacles(scene, config, obstacleMaterial) {
  const obstacles = [];
  const safeZoneRadius = 3;

  // 장애물의 위치를 랜덤하게 생성하고, 그것이 유효한지 검사
  for (let i = 0; i < config.obstacleCount; i++) {
    let validPositionFound = false;
    let attempt = 0;
    let obstacle;

    while (!validPositionFound && attempt < 20) {
      //posX의 범위는 -10 ~ 10 사이의 값
      const posX = (Math.random() * 20) - 10;

      // posY의 범위는 (-boundaryY + 1) ~ (boundaryY - 1) 사이의 값
      const posY = (Math.random() * (config.boundaryY * 2 - 2)) - (config.boundaryY - 1);

      obstacle = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), obstacleMaterial);
      obstacle.position.set(posX, posY, 0);

      // 검사 1. 장애물 생성 좌표는 원점으로부터 조금 떨어져 있어야 함
      if (obstacle.position.distanceTo(new THREE.Vector3(0, 0, 0)) < safeZoneRadius) {
        attempt++;
        continue;
      }

      // 검사 2. 장애물 생성 좌표는 기존에 존재하는 장애물 좌표와 조금 떨어져 있어야 함
      let collision = false;
      for (const existing of obstacles) {
        if (obstacle.position.distanceTo(existing.position) < 1.5) {
          collision = true;
          break;
        }
      }
      if (collision) {
        attempt++;
        continue;
      }
      validPositionFound = true;
    }

    // 유효한 위치가 확인되면 장애물을 추가
    if (validPositionFound) {
      scene.add(obstacle);
      obstacles.push(obstacle);
    } else {
      alert("Could not find a valid obstacle location.");
      window.location.hash = '#profile';
    }
  }

  return obstacles;
}

// 키 셋업 함수
function setupKeyListeners() {
  const keysPressed = {};

  function onKeyDown(e) {
    keysPressed[e.code] = true;
  }
  function onKeyUp(e) {
    keysPressed[e.code] = false;
  }

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);

  function removeKeyListeners() {
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('keyup', onKeyUp);
  }

  return { keysPressed, removeKeyListeners };
}

// 공 움직임 계산 함수
function moveBall(ball, ballVelocity, config) {
  
  // 공 위치 업데이트
  ball.position.add(ballVelocity);
  
  // 공이 위, 아래 벽에 닿았는지 확인
  if (ball.position.y + BALL_RADIUS > config.boundaryY || ball.position.y - BALL_RADIUS < -config.boundaryY) {
    // 벽에 닿았을 경우 벡터 y값 반전 (반사)
    ballVelocity.y = -ballVelocity.y;

    // 공이 벽을 뚫고 나가는 것을 방지
    if (ball.position.y + BALL_RADIUS > config.boundaryY) {
      ball.position.y = config.boundaryY - BALL_RADIUS;
    } else if (ball.position.y - BALL_RADIUS < -config.boundaryY) {
      ball.position.y = -config.boundaryY + BALL_RADIUS;
    }
  }
}

function movePaddles(leftPaddle, rightPaddle, keysPressed, config) {
  if (keysPressed['KeyW'] && leftPaddle.position.y < config.boundaryY - config.paddleSize.height / 2) {
    leftPaddle.position.y += config.paddleSpeed;
  }
  if (keysPressed['KeyS'] && leftPaddle.position.y > -config.boundaryY + config.paddleSize.height / 2) {
    leftPaddle.position.y -= config.paddleSpeed;
  }
  if (keysPressed['KeyI'] && rightPaddle.position.y < config.boundaryY - config.paddleSize.height / 2) {
    rightPaddle.position.y += config.paddleSpeed;
  }
  if (keysPressed['KeyK'] && rightPaddle.position.y > -config.boundaryY + config.paddleSize.height / 2) {
    rightPaddle.position.y -= config.paddleSpeed;
  }
}

// 패들 충돌 판정
function checkPaddleCollision(ball, ballVelocity, leftPaddle, rightPaddle, config) {
  // 왼쪽 패들 충돌 처리
  const leftCollisionRect = {
    x: leftPaddle.position.x + config.paddleSize.width / 2, // 왼쪽 패들의 오른쪽 끝 위치
    y: leftPaddle.position.y, // 패들의 중심 Y 좌표
    width: config.paddleSize.width, // 패들의 너비
    height: config.paddleSize.height // 패들의 높이
  };
  if (checkCircleRectCollision(
      {x: ball.position.x, y: ball.position.y, radius: BALL_RADIUS},
      leftCollisionRect
    )) {
      // 충돌이 확인 되었을 경우
    ballVelocity.x = Math.abs(ballVelocity.x); // 벡터 x성분 반전
    adjustBallAngle(ballVelocity, false); // 반사각도조정
    ballVelocity.multiplyScalar(1.05); // 공 속도 증가
  }
  
  // 오른쪽 패들 충돌 처리 (패들의 왼쪽 앞면 기준)
  const rightCollisionRect = {
    x: rightPaddle.position.x - config.paddleSize.width / 2,
    y: rightPaddle.position.y,
    width: config.paddleSize.width,
    height: config.paddleSize.height
  };
  if (checkCircleRectCollision(
      {x: ball.position.x, y: ball.position.y, radius: BALL_RADIUS},
      rightCollisionRect
    )) {
    adjustBallAngle(ballVelocity, false);
    ballVelocity.x = -Math.abs(ballVelocity.x);
    ballVelocity.multiplyScalar(1.05);
  }
}

/*
  원-사각형 충돌 판정 (원은 중심 좌표와 반지름, 사각형은 중심 좌표와 전체 너비/높이를 사용)
  circle.x, circle.y → 공의 중심 좌표
  circle.radius → 공의 반지름
  rect.x, rect.y → 패들의 중심 좌표
  rect.width, rect.height → 패들의 크기(너비, 높이)
*/
function checkCircleRectCollision(circle, rect) {
  const distX = Math.abs(circle.x - rect.x); // 공과 패들 사이 x축 거리 차이
  const distY = Math.abs(circle.y - rect.y); // 공과 패들 사이 y축 거리 차이

  // 공의 중심이 패들 바깥에 있는 경우 으로 너무 멀리 있는 경우: 충돌 없음
  if (distX > (rect.width / 2 + circle.radius)) return false;
  if (distY > (rect.height / 2 + circle.radius)) return false;

  // 공의 중심이 패들 안에 있는 경우 으로 너무 멀리 있는 경우: 충돌 있음
  if (distX <= (rect.width / 2)) return true;
  if (distY <= (rect.height / 2)) return true;

  // 공이 패들의 모서리에 닿았는지 확인
  const dx = distX - rect.width / 2; // 공의 중심과 패들의 오른쪽/왼쪽 수직 경계선 사이 거리
  const dy = distY - rect.height / 2; // 공의 중심과 패들의 위/아래 수직 경계선 사이 거리

  // 공의 중심과 패들의 모서리 간 거리가 공의 반지름 이내라면 충돌
  return (dx * dx + dy * dy <= (circle.radius * circle.radius));
}

function checkObstacleCollision(ball, ballVelocity, obstacles) {
  obstacles.forEach(obstacle => {
    const ballBox = new THREE.Box3().setFromObject(ball);
    const obstacleBox = new THREE.Box3().setFromObject(obstacle);
    if (ballBox.intersectsBox(obstacleBox)) {
      ballVelocity.x = -ballVelocity.x;
      ballVelocity.y = -ballVelocity.y;
      ballVelocity.x *= (1 + Math.random() * 0.1 - 0.05);
      ballVelocity.y *= (1 + Math.random() * 0.1 - 0.05);
    }
  });
}

function handleScoring(
  ball, ballVelocity, gameScore, config, currentMatch,
  onScoreStart, endGame, onStartCountdown
) {
  if (ball.position.x - BALL_RADIUS < -config.boundaryX) {
    onScoreStart();
    gameScore.player2++;
    if (gameScore.player2 >= config.winningScore) {
      endGame(`${currentMatch.player2} ${trans[window.curLang].gameWin}`);
      return;
    }
    onStartCountdown(3, 1);
  } else if (ball.position.x + BALL_RADIUS > config.boundaryX) {
    onScoreStart();
    gameScore.player1++;
    if (gameScore.player1 >= config.winningScore) {
      endGame(`${currentMatch.player1} ${trans[window.curLang].gameWin}`);
      return;
    }
    onStartCountdown(3, -1);
  }
}

function adjustBallAngle(ballVelocity, invertX = false) {
  const speed = ballVelocity.length();
  let currentAngle = Math.atan2(ballVelocity.y, ballVelocity.x);

  const angleVariation = Math.random() * 0.2 - 0.1;
  const newAngle = currentAngle + angleVariation;

  ballVelocity.x = speed * Math.cos(newAngle);
  ballVelocity.y = speed * Math.sin(newAngle);
}

function resetBall(ball, ballVelocity, config, direction) {
  ball.position.set(0, 0, 0);
  ballVelocity.set(
    config.ballSpeed * direction,
    config.ballSpeed * (Math.random() * 0.8 - 0.25),
    0
  );
}

function determineWinner(profileUsername, currentMatch, gameScore) {
  let winnerName;
  let userScore, opponentScore, opponentName;

  if (currentMatch.player1 === profileUsername || currentMatch.player2 === profileUsername) {
    if (currentMatch.player1 === profileUsername) {
      userScore = gameScore.player1;
      opponentScore = gameScore.player2;
      opponentName = currentMatch.player2;
    } else {
      userScore = gameScore.player2;
      opponentScore = gameScore.player1;
      opponentName = currentMatch.player1;
    }

    if (userScore > opponentScore) {
      winnerName = profileUsername;
    } else if (userScore < opponentScore) {
      winnerName = opponentName;
    }
  } else {
    if (gameScore.player1 > gameScore.player2) {
      winnerName = currentMatch.player1;
    } else if (gameScore.player1 < gameScore.player2) {
      winnerName = currentMatch.player2;
    }
  }
  return { winnerName, userScore, opponentScore, opponentName };
}

function updateMatchStorage(currentMatch, matches, gameScore, winnerName) {
  const matchIndex = matches.findIndex(m =>
    m.player1 === currentMatch.player1 &&
    m.player2 === currentMatch.player2
  );
  if (matchIndex !== -1) {
    matches[matchIndex].winner = winnerName;
    matches[matchIndex].score = {
      player1: gameScore.player1,
      player2: gameScore.player2
    };
  }
  sessionStorage.setItem('matches', JSON.stringify(matches));
}

function createMatchResultData(username, currentMatch, opponentName, userScore, opponentScore, winnerName) {
  let gameResult = 'draw';
  if (userScore > opponentScore) {
    gameResult = 'win';
  } else if (userScore < opponentScore) {
    gameResult = 'lose';
  }

  return {
    username: username,
    session_id: currentMatch.id,
    guestname: opponentName,
    user_score: userScore,
    guest_score: opponentScore,
    game_result: gameResult,
  };
}

export { initializePingPongGame };
