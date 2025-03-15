import { trans } from '../language.js';
import { getProfileData, postMatchResult } from '../api/scriptApi.js';

const BALL_RADIUS = 0.5;

function initializePingPongGame(parentContainer, configJson, currentMatch) {
  const gameContainer = parentContainer.querySelector('#gameContainer');
  if (!gameContainer) {
    return () => {};
  }

  const config = prepareGameConfig(configJson);
  const { scene, camera, renderer } = createSceneAndRenderer(gameContainer, config);
  const { leftPaddle, rightPaddle, ball, ballVelocity, obstacles } = createGameObjects(scene, config);
  const { keysPressed, removeKeyListeners } = setupKeyListeners();

  let gameScore = { player1: 0, player2: 0 };
  let gameOver = false;
  let scoringInProgress = false;
  let isCountdownActive = false;

  const countdownOverlay = document.getElementById('countdownOverlay');

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
    const scoreBoard = document.getElementById('scoreBoard');
    if (scoreBoard) {
      scoreBoard.innerText = `${currentMatch.player1}: ${gameScore.player1} | ${currentMatch.player2}: ${gameScore.player2}`;
    }
  }

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
    
      updateMatchStorage(currentMatch, matches, gameScore, winnerName);
    
      let finishedGames = JSON.parse(sessionStorage.getItem('finishedGames')) || [];
      if (currentMatch.id) {
        finishedGames.push(currentMatch.id);
        sessionStorage.setItem('finishedGames', JSON.stringify(finishedGames));
      }
    
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

  let requestId;
  function animate() {
    requestId = requestAnimationFrame(animate);
    update();
    renderer.render(scene, camera);
  }

  scoringInProgress = true;
  startCountdown(3, 1);
  animate();

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
  // 1. 탁구대 표면 (플레이 영역과 동일한 크기)
  const tableGeometry = new THREE.PlaneGeometry(config.boundaryX * 2, config.boundaryY * 2);
  const tableMaterial = new THREE.MeshPhongMaterial({ color: 0x006600 });
  const tableSurface = new THREE.Mesh(tableGeometry, tableMaterial);
  // 게임 오브젝트(공, 패들)보다 약간 뒤에 배치 (z = -0.5)
  tableSurface.position.set(0, 0, -0.5);
  scene.add(tableSurface);

  // 2. 탁구대 테두리 (흰색 선)
  const borderMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
  const borderPoints = [
    new THREE.Vector3(-config.boundaryX, config.boundaryY, -0.49),
    new THREE.Vector3(config.boundaryX, config.boundaryY, -0.49),
    new THREE.Vector3(config.boundaryX, -config.boundaryY, -0.49),
    new THREE.Vector3(-config.boundaryX, -config.boundaryY, -0.49),
    new THREE.Vector3(-config.boundaryX, config.boundaryY, -0.49)
  ];
  const borderGeometry = new THREE.BufferGeometry().setFromPoints(borderPoints);
  const borderLine = new THREE.Line(borderGeometry, borderMaterial);
  scene.add(borderLine);

  // 3. 중앙 네트 (세로로 얇은 흰색 판)
  const netGeometry = new THREE.PlaneGeometry(0.1, config.boundaryY * 2);
  const netMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
  const net = new THREE.Mesh(netGeometry, netMaterial);
  net.position.set(0, 0, -0.48);
  scene.add(net);

  // 4. 배경 벽면
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

      if (obstacle.position.distanceTo(new THREE.Vector3(0, 0, 0)) < safeZoneRadius) {
        attempt++;
        continue;
      }

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

function moveBall(ball, ballVelocity, config) {
  ball.position.add(ballVelocity);
  
  if (ball.position.y + BALL_RADIUS > config.boundaryY || ball.position.y - BALL_RADIUS < -config.boundaryY) {
    ballVelocity.y = -ballVelocity.y;
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
  // 왼쪽 패들 충돌 처리 (패들의 오른쪽 앞면 기준)
  const leftCollisionRect = {
    x: leftPaddle.position.x + config.paddleSize.width / 2,
    y: leftPaddle.position.y,
    width: config.paddleSize.width,
    height: config.paddleSize.height
  };
  if (checkCircleRectCollision(
      {x: ball.position.x, y: ball.position.y, radius: BALL_RADIUS},
      leftCollisionRect
    )) {
    ballVelocity.x = Math.abs(ballVelocity.x);
    adjustBallAngle(ballVelocity, false);
    ballVelocity.multiplyScalar(1.05);
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
    // 각도 조정 후, x 속도를 음수로 보장
    adjustBallAngle(ballVelocity, false);
    ballVelocity.x = -Math.abs(ballVelocity.x);
    ballVelocity.multiplyScalar(1.05);
  }
}

// 원-사각형 충돌 판정 (원은 중심 좌표와 반지름, 사각형은 중심 좌표와 전체 너비/높이를 사용)
function checkCircleRectCollision(circle, rect) {
  const distX = Math.abs(circle.x - rect.x);
  const distY = Math.abs(circle.y - rect.y);

  if (distX > (rect.width / 2 + circle.radius)) return false;
  if (distY > (rect.height / 2 + circle.radius)) return false;

  if (distX <= (rect.width / 2)) return true;
  if (distY <= (rect.height / 2)) return true;

  const dx = distX - rect.width / 2;
  const dy = distY - rect.height / 2;
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
