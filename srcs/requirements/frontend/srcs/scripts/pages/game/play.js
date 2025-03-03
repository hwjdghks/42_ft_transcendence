// ./pages/game/play.js
async function getProfileUsername() {
  try {
    const token = sessionStorage.getItem('fa_token');
    const response = await fetch('https://localhost/api/users/profile/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error('프로필 정보를 가져오지 못했습니다.');
    const profile = await response.json();
    return profile.username || "Me";
  } catch (error) {
    console.error(error);
    return "Me";
  }
}

function GamePlayPage(configJson) {
  if (!configJson) {
    configJson = sessionStorage.getItem('game_option');
  }
  const container = document.createElement("div");
  container.className = "game-container";
  container.innerHTML = `
      <div id="scoreBoard">Player1: 0 | Player2: 0</div>
      <div id="gameContainer"></div>
      <div id="winnerMessage"></div>
      <!-- 점수 후 카운트다운 UI -->
      <div id="countdownOverlay" style="display:none; position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); font-size:2em; color:#fff;"></div>
  `;
  
  // 임시 cleanup 함수 할당 (추후 초기화 후 교체)
  container.cleanup = function() {};

  // DOM이 준비된 후 게임 초기화 및 cleanup 함수 획득
  setTimeout(() => {
    const cleanupFn = initializePingPongGame(container, configJson);
    container.cleanup = cleanupFn;
  }, 100);

  return container;
}

function initializePingPongGame(parentContainer, configJson) {
  const gameContainer = parentContainer.querySelector('#gameContainer');
  if (!gameContainer) {
    console.error('게임 컨테이너를 찾을 수 없습니다.');
    return function(){};
  }
  
  // 현재 경기 정보 불러오기
  const currentMatch = JSON.parse(sessionStorage.getItem('currentMatch') || '{}');
  const roundIndex = currentMatch.roundIndex ?? 0;
  const matchIndex = currentMatch.matchIndex ?? 0;

  // 기본 옵션 설정
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

  // THREE.js Scene, Camera, Renderer 생성
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

  // 조명 추가
  const ambientLight = new THREE.AmbientLight(0xaaaaaa);
  scene.add(ambientLight);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
  directionalLight.position.set(0, 1, 1);
  scene.add(directionalLight);

  // 게임 오브젝트 재료(Material) 생성
  const paddleMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
  const ballMaterial = new THREE.MeshPhongMaterial({ color: 0xffdd00 });
  const obstacleMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });

  // 왼쪽 패들 생성
  const leftPaddle = new THREE.Mesh(
    new THREE.BoxGeometry(config.paddleSize.width, config.paddleSize.height, config.paddleSize.depth),
    paddleMaterial
  );
  leftPaddle.position.set(-12, 0, 0);
  scene.add(leftPaddle);

  // 오른쪽 패들 생성
  const rightPaddle = new THREE.Mesh(
    new THREE.BoxGeometry(config.paddleSize.width, config.paddleSize.height, config.paddleSize.depth),
    paddleMaterial
  );
  rightPaddle.position.set(12, 0, 0);
  scene.add(rightPaddle);

  // 공 생성
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 32), ballMaterial);
  ball.position.set(0, 0, 0);
  scene.add(ball);
  const ballVelocity = new THREE.Vector3(config.ballSpeed, config.ballSpeed, 0);

  // 장애물 생성 (안전 영역 및 충돌 체크)
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

  // 키 입력 이벤트 처리
  const keysPressed = {};
  function onKeyDown(e) {
    keysPressed[e.code] = true;
  }
  function onKeyUp(e) {
    keysPressed[e.code] = false;
  }
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);

  let gameScore = { player1: 0, player2: 0 };
  let gameOver = false;
  let scoringInProgress = false;
  let isCountdownActive = false;
  let countdownTime = 0;
  const countdownOverlay = document.getElementById('countdownOverlay');

  // 충돌 후 공의 진행 각도에 변화 주기 (예: -0.1 ~ 0.1 라디안)
  function adjustBallAngle(ballVelocity, invertX = false) {
    // 속도의 크기를 계산
    const speed = ballVelocity.length();
    // 현재 각도 계산
    let currentAngle = Math.atan2(ballVelocity.y, ballVelocity.x);
    // x 반전이 필요한 경우 각도를 보정
    if (invertX) {
      currentAngle = Math.PI - currentAngle;
    }
    // 작은 각도 변화 추가 (예: -0.1 ~ 0.1 라디안)
    const angleVariation = Math.random() * 0.2 - 0.1;
    const newAngle = currentAngle + angleVariation;
    // 새로운 속도 벡터 설정 (속도는 유지)
    ballVelocity.x = speed * Math.cos(newAngle);
    ballVelocity.y = speed * Math.sin(newAngle);
  }

  function update() {
    if (gameOver || isCountdownActive) return;

    // 패들 이동 처리
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

    // 공 이동
    ball.position.add(ballVelocity);

    // 위/아래 경계 반사
    if (ball.position.y + 0.5 > config.boundaryY || ball.position.y - 0.5 < -config.boundaryY) {
      ballVelocity.y = -ballVelocity.y;
    }
  
    if (
      ball.position.x - 0.5 < leftPaddle.position.x + config.paddleSize.width / 2 &&
      Math.abs(ball.position.y - leftPaddle.position.y) < config.paddleSize.height / 2 + 0.5
    ) {
      // 왼쪽 패들과 충돌 시, x는 양수 방향으로 반전 후 각도 조정
      ballVelocity.x = Math.abs(ballVelocity.x);
      adjustBallAngle(ballVelocity, false);
      ballVelocity.multiplyScalar(1.05);
    }
    
    if (
      ball.position.x + 0.5 > rightPaddle.position.x - config.paddleSize.width / 2 &&
      Math.abs(ball.position.y - rightPaddle.position.y) < config.paddleSize.height / 2 + 0.5
    ) {
      // 오른쪽 패들과 충돌 시, x를 양수로 설정 후, adjustBallAngle에서 invertX=true로 전달하여 좌측(음수) 방향으로 반전
      ballVelocity.x = Math.abs(ballVelocity.x);
      adjustBallAngle(ballVelocity, true);
      ballVelocity.multiplyScalar(1.05);
    }
    

    // 장애물과 충돌 처리
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

    // 득점 처리
    if (!scoringInProgress) {
      if (ball.position.x - 0.1 < -13) {
        scoringInProgress = true;
        gameScore.player2++;
        if (gameScore.player2 >= config.winningScore) {
          endGame("Player 2 Wins!");
          return;
        }
        startCountdown(3, 1);
      } else if (ball.position.x + 0.1 > 13) {
        scoringInProgress = true;
        gameScore.player1++;
        if (gameScore.player1 >= config.winningScore) {
          endGame("Player 1 Wins!");
          return;
        }
        startCountdown(3, -1);
      }
    }


    const scoreBoard = document.getElementById('scoreBoard');
    if (scoreBoard) {
      scoreBoard.innerText = `${currentMatch.player1}: ${gameScore.player1} | ${currentMatch.player2}: ${gameScore.player2}`;
    }
  }

  function startCountdown(time, direction) {
    isCountdownActive = true;
    countdownTime = time;
    countdownOverlay.style.display = 'block';
    countdownOverlay.innerText = `${countdownTime}`;
    const intervalId = setInterval(() => {
      countdownTime--;
      if (countdownTime > 0) {
        countdownOverlay.innerText = `${countdownTime}`;
      } else {
        clearInterval(intervalId);
        countdownOverlay.style.display = 'none';
        resetBall(direction);
        isCountdownActive = false;
      }
    }, 1000);
  }

  function resetBall(direction) {
    ball.position.set(0, 0, 0);
    ballVelocity.set(
      config.ballSpeed * direction,
      config.ballSpeed * (Math.random() * 0.8 - 0.25),
      0
    );
    scoringInProgress = false;
  }

  async function endGame(message) {
    gameOver = true;
    const winnerMessage = document.getElementById('winnerMessage');
    const currentMatch = JSON.parse(sessionStorage.getItem('currentMatch'));
    const matches = JSON.parse(sessionStorage.getItem('matches')) || [];
    const profileUsername = await getProfileUsername();

    let userScore, opponentScore, opponentName, winnerName;
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
    } else {
      winnerName = "Draw";
    }
  
    winnerMessage.innerHTML = `
      <div style="text-align: center;">
        <div style="font-size: 24px; margin-bottom: 10px;">${winnerName} 승리</div>
        <div>${gameScore.player1} - ${gameScore.player2}</div>
        <button id="exitButton" class="btn btn-primary" style="margin-top: 20px;">토너먼트로 돌아가기</button>
      </div>
    `;
    winnerMessage.style.display = 'block';
  
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
  
    let finishedGames = JSON.parse(sessionStorage.getItem('finishedGames')) || [];
    if (currentMatch.id) {
      finishedGames.push(currentMatch.id);
      sessionStorage.setItem('finishedGames', JSON.stringify(finishedGames));
    }
    sessionStorage.setItem('matches', JSON.stringify(matches));
  
    let gameResult;
    if (userScore > opponentScore) {
      gameResult = "win";
    } else if (userScore < opponentScore) {
      gameResult = "lose";
    } else {
      gameResult = "draw";
    }
  
    const matchResultData = {
      session_id: currentMatch.id,
      guestname: opponentName,
      user_score: userScore,
      guest_score: opponentScore,
      game_result: gameResult,
    };
  
    if (currentMatch.player1 === profileUsername) {
      try {
        const token = sessionStorage.getItem('fa_token');
        const response = await fetch('https://localhost/api/match/add/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(matchResultData)
        });
        if (!response.ok) {
          const errorData = await response.json();
          console.error("매치 결과 전송 실패", errorData);
        } else {
          const data = await response.json();
          console.log("매치 결과 전송 성공", data);
        }
      } catch (err) {
        console.error("매치 결과 전송 중 에러 발생", err);
      }
    } else {
      console.log("플레이어1이 프로필 username과 일치하지 않아 백엔드로 결과를 전송하지 않습니다.");
    }
  
    document.getElementById('exitButton').addEventListener('click', () => {
      window.location.hash = '#gameplay/tournament';
    });
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

  // cleanup 함수: 애니메이션 중단 및 이벤트 리스너 제거
  function cleanup() {
    cancelAnimationFrame(requestId);
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('keyup', onKeyUp);
  }

  return cleanup;
}

export { GamePlayPage };
