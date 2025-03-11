import { trans } from '../language.js';
import { getProfileData, postMatchResult } from '../api/scriptApi.js';
import { updateProfilePage } from '../pages/profile/profile.js';

function initializePingPongGame(parentContainer, configJson, currentMatch) {
  // gameContainer, scoreBoard 등 DOM 참조
  const gameContainer = parentContainer.querySelector('#gameContainer');
  if (!gameContainer) {
    return () => {};
  }

  // config 준비
  const config = prepareGameConfig(configJson);

  // Three.js 기본 세팅
  const { scene, camera, renderer } = createSceneAndRenderer(gameContainer, config);

  // 게임 오브젝트 생성 (패들, 공, 장애물)
  const { leftPaddle, rightPaddle, ball, ballVelocity, obstacles } = createGameObjects(scene, config);

  // 키보드 입력 처리
  const { keysPressed, removeKeyListeners } = setupKeyListeners();

  // 게임 상태 변수
  let gameScore = { player1: 0, player2: 0 };
  let gameOver = false;
  let scoringInProgress = false;
  let isCountdownActive = false;

  const countdownOverlay = document.getElementById('countdownOverlay');

  // 매 프레임마다 실행되는 update
  function update() {
    if (gameOver || isCountdownActive) return;
  
    movePaddles(leftPaddle, rightPaddle, keysPressed, config);
    moveBall(ball, ballVelocity, config);
    checkPaddleCollision(ball, ballVelocity, leftPaddle, rightPaddle, config);
    checkObstacleCollision(ball, ballVelocity, obstacles);
  
    if (!scoringInProgress) {
      handleScoring(
        ball, ballVelocity, gameScore, config, currentMatch,
        () => { scoringInProgress = true; },
        endGame,
        (countdownTime, direction) => startCountdown(countdownTime, direction)
      );
    }
    // 스코어보드 갱신
    const scoreBoard = document.getElementById('scoreBoard');
    if (scoreBoard) {
      scoreBoard.innerText = `${currentMatch.player1}: ${gameScore.player1} | ${currentMatch.player2}: ${gameScore.player2}`;
    }
  }

  //  카운트다운 
  function startCountdown(time, direction) {
    isCountdownActive = true;
    countdownOverlay.style.display = 'block';
    countdownOverlay.innerText = `${time}`;

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

  //  게임 종료 
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

      // winMessage가 전달되면 해당 메시지를, 아니면 기본 승리 메시지를 사용
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
    
      updateMatchStorage(currentMatch, matches, gameScore, winnerName);
    
      let finishedGames = JSON.parse(sessionStorage.getItem('finishedGames')) || [];
      if (currentMatch.id) {
        finishedGames.push(currentMatch.id);
        sessionStorage.setItem('finishedGames', JSON.stringify(finishedGames));
      }
    
      // 서버로 경기 결과 전송 (플레이어1인 경우만)
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
  

  // 애니메이션 루프 
  let requestId;
  function animate() {
    requestId = requestAnimationFrame(animate);
    update();
    renderer.render(scene, camera);
  }

  // 시작 시 3초 카운트다운
  scoringInProgress = true;
  startCountdown(3, 1);
  animate();

  // cleanup 함수 
  function cleanup() {
    cancelAnimationFrame(requestId);
    removeKeyListeners();
  }

  return cleanup;
}

// configJson을 해석해 최종 설정 객체를 반환
function prepareGameConfig(configJson) {
  const defaultConfig = {
    winningScore: 7,
    ballSpeed: 0.2,
    paddleSpeed: 0.6,
    paddleSize: { width: 0.3, height: 4, depth: 1 },
    boundaryY: 10,
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

// Three.js 씬, 카메라, 렌더러 생성 및 설정
function createSceneAndRenderer(gameContainer, config) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(config.mapSkin);

  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
  camera.position.set(0, 0, 30);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(600, 600, false);
  gameContainer.appendChild(renderer.domElement);
  renderer.domElement.tabIndex = 0;
  renderer.domElement.focus();

  // 조명
  const ambientLight = new THREE.AmbientLight(0xaaaaaa);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
  directionalLight.position.set(0, 1, 1);
  scene.add(directionalLight);

  return { scene, camera, renderer };
}

// 패들, 공, 장애물 생성
function createGameObjects(scene, config) {
  // 재질(Material)
  const paddleMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
  const ballMaterial = new THREE.MeshPhongMaterial({ color: 0xffdd00 });
  const obstacleMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });

  // 패들
  const leftPaddle = new THREE.Mesh(
    new THREE.BoxGeometry(config.paddleSize.width, config.paddleSize.height, config.paddleSize.depth),
    paddleMaterial
  );
  leftPaddle.position.set(-12, 0, 0);
  scene.add(leftPaddle);

  const rightPaddle = new THREE.Mesh(
    new THREE.BoxGeometry(config.paddleSize.width, config.paddleSize.height, config.paddleSize.depth),
    paddleMaterial
  );
  rightPaddle.position.set(12, 0, 0);
  scene.add(rightPaddle);

  // 공
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 32), ballMaterial);
  ball.position.set(0, 0, 0);
  scene.add(ball);
  const ballVelocity = new THREE.Vector3(config.ballSpeed, config.ballSpeed, 0);

  // 장애물
  const obstacles = createObstacles(scene, config, obstacleMaterial);

  return { leftPaddle, rightPaddle, ball, ballVelocity, obstacles };
}

// 장애물 배치
function createObstacles(scene, config, obstacleMaterial) {
  const obstacles = [];
  const safeZoneRadius = 3;

  for (let i = 0; i < config.obstacleCount; i++) {
    let validPositionFound = false;
    let attempt = 0;
    let obstacle;

    while (!validPositionFound && attempt < 10) {
      const posX = (Math.random() * 20) - 10;
      const posY = (Math.random() * (config.boundaryY * 2 - 2)) - (config.boundaryY - 1);

      obstacle = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), obstacleMaterial);
      obstacle.position.set(posX, posY, 0);

      // 공 주변 safe zone
      if (obstacle.position.distanceTo(new THREE.Vector3(0, 0, 0)) < safeZoneRadius) {
        attempt++;
        continue;
      }

      // 기존 장애물과 거리 체크
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

    if (validPositionFound) {
      scene.add(obstacle);
      obstacles.push(obstacle);
    } else {
      console.warn("유효한 장애물 위치를 찾지 못했습니다.");
    }
  }

  return obstacles;
}


// 키보드 입력 처리
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

// 매 프레임마다 공 이동
function moveBall(ball, ballVelocity, config) {
  ball.position.add(ballVelocity);

  // 상하 경계 반사
  if (ball.position.y + 0.5 > config.boundaryY || ball.position.y - 0.5 < -config.boundaryY) {
    ballVelocity.y = -ballVelocity.y;
  }
}

// 매 프레임마다 패들 이동
function movePaddles(leftPaddle, rightPaddle, keysPressed, config) {
  // 왼쪽 패들 (W, S)
  if (keysPressed['KeyW'] && leftPaddle.position.y < config.boundaryY - config.paddleSize.height / 2) {
    leftPaddle.position.y += config.paddleSpeed;
  }
  if (keysPressed['KeyS'] && leftPaddle.position.y > -config.boundaryY + config.paddleSize.height / 2) {
    leftPaddle.position.y -= config.paddleSpeed;
  }

  // 오른쪽 패들 (I, K)
  if (keysPressed['KeyI'] && rightPaddle.position.y < config.boundaryY - config.paddleSize.height / 2) {
    rightPaddle.position.y += config.paddleSpeed;
  }
  if (keysPressed['KeyK'] && rightPaddle.position.y > -config.boundaryY + config.paddleSize.height / 2) {
    rightPaddle.position.y -= config.paddleSpeed;
  }
}

// 패들과의 충돌 처리
function checkPaddleCollision(ball, ballVelocity, leftPaddle, rightPaddle, config) {
  // 왼쪽 패들
  if (
    ball.position.x - 0.5 < leftPaddle.position.x + config.paddleSize.width / 2 &&
    Math.abs(ball.position.y - leftPaddle.position.y) < config.paddleSize.height / 2 + 0.5
  ) {
    ballVelocity.x = Math.abs(ballVelocity.x);
    adjustBallAngle(ballVelocity, false);
    ballVelocity.multiplyScalar(1.05); // 속도 점진적 증가
  }

  // 오른쪽 패들
  if (
    ball.position.x + 0.5 > rightPaddle.position.x - config.paddleSize.width / 2 &&
    Math.abs(ball.position.y - rightPaddle.position.y) < config.paddleSize.height / 2 + 0.5
  ) {
    ballVelocity.x = Math.abs(ballVelocity.x);
    adjustBallAngle(ballVelocity, true);
    ballVelocity.multiplyScalar(1.05);
  }
}

// 장애물 충돌 처리
function checkObstacleCollision(ball, ballVelocity, obstacles) {
  obstacles.forEach(obstacle => {
    const ballBox = new THREE.Box3().setFromObject(ball);
    const obstacleBox = new THREE.Box3().setFromObject(obstacle);
    if (ballBox.intersectsBox(obstacleBox)) {
      ballVelocity.x = -ballVelocity.x;
      ballVelocity.y = -ballVelocity.y;
      // 약간의 난수로 궤적 변경
      ballVelocity.x *= (1 + Math.random() * 0.1 - 0.05);
      ballVelocity.y *= (1 + Math.random() * 0.1 - 0.05);
    }
  });
}

// 득점 처리
function handleScoring(
  ball, ballVelocity, gameScore, config, currentMatch,
  onScoreStart, endGame, onStartCountdown
) {
  // 왼쪽 경계: ball이 왼쪽으로 벗어나면 오른쪽 플레이어(즉, currentMatch.player2)가 득점
  if (ball.position.x - 0.1 < -13) {
    onScoreStart();
    gameScore.player2++;
    if (gameScore.player2 >= config.winningScore) {
      endGame(`${currentMatch.player2} ${trans[window.curLang].gameWin}`);
      return;
    }
    onStartCountdown(3, 1);
  } 
  // 오른쪽 경계: ball이 오른쪽으로 벗어나면 왼쪽 플레이어(즉, currentMatch.player1)가 득점
  else if (ball.position.x + 0.1 > 13) {
    onScoreStart();
    gameScore.player1++;
    if (gameScore.player1 >= config.winningScore) {
      endGame(`${currentMatch.player1} ${trans[window.curLang].gameWin}`);
      return;
    }
    onStartCountdown(3, -1);
  }
}

// 공 각도에 약간 변화를 주어 난이도 증가
function adjustBallAngle(ballVelocity, invertX = false) {
  const speed = ballVelocity.length();
  let currentAngle = Math.atan2(ballVelocity.y, ballVelocity.x);

  // x 반전(오른쪽 패들에서 튕길 때)
  if (invertX) {
    currentAngle = Math.PI - currentAngle;
  }

  // -0.1 ~ 0.1 사이 각도 변화
  const angleVariation = Math.random() * 0.2 - 0.1;
  const newAngle = currentAngle + angleVariation;

  ballVelocity.x = speed * Math.cos(newAngle);
  ballVelocity.y = speed * Math.sin(newAngle);
}


// 공을 중앙에 재배치
function resetBall(ball, ballVelocity, config, direction) {
  ball.position.set(0, 0, 0);
  ballVelocity.set(
    config.ballSpeed * direction,
    config.ballSpeed * (Math.random() * 0.8 - 0.25),
    0
  );
}


// 승패 및 점수 계산
function determineWinner(profileUsername, currentMatch, gameScore) {
  let winnerName;
  let userScore, opponentScore, opponentName;

  // 만약 로그인 유저가 경기 참가자 중 하나라면 기존 로직 사용
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
    // 로그인 유저가 경기 참가자가 아니라면, 단순 비교로 결정
    if (gameScore.player1 > gameScore.player2) {
      winnerName = currentMatch.player1;
    } else if (gameScore.player1 < gameScore.player2) {
      winnerName = currentMatch.player2;
    }
  }
  return { winnerName, userScore, opponentScore, opponentName };
}

// 경기 기록을 matches에 저장
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

// matchResultData 생성
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
