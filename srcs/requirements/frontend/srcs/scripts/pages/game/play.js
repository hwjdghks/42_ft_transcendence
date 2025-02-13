function PingPongGamePage(configJson) {
  const container = document.createElement("div");
  container.className = "game-container";
  container.innerHTML = `
      <div id="scoreBoard">Player1: 0 | Player2: 0</div>
      <div id="gameContainer"></div>
      <div id="winnerMessage"></div>
  `;

  // DOM이 완전히 준비된 후에 게임 초기화
  setTimeout(() => {
    initializePingPongGame(configJson);
  }, 100);

  return container;
}

function initializePingPongGame(configJson) {
  // 현재 매치 정보 불러오기 (필요에 따라 사용)
  const currentMatch = JSON.parse(sessionStorage.getItem('currentMatch') || '{}');

  // 기본 옵션
  const defaultConfig = {
    winningScore: 7,
    ballSpeed: 0.6,
    paddleSpeed: 0.5,
    paddleSize: { width: 0.5, height: 4, depth: 1 },
    boundaryY: 10,
    mapSkin: 0x001133,
    obstacleCount: 2
  };

  // 전달된 config 병합
  let config = { ...defaultConfig };
  if (configJson) {
    let parsed;
    if (typeof configJson === 'string') {
      parsed = JSON.parse(configJson);
    } else {
      parsed = configJson;
    }
    config = { ...config, ...parsed };
  }

  // Three.js 관련 초기화는 별도의 함수로 분리
  const { scene, camera, renderer, paddleMaterial, ballMaterial, obstacleMaterial } = setupThreeJS(config);

  // 패들 생성 (Player1 vs Player2)
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

  // 키보드 입력 처리
  const keysPressed = {};
  window.addEventListener('keydown', (e) => { keysPressed[e.code] = true; });
  window.addEventListener('keyup', (e) => { keysPressed[e.code] = false; });

  let gameScore = { player1: 0, player2: 0 };
  let gameOver = false;

  function update() {
    if (gameOver) return;

    // 패들 이동 (W, S for Player1 / I, K for Player2)
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

    // 상하 경계 반사
    if (ball.position.y + 0.5 > config.boundaryY || ball.position.y - 0.5 < -config.boundaryY) {
      ballVelocity.y = -ballVelocity.y;
    }

    // 좌우 경계 (득점 처리)
    if (ball.position.x - 0.5 < -13) {
      // Player2 득점
      gameScore.player2++;
      if (gameScore.player2 >= config.winningScore) {
        endGame("Player 2 Wins!");
        return;
      }
      resetBall(1);
    } else if (ball.position.x + 0.5 > 13) {
      // Player1 득점
      gameScore.player1++;
      if (gameScore.player1 >= config.winningScore) {
        endGame("Player 1 Wins!");
        return;
      }
      resetBall(-1);
    }

    // 패들과의 충돌 처리
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

    // 점수판 업데이트
    document.getElementById('scoreBoard').innerText = `Player1: ${gameScore.player1} | Player2: ${gameScore.player2}`;
  }

  function resetBall(direction) {
    ball.position.set(0, 0, 0);
    ballVelocity.set(
      config.ballSpeed * direction,
      config.ballSpeed * (Math.random() * 0.5 - 0.25),
      0
    );
  }

  // 애니메이션 루프 실행
  animate();

  // 애니메이션 함수
  function animate() {
    if (!gameOver) {
      requestAnimationFrame(animate);
    }
    update();
    renderer.render(scene, camera);
  }

  // 게임 종료 처리 함수
  function endGame(message) {
    gameOver = true;
    const winnerMessage = document.getElementById('winnerMessage');

    // 세션스토리지에서 매치 정보 불러오기
    const currentMatch = JSON.parse(sessionStorage.getItem('currentMatch'));
    const matches = JSON.parse(sessionStorage.getItem('matches')) || [];

    let winnerName = message.includes("Player 1") ? currentMatch.player1 : currentMatch.player2;
    
    // 승리 메시지 표시
    winnerMessage.innerHTML = `
      <div style="text-align: center;">
        <div style="font-size: 24px; margin-bottom: 10px;">${winnerName} 승리!</div>
        <div>최종 스코어: ${gameScore.player1} - ${gameScore.player2}</div>
        <button id="exitButton" class="btn btn-primary" style="margin-top: 20px;">토너먼트로 돌아가기</button>
      </div>
    `;
    winnerMessage.style.display = 'block';

    // 매치 정보 업데이트
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

    // 세션스토리지 갱신
    sessionStorage.setItem('matches', JSON.stringify(matches));

    // 토너먼트로 돌아가기
    document.getElementById('exitButton').addEventListener('click', () => {
      window.location.hash = '#gameplay/tournament';
    });
  }
}

// Three.js 초기화 및 설정을 위한 별도 함수
function setupThreeJS(config) {
  // 게임 컨테이너
  const container = document.getElementById('gameContainer');

  // 씬 생성 및 배경 색상 설정
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(config.mapSkin);

  // 카메라 생성 및 설정
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
  camera.position.set(0, 0, 30);
  camera.lookAt(0, 0, 0);

  // 렌더러 생성 및 사이즈 설정
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(600, 600, false);
  container.appendChild(renderer.domElement);

  // 조명 추가
  const ambientLight = new THREE.AmbientLight(0xaaaaaa);
  scene.add(ambientLight);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
  directionalLight.position.set(0, 1, 1);
  scene.add(directionalLight);

  // 재질 생성
  const paddleMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
  const ballMaterial = new THREE.MeshPhongMaterial({ color: 0xffdd00 });
  const obstacleMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });

  return { scene, camera, renderer, paddleMaterial, ballMaterial, obstacleMaterial };
}

export { PingPongGamePage };
