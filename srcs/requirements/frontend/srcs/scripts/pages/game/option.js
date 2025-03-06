import { fetchProfileData } from '../profile/profileApi.js'
import { resetTournamentSession } from '../game/tournament.js'

// 모든 플레이어 입력에 대해 유효성 검증 후 시각적 피드백 및 Next 버튼 상태 업데이트
function updateValidationState(container) {
  const playerInputs = container.querySelectorAll('#playerInputs input');
  let names = [];
  let isAllValid = true;
  
  // 각 입력 필드 개별 유효성 검사 (빈 값, 영어 알파벳만, 최대 10자)
  playerInputs.forEach(input => {
    const trimmed = input.value.trim();
    let valid = true;
    let errorMsg = "";
    
    if (trimmed === "") {
      valid = false;
      errorMsg = "이름을 입력해주세요.";
    } else if (!/^[A-Za-z]+$/.test(trimmed)) {
      valid = false;
      errorMsg = "영어 알파벳만 입력 가능합니다.";
    } else if (trimmed.length > 10) {
      valid = false;
      errorMsg = "최대 10자까지 입력 가능합니다.";
    }
    
    const feedback = input.parentNode.querySelector('.invalid-feedback');
    if (input.dataset.touched === "true" && !valid) {
      input.classList.add("is-invalid");
      if (feedback) {
        feedback.textContent = errorMsg;
      }
      isAllValid = false;
    } else {
      input.classList.remove("is-invalid");
      if (feedback) {
        feedback.textContent = "";
      }
    }
    
    names.push(trimmed.toLowerCase());
  });
  
  // 중복 검사: 같은 이름이 두 개 이상이면 모두 invalid 처리
  const nameCounts = names.reduce((acc, name) => {
    if (name !== "") {
      acc[name] = (acc[name] || 0) + 1;
    }
    return acc;
  }, {});
  
  playerInputs.forEach(input => {
    const trimmed = input.value.trim().toLowerCase();
    const feedback = input.parentNode.querySelector('.invalid-feedback');
    if (trimmed !== "" && nameCounts[trimmed] > 1 && input.dataset.touched === "true") {
      input.classList.add("is-invalid");
      if (feedback) {
        feedback.textContent = "중복된 이름입니다.";
      }
      isAllValid = false;
    }
    if (input.classList.contains("is-invalid")) {
      isAllValid = false;
    }
  });
  
  // 최초 진입 시 아무 입력도 터치되지 않았다면 무조건 버튼 비활성화
  const anyTouched = Array.from(playerInputs).some(input => input.dataset.touched === "true");
  if (!anyTouched) {
    isAllValid = false;
  }
  
  // GameOptionPage의 Next 버튼은 id가 'game-option-next'를 사용
  const nextButton = container.querySelector('#game-option-next');
  if (nextButton) {
    nextButton.disabled = !isAllValid;
  }
}

// 플레이어 입력 필드를 렌더링하는 함수
function renderPlayerInputs(container, players) {
  const playerInputs = container.querySelector('#playerInputs');
  playerInputs.innerHTML = '';

  // 첫 번째 입력 필드 (수정 불가)
  const firstDiv = document.createElement('div');
  firstDiv.className = 'mb-3';
  const firstLabel = document.createElement('label');
  firstLabel.className = 'form-label';
  firstLabel.textContent = 'User 1';
  const firstInput = document.createElement('input');
  firstInput.type = 'text';
  firstInput.className = 'form-control';
  firstInput.placeholder = 'username';
  firstInput.disabled = true;
  firstInput.value = 'Loading';
  // 에러 메시지 엘리먼트 추가
  const firstFeedback = document.createElement('div');
  firstFeedback.className = 'invalid-feedback';
  
  firstDiv.appendChild(firstLabel);
  firstDiv.appendChild(firstInput);
  firstDiv.appendChild(firstFeedback);
  playerInputs.appendChild(firstDiv);

  fetchProfileData().then(data => {
    firstInput.value = data.username;
    updateValidationState(container);
    saveOptionsToSessionStorage(container);
  });

  // 나머지 플레이어 입력 필드 생성
  for (let i = 1; i < players; i++) {
    const div = document.createElement('div');
    div.className = 'mb-3';
    const label = document.createElement('label');
    label.className = 'form-label';
    label.textContent = `User ${i + 1}`;
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'form-control';
    input.placeholder = 'Enter username';
    
    const feedback = document.createElement('div');
    feedback.className = 'invalid-feedback';
    
    // blur 이벤트: 사용자가 입력 후 필드를 벗어나면 data-touched 플래그 설정
    input.addEventListener('blur', () => {
      input.dataset.touched = "true";
      updateValidationState(container);
    });
    
    // 입력 시 실시간 검증 및 옵션 저장 (영어 알파벳만 허용)
    input.addEventListener('input', () => {
      const cleanedValue = input.value.replace(/[^A-Za-z]/g, '');
      if (input.value !== cleanedValue) {
        input.value = cleanedValue;
      }
      updateValidationState(container);
      saveOptionsToSessionStorage(container);
    });
    
    div.appendChild(label);
    div.appendChild(input);
    div.appendChild(feedback);
    playerInputs.appendChild(div);
  }
  
  updateValidationState(container);
}

// 옵션 저장 함수 (플레이어 수, 패들 사이즈, 공 속도, 장애물 수, 플레이어 이름 배열 저장)
function saveOptionsToSessionStorage(container) {
  // 1. 플레이어 수 (data-players 속성이 있는 버튼에서 가져옴)
  const playersElement = container.querySelector('.btn-group .active[data-players]');
  const players = playersElement ? parseInt(playersElement.getAttribute('data-players'), 10) : 2;
  
  // 2. 패들 사이즈
  const rawPaddleSize = container
    .querySelectorAll('.btn-group')[1]
    .querySelector('.active')?.textContent.trim() || "1";
  const paddleMultiplier = rawPaddleSize.startsWith('x')
    ? parseFloat(rawPaddleSize.substring(1))
    : parseFloat(rawPaddleSize);
  
  // 3. 공 속도
  const rawBallSpeed = container
    .querySelectorAll('.btn-group')[2]
    .querySelector('.active')?.textContent.trim() || "1";
  const ballSpeed = rawBallSpeed.startsWith('x')
    ? parseFloat(rawBallSpeed.substring(1))
    : parseFloat(rawBallSpeed);
  
  // 4. 장애물 수
  const obstaclesElement = container
    .querySelectorAll('.btn-group')[3]
    .querySelector('.active');
  const obstacles = obstaclesElement ? parseInt(obstaclesElement.textContent.trim(), 10) : 0;
  
  // 5. 플레이어 이름 배열: 모든 인풋에서 값 추출 (첫 번째 플레이어 포함)
  const playerInputs = container.querySelectorAll('#playerInputs input');
  const playerListArr = Array.from(playerInputs).map(input => input.value.trim());
  
  const options = {
    players,
    paddleSize: paddleMultiplier,
    ballSpeed,
    obstacles,
  };
  
  sessionStorage.setItem('game_option', JSON.stringify(options));
  sessionStorage.setItem('playerList', JSON.stringify(playerListArr));
}

// --- 게임 옵션 페이지 ---
// 플레이어 입력, 옵션 설정 등 UI 구성 후, Next 버튼 클릭 시 최종 유효성(빈 값, 유효성, 첫번째 이름 비교) 체크
function GameOptionPage() {
  resetTournamentSession();
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
            <button type="button" class="btn btn-primary active" data-players="2">2</button>
            <button type="button" class="btn btn-outline-primary" data-players="4">4</button>
            <button type="button" class="btn btn-outline-primary" data-players="8">8</button>
          </div>
          <div id="playerInputs" class="mt-3"></div>
        </div>
      </div>

      <!-- Paddle Size Section -->
      <div class="card mb-4">
        <div class="card-body">
          <h5 class="card-title">Paddle Size</h5>
          <div class="btn-group w-100" role="group">
            <button type="button" class="btn btn-primary active">x1</button>
            <button type="button" class="btn btn-outline-primary">x1.2</button>
            <button type="button" class="btn btn-outline-primary">x1.5</button>
          </div>
        </div>
      </div>

      <!-- Ball Speed Section -->
      <div class="card mb-4">
        <div class="card-body">
          <h5 class="card-title">Ball Speed</h5>
          <div class="btn-group w-100" role="group">
            <button type="button" class="btn btn-primary active">x1</button>
            <button type="button" class="btn btn-outline-primary">x1.5</button>
            <button type="button" class="btn btn-outline-primary">x2.0</button>
          </div>
        </div>
      </div>

      <!-- Obstacles Section -->
      <div class="card mb-4">
        <div class="card-body">
          <h5 class="card-title">Obstacles Number</h5>
          <div class="btn-group w-100" role="group">
            <button type="button" class="btn btn-primary active">0</button>
            <button type="button" class="btn btn-outline-primary">1</button>
            <button type="button" class="btn btn-outline-primary">2</button>
          </div>
        </div>
      </div>

      <!-- Next Button -->
      <div class="text-center">
        <button class="btn btn-primary w-50" id="game-option-next" disabled>Next</button>
      </div>
  `;

  // 옵션 버튼 클릭 시 active 상태 전환 및 옵션 저장
  const btnGroups = container.querySelectorAll('.btn-group');
  btnGroups.forEach((btnGroup) => {
    btnGroup.addEventListener('click', (event) => {
      if (event.target.tagName === 'BUTTON') {
        btnGroup.querySelectorAll('button').forEach(btn => {
          btn.classList.remove('active', 'btn-primary');
          btn.classList.add('btn-outline-primary');
        });
        event.target.classList.add('active', 'btn-primary');
        event.target.classList.remove('btn-outline-primary');
        // data-players 버튼이면 플레이어 인풋 렌더링
        if (event.target.hasAttribute('data-players')) {
          const players = parseInt(event.target.getAttribute('data-players'));
          renderPlayerInputs(container, players);
        }
        saveOptionsToSessionStorage(container);
      }
    });    
  });

  // 초기 2인용 렌더링 및 검증
  renderPlayerInputs(container, 2);
  updateValidationState(container);

  // Next 버튼 클릭 시, 최종 검증 (빈값, 유효성, 첫 플레이어 비교) 후 토너먼트 페이지로 이동
  const nextButton = container.querySelector('#game-option-next');
  nextButton.addEventListener('click', async () => {
    saveOptionsToSessionStorage(container);
    sessionStorage.setItem('tournament_in_progress', 'true');
    window.location.hash = '#gameplay/tournament';
  });

  return container;
}

// --- 외부에서 사용할 수 있도록 export ---
export { GameOptionPage };
