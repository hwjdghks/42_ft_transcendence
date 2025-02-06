// ./srcs/scripts/pages/game/gamePlay.js

// 예: 
// const config = JSON.stringify({
//   winningScore: 7,          // 승리 점수
//   ballSpeed: 0.8,           // 공속도(기본값 0.6보다 빠르게)
//   paddleSize: { width: 1, height: 8, depth: 1 },  
//   mapSkin: "#003366",       // 맵 배경색
//   obstacleCount: 3          // 장애물 3개
// });

// 라우터에서 사용 시: pages.gameplay = () => getPingPongGamePage(configStringOrObject);

function getPingPongGamePage(configJson) {
    const container = document.createElement("div");
    container.className = "game-container";
    container.innerHTML = `
      <style>
        .game-container { 
            margin-top: 60px;
            width: 600px; 
            height: 600px; 
            position: relative;
        }
        #scoreBoard {
            position: absolute;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            color: #fff;
            font-family: Arial, sans-serif;
            font-size: 24px;
            z-index: 10;
        }
        #gameContainer {
            width: 600px; 
            height: 600px;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        canvas { display: block; }
        /* 승리 메시지 스타일 */
        #winnerMessage {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: yellow;
            font-family: Arial, sans-serif;
            font-size: 36px;
            z-index: 20;
            display: none;
        }
      </style>
      <div id="scoreBoard">Player1: 0 | Player2: 0</div>
      <div id="gameContainer"></div>
      <div id="winnerMessage"></div>
      <!-- three.js (CDN) -->
      <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    `;
  
    // DOM이 완전히 준비된 후에 초기화 함수 호출
    setTimeout(() => {
      initializePingPongGame(configJson);
    }, 100);
  
    return container;
  }
  
  function initializePingPongGame(configJson) {
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
      try {
        const parsed = typeof configJson === 'string' ? JSON.parse(configJson) : configJson;
        config = { ...config, ...parsed };
      } catch (e) {
        console.error("Invalid config JSON, using default config:", e);
      }
    }
  
    // three.js 기본 세팅
    const container = document.getElementById('gameContainer');
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(config.mapSkin);
  
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.set(0, 0, 30);
    camera.lookAt(0, 0, 0);
  
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(600, 600, false);
    container.appendChild(renderer.domElement);
  
    // 재질
    const paddleMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
    const ballMaterial = new THREE.MeshPhongMaterial({ color: 0xffdd00 });
    const obstacleMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
  
    // 조명
    const ambientLight = new THREE.AmbientLight(0xaaaaaa);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(0, 1, 1);
    scene.add(directionalLight);
  
    // 패들 생성
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
  
    // 키보드 입력
    const keysPressed = {};
    window.addEventListener('keydown', (e) => { keysPressed[e.code] = true; });
    window.addEventListener('keyup', (e) => { keysPressed[e.code] = false; });
  
    let gameScore = { player1: 0, player2: 0 };
    let gameOver = false;
  
    // 업데이트
    function update() {
      if (gameOver) return;
  
      // 패들 이동 (W, S) / (I, K)
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
  
      // 상하 경계 충돌
      if (ball.position.y + 0.5 > config.boundaryY || ball.position.y - 0.5 < -config.boundaryY) {
        ballVelocity.y = -ballVelocity.y;
      }
  
      // 좌우 경계(득점 처리)
      if (ball.position.x - 0.5 < -13) {
        gameScore.player2++;
        if (gameScore.player2 >= config.winningScore) {
          endGame("Player 2 Wins!");
          return;
        }
        resetBall(1); // 오른쪽에서 시작
      } else if (ball.position.x + 0.5 > 13) {
        gameScore.player1++;
        if (gameScore.player1 >= config.winningScore) {
          endGame("Player 1 Wins!");
          return;
        }
        resetBall(-1); // 왼쪽에서 시작
      }
  
      // 패들과 충돌
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
  
      // 장애물과 충돌
      obstacles.forEach(obstacle => {
        const ballBox = new THREE.Box3().setFromObject(ball);
        const obstacleBox = new THREE.Box3().setFromObject(obstacle);
        if (ballBox.intersectsBox(obstacleBox)) {
          // 간단히 속도 반전
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
  
    function endGame(message) {
      gameOver = true;
      const winnerMessage = document.getElementById('winnerMessage');
      winnerMessage.innerHTML = `
        <div>${message}</div>
        <button id="exitButton" style="margin-top: 20px; padding: 10px 20px; font-size: 16px;">Go to Menu</button>
      `;
      winnerMessage.style.display = 'block';
  
      // 'Go to Menu' 버튼 동작 (SPA 라우터 사용 시 상황에 맞게 수정)
      document.getElementById('exitButton').addEventListener('click', () => {
        // SPA 라우터가 있다면 navigate, 없으면 메인 페이지로 이동
        window.location.hash = '#profile'; // 예: 프로필 페이지로 이동
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
  
  // 전역 등록(라우터 등에서 사용하기 위해)
  window.getPingPongGamePage = getPingPongGamePage;
