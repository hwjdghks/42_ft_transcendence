// 게임 옵션 페이지 생성 함수
function GameOptionPage() {
  const container = document.createElement('div');
  container.className = 'container py-5';
  container.innerHTML = `
      <!-- Header Section -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="fw-bold">Game Option</h2>
      </div>

      <!-- Players Section -->
      <div class="card mb-4">
        <div class="card-body">
          <h5 class="card-title">Players</h5>
          <div class="btn-group w-100" role="group">
            <!-- data-players로 인원수 표시 -->
            <button type="button" class="btn btn-primary active" data-players="2">2</button>
            <button type="button" class="btn btn-outline-primary" data-players="4">4</button>
            <button type="button" class="btn btn-outline-primary" data-players="8">8</button>
          </div>

          <!-- Player Input Section (inside the card) -->
          <div id="playerInputs" class="mt-3">
          </div>
        </div>
      </div>

      <!-- Paddle Size Section -->
      <div class="card mb-4">
        <div class="card-body">
          <h5 class="card-title">Paddle Size</h5>
          <div class="btn-group w-100" role="group">
            <button type="button" class="btn btn-primary active">x1</button>
            <button type="button" class="btn btn-outline-primary">x1.25</button>
            <button type="button" class="btn btn-outline-primary">x1.5</button>
            <button type="button" class="btn btn-outline-primary">x1.75</button>
            <button type="button" class="btn btn-outline-primary">x2.0</button>
          </div>
        </div>
      </div>

      <!-- Ball Speed Section -->
      <div class="card mb-4">
        <div class="card-body">
          <h5 class="card-title">Ball Speed</h5>
          <div class="btn-group w-100" role="group">
            <button type="button" class="btn btn-primary active">x1</button>
            <button type="button" class="btn btn-outline-primary">x1.25</button>
            <button type="button" class="btn btn-outline-primary">x1.5</button>
            <button type="button" class="btn btn-outline-primary">x1.75</button>
            <button type="button" class="btn btn-outline-primary">x2.0</button>
          </div>
        </div>
      </div>

      <!-- Obstacles Section -->
      <div class="card mb-4">
        <div class="card-body">
          <h5 class="card-title">Obstacles Number</h5>
          <div class="btn-group w-100" role="group">
            <button type="button" class="btn btn-primary active">1</button>
            <button type="button" class="btn btn-outline-primary">2</button>
            <button type="button" class="btn btn-outline-primary">3</button>
            <button type="button" class="btn btn-outline-primary">4</button>
            <button type="button" class="btn btn-outline-primary">5</button>
          </div>
        </div>
      </div>

      <!-- Next Button -->
      <div class="text-center">
        <button class="btn btn-primary w-50" id="game-option-next">Next</button>
      </div>
  `;

  // .btn-group에 이벤트 리스너 설정
  const btnGroups = container.querySelectorAll('.btn-group');
  btnGroups.forEach((btnGroup) => {
    btnGroup.addEventListener('click', (event) => {
      if (event.target.tagName === 'BUTTON') {
        // 같은 그룹 내 모든 버튼의 active 제거
        btnGroup.querySelectorAll('button').forEach(btn => {
          btn.classList.remove('active', 'btn-primary');
          btn.classList.add('btn-outline-primary');
        });
    
        // 클릭된 버튼만 active 적용
        event.target.classList.add('active', 'btn-primary');
        event.target.classList.remove('btn-outline-primary');
    
        // data-players 속성이 있는 버튼인 경우에만 플레이어 인풋을 렌더링합니다.
        if (event.target.hasAttribute('data-players')) {
          const players = parseInt(event.target.getAttribute('data-players'));
          renderPlayerInputs(container, players);
        }
    
        // 선택 사항 저장
        saveOptionsToSessionStorage(container);
      }
    });    
  });

  // 초기 2인용 렌더링
  renderPlayerInputs(container, 2);

  // Next 버튼 이벤트 설정
  const nextButton = container.querySelector('#game-option-next');
  nextButton.addEventListener('click', () => {
    if (validateInputs(container)) {
      saveOptionsToSessionStorage(container);
      sessionStorage.setItem('tournament_in_progress', 'true');
      // 토너먼트 페이지로 이동
      window.location.hash = '#gameplay/tournament';
    } else {
      alert('모든 플레이어의 이름을 입력하세요.');
    }
  });

  return container;
}

// 플레이어 입력 필드를 렌더링하는 함수
function renderPlayerInputs(container, players) {
  const playerInputs = container.querySelector('#playerInputs');
  playerInputs.innerHTML = '';

  // User 1 (자기 이름으로 고정. 추후 fetch로 받아오기)
  playerInputs.innerHTML += `
    <div class="mb-3">
      <label class="form-label">User 1</label>
      <input type="text" class="form-control" placeholder="username" value="Me" disabled>
    </div>
  `;

  // api로 받아올 경우 아래 주석 해제
  // profileAPI.getProfileInfo()
  //   .then((profileData) => {
  //     const username = profileData.username;
  //     const user1Input = container.querySelector('#user1-container input');
  //     if (user1Input) {
  //       user1Input.value = username;
  //     }
  //   })
  //   .catch((error) => {
  //     console.error('Error fetching profile info', error);
  //   });

  // 나머지 인원 입력 필드 생성
  for (let i = 1; i < players; i++) {
    playerInputs.innerHTML += `
      <div class="mb-3">
        <label class="form-label">User ${i + 1}</label>
        <input type="text" class="form-control" placeholder="Enter username">
      </div>
    `;
  }

  // 플레이어 이름 입력할 때마다 저장
  const inputs = playerInputs.querySelectorAll('input:not([disabled])');
  inputs.forEach((input) => {
    input.addEventListener('input', () => saveOptionsToSessionStorage(container));
  });
}

function saveOptionsToSessionStorage(container) {
  // 1. 플레이어 수 (data-players 속성이 있는 버튼에서 가져옴)
  const playersElement = container.querySelector('.btn-group .active[data-players]');
  const players = playersElement ? parseInt(playersElement.getAttribute('data-players'), 10) : 2;
  
  // 2. 패들 사이즈: 텍스트가 "x1", "x1.25" 등으로 되어 있을 수 있으므로 "x" 제거 후 숫자형으로 변환
  const rawPaddleSize = container
    .querySelectorAll('.btn-group')[1]
    .querySelector('.active')?.textContent.trim() || "1";
  const paddleMultiplier = rawPaddleSize.startsWith('x')
    ? parseFloat(rawPaddleSize.substring(1))
    : parseFloat(rawPaddleSize);
  
  // 3. 공 속도: 텍스트가 "x1", "x1.25" 등으로 되어 있을 수 있으므로 "x" 제거 후 숫자형으로 변환
  const rawBallSpeed = container
    .querySelectorAll('.btn-group')[2]
    .querySelector('.active')?.textContent.trim() || "1";
  const ballSpeed = rawBallSpeed.startsWith('x')
    ? parseFloat(rawBallSpeed.substring(1))
    : parseFloat(rawBallSpeed);
  
  // 4. 장애물 수: 정수형으로 변환
  const obstaclesElement = container
    .querySelectorAll('.btn-group')[3]
    .querySelector('.active');
  const obstacles = obstaclesElement ? parseInt(obstaclesElement.textContent.trim(), 10) : 1;
  
  // 5. 플레이어 이름 배열: 첫 번째 입력은 고정값("Me")일 수 있으므로 모든 인풋에서 값 추출
  const playerInputs = container.querySelectorAll('#playerInputs input');
  const usernameArr = Array.from(playerInputs).map(input => input.value.trim());
  
  // 옵션 객체 구성 (paddleSize와 ballSpeed는 숫자형 multiplier로 저장)
  const options = {
    players,
    paddleSize: paddleMultiplier,
    ballSpeed,
    obstacles,
  };
  
  // sessionStorage에 JSON 문자열로 저장
  sessionStorage.setItem('game_option', JSON.stringify(options));
  sessionStorage.setItem('username', JSON.stringify(usernameArr));
}

// 입력값 검증 함수
function validateInputs(container) {
  const inputs = container.querySelectorAll('#playerInputs input:not([disabled])');
  return [...inputs].every(input => input.value.trim() !== '');
}

// 외부에서 사용할 수 있도록 GameOptionPage 함수 export
export { GameOptionPage };
