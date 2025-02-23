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

      // 1) 공 속도
      //    예) session 값(1.75)을 기본 값(0.6)에 곱하는 식 등
      if (parsed.ballSpeed) {
        config.ballSpeed = defaultConfig.ballSpeed * parsed.ballSpeed;
      }

      // 2) 패들 크기
      //    sessionStorage에는 단일 숫자(멀티플라이어)만 있으므로, 기본 높이에 곱해서 최종 height를 만든다.
      if (parsed.paddleSize) {
        config.paddleSize = {
          ...defaultConfig.paddleSize,
          height: defaultConfig.paddleSize.height * parsed.paddleSize,
        };
      }

      // 3) 장애물 수
      if (parsed.obstacles) {
        config.obstacleCount = parsed.obstacles;
      }

      // 4) 그 외 필요한 옵션이 있다면 여기서 반영
      //    ex) players, winningScore 등등
      
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
  window.addEventListener('keydown', (e) => {
    console.log('Pressed:', e.code);
    keysPressed[e.code] = true;
  });
  
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

  // 게임 종료 및 승자 처리 및 매치 결과 전송 함수 (비동기로 동작)
async function endGame(message) {
  // 게임 종료 플래그 설정
  gameOver = true;
  const winnerMessage = document.getElementById('winnerMessage');

  // 세션에서 현재 매치 정보와 매치 목록을 불러옴
  const currentMatch = JSON.parse(sessionStorage.getItem('currentMatch'));
  const matches = JSON.parse(sessionStorage.getItem('matches')) || [];

  // 승리자 이름 결정 (여기서는 "Player 1"이 포함되면 currentMatch.player1이 승리했다고 가정)
  let winnerName = message.includes("Player 1") ? currentMatch.player1 : currentMatch.player2;
  
  // 게임 결과: logged-in 사용자가 player1이라고 가정하면,
  // 승리 메시지에 따라 "win" 또는 "lose" 결정 (draw의 경우 추가 로직 필요)
  const gameResult = message.includes("Player 1") ? "win" : "lose";

  // 승리 메시지 및 최종 스코어 출력
  winnerMessage.innerHTML = `
    <div style="text-align: center;">
      <div style="font-size: 24px; margin-bottom: 10px;">${winnerName} 승리!</div>
      <div>최종 스코어: ${gameScore.player1} - ${gameScore.player2}</div>
      <button id="exitButton" class="btn btn-primary" style="margin-top: 20px;">토너먼트로 돌아가기</button>
    </div>
  `;
  winnerMessage.style.display = 'block';

  // 매치 목록에서 현재 매치 업데이트
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

  // 이미 종료된 매치 ID 목록 업데이트 (추후 중복 플레이 방지 등)
  let finishedGames = JSON.parse(sessionStorage.getItem('finishedGames')) || [];
  if (currentMatch.id) {
    finishedGames.push(currentMatch.id);
    sessionStorage.setItem('finishedGames', JSON.stringify(finishedGames));
  }
  sessionStorage.setItem('matches', JSON.stringify(matches));

  // 백엔드에 전송할 데이터 구성
  const matchResultData = {
    seesion_id: currentMatch.id, // 나중에 오타 수정하지 seesion -> session
    // 상대방 이름: logged-in 사용자가 player1이면 상대는 player2, 아니면 player1
    guestname: message.includes("Player 1") ? currentMatch.player2 : currentMatch.player1,
    // 유저 점수: logged-in 사용자의 점수를 기준으로 설정
    user_score: message.includes("Player 1") ? gameScore.player1 : gameScore.player2,
    // 상대 점수
    guest_score: message.includes("Player 1") ? gameScore.player2 : gameScore.player1,
    // 게임 결과 (win/lose/draw)
    game_result: "win",
    // 필요시 추가 데이터를 여기에 포함할 수 있음
  };

  // API 호출: JWT 토큰은 세션스토리지에서 가져와 Authorization 헤더에 담음
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

  // '토너먼트로 돌아가기' 버튼 클릭 시 토너먼트 페이지로 이동
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
