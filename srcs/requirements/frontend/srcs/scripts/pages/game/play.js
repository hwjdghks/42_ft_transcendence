function GamePlayPage(configJson) {
  const container = document.createElement("div");
  container.className = "game-container";
  container.innerHTML = `
      <div id="scoreBoard">Player1: 0 | Player2: 0</div>
      <div id="gameContainer"></div>
      <div id="winnerMessage"></div>
  `;
  
  // DOM이 완전히 준비된 후에 게임 초기화
  setTimeout(() => {
    initializePingPongGame(container, configJson);
  }, 100);

  return container;
}

function initializePingPongGame(parentContainer, configJson) {
  // 게임 컨테이너를 parentContainer 내부에서 찾습니다.
  const gameContainer = parentContainer.querySelector('#gameContainer');
  if (!gameContainer) {
    console.error('게임 컨테이너를 찾을 수 없습니다.');
    return;
  }
  
  // 현재 경기 정보 불러오기 (예: gameId 포함)
  const currentMatch = JSON.parse(sessionStorage.getItem('currentMatch') || '{}');
  const roundIndex = currentMatch.roundIndex ?? 0;
  const matchIndex = currentMatch.matchIndex ?? 0;

  // 기본 옵션 설정
  const defaultConfig = {
    winningScore: 7,
    ballSpeed: 0.6,
    paddleSpeed: 0.5,
    paddleSize: { width: 0.5, height: 4, depth: 1 },
    boundaryY: 10,
    mapSkin: 0x001133,
    obstacleCount: 2
  };
  let config = { ...defaultConfig };
  if (configJson) {
    try {
      const parsed = typeof configJson === 'string' ? JSON.parse(configJson) : configJson;
      config = { ...config, ...parsed };
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

  // 장애물 생성
  const obstacles = [];
  for (let i = 0; i < config.obstacleCount; i++) {
    const obstacle = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), obstacleMaterial);
    obstacle.position.set(
      (Math.random() * 20) - 10,
      (Math.random() * (config.boundaryY * 2 - 2)) - (config.boundaryY - 1),
      0
    );
    scene.add(obstacle);
    obstacles.push(obstacle);
  }

  // 키 입력 이벤트 처리
  const keysPressed = {};
  window.addEventListener('keydown', (e) => { keysPressed[e.code] = true; });
  window.addEventListener('keyup', (e) => { keysPressed[e.code] = false; });

  let gameScore = { player1: 0, player2: 0 };
  let gameOver = false;

  // 게임 로직 업데이트 함수
  function update() {
    if (gameOver) return;

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

    ball.position.add(ballVelocity);

    // 위/아래 경계 반사
    if (ball.position.y + 0.5 > config.boundaryY || ball.position.y - 0.5 < -config.boundaryY) {
      ballVelocity.y = -ballVelocity.y;
    }

    // 점수 처리
    if (ball.position.x - 0.5 < -13) {
      gameScore.player2++;
      if (gameScore.player2 >= config.winningScore) {
        endGame("Player 2 Wins!");
        return;
      }
      resetBall(1);
    } else if (ball.position.x + 0.5 > 13) {
      gameScore.player1++;
      if (gameScore.player1 >= config.winningScore) {
        endGame("Player 1 Wins!");
        return;
      }
      resetBall(-1);
    }

    // 패들과 충돌 처리
    if (
      ball.position.x - 0.5 < leftPaddle.position.x + config.paddleSize.width / 2 &&
      Math.abs(ball.position.y - leftPaddle.position.y) < config.paddleSize.height / 2 + 0.5
    ) {
      ballVelocity.x = Math.abs(ballVelocity.x);
    }
    if (
      ball.position.x + 0.5 > rightPaddle.position.x - config.paddleSize.width / 2 &&
      Math.abs(ball.position.y - rightPaddle.position.y) < config.paddleSize.height / 2 + 0.5
    ) {
      ballVelocity.x = -Math.abs(ballVelocity.x);
    }

    // 장애물과 충돌 처리
    obstacles.forEach(obstacle => {
      const ballBox = new THREE.Box3().setFromObject(ball);
      const obstacleBox = new THREE.Box3().setFromObject(obstacle);
      if (ballBox.intersectsBox(obstacleBox)) {
        ballVelocity.x = -ballVelocity.x;
        ballVelocity.y = -ballVelocity.y;
      }
    });

    document.getElementById('scoreBoard').innerText = `Player1: ${gameScore.player1} | Player2: ${gameScore.player2}`;
  }

  // 득점 후 공 초기화 함수
  function resetBall(direction) {
    ball.position.set(0, 0, 0);
    ballVelocity.set(
      config.ballSpeed * direction,
      config.ballSpeed * (Math.random() * 0.5 - 0.25),
      0
    );
  }

  // 게임 종료 및 승자 처리 함수
  function endGame(message) {
    gameOver = true;
    const winnerMessage = document.getElementById('winnerMessage');

    const currentMatch = JSON.parse(sessionStorage.getItem('currentMatch'));
    const matches = JSON.parse(sessionStorage.getItem('matches')) || [];

    let winnerName = message.includes("Player 1") ? currentMatch.player1 : currentMatch.player2;

    winnerMessage.innerHTML = `
      <div style="text-align: center;">
        <div style="font-size: 24px; margin-bottom: 10px;">${winnerName} 승리!</div>
        <div>최종 스코어: ${gameScore.player1} - ${gameScore.player2}</div>
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

    document.getElementById('exitButton').addEventListener('click', () => {
      window.location.hash = '#gameplay/tournament';
    });
  }

  // 애니메이션 루프
  function animate() {
    if (!gameOver) {
      requestAnimationFrame(animate);
    }
    update();
    renderer.render(scene, camera);
  }
  animate();
}

export { GamePlayPage };
