// 프로필 username을 API에서 가져오는 함수
async function fetchProfileUsername() {
  const token = sessionStorage.getItem('fa_token');
  try {
    const response = await fetch('https://localhost/api/users/profile/', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    if (response.ok) {
      const data = await response.json();
      return data.username || "Me";
    } else {
      console.error("프로필 username을 가져오지 못했습니다.");
    }
  } catch (error) {
    console.error("프로필 username 호출 에러:", error);
  }
  return "Me"; // 기본값
}

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
    
    // 인풋의 부모 요소에 있는 invalid-feedback 엘리먼트를 찾음
    const feedback = input.parentNode.querySelector('.invalid-feedback');
    if (input.dataset.touched === "true" && !valid) {
      input.classList.add("is-invalid");
      if (feedback) {
        feedback.textContent = errorMsg;
      }
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
  
  // Next 버튼 활성화 여부 업데이트
  const nextButton = container.querySelector('#game-option-next');
  nextButton.disabled = !isAllValid;
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
  firstInput.value = 'Me';
  // 에러 메시지 엘리먼트 추가
  const firstFeedback = document.createElement('div');
  firstFeedback.className = 'invalid-feedback';
  
  firstDiv.appendChild(firstLabel);
  firstDiv.appendChild(firstInput);
  firstDiv.appendChild(firstFeedback);
  playerInputs.appendChild(firstDiv);

  // API 호출 후 첫 번째 플레이어 이름 업데이트 및 유효성 검사 갱신
  fetchProfileUsername().then(username => {
    firstInput.value = username;
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
    
    // 에러 메시지 엘리먼트 추가
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
  
  // 새 플레이어 인풋 생성 후에도 Next 버튼 상태 업데이트
  updateValidationState(container);
}

// 옵션 저장 함수
function saveOptionsToSessionStorage(container) {
  // 1. 플레이어 수 (data-players 속성이 있는 버튼에서 가져옴)
  const playersElement = container.querySelector('.btn-group .active[data-players]');
  const players = playersElement ? parseInt(playersElement.getAttribute('data-players'), 10) : 2;
  
  // 2. 패들 사이즈: "x1", "x1.2" 등으로 되어 있을 수 있으므로 "x" 제거 후 숫자형 변환
  const rawPaddleSize = container
    .querySelectorAll('.btn-group')[1]
    .querySelector('.active')?.textContent.trim() || "1";
  const paddleMultiplier = rawPaddleSize.startsWith('x')
    ? parseFloat(rawPaddleSize.substring(1))
    : parseFloat(rawPaddleSize);
  
  // 3. 공 속도: "x1", "x1.5" 등으로 되어 있을 수 있으므로 "x" 제거 후 숫자형 변환
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
  const obstacles = obstaclesElement ? parseInt(obstaclesElement.textContent.trim(), 10) : 0;
  
  // 5. 플레이어 이름 배열: 모든 인풋에서 값 추출 (첫 번째 플레이어 포함)
  const playerInputs = container.querySelectorAll('#playerInputs input');
  const usernameArr = Array.from(playerInputs).map(input => input.value.trim());
  
  // 옵션 객체 구성 (paddleSize와 ballSpeed는 숫자형 multiplier로 저장)
  const options = {
    players,
    paddleSize: paddleMultiplier,
    ballSpeed,
    obstacles,
  };
  
  sessionStorage.setItem('game_option', JSON.stringify(options));
  sessionStorage.setItem('username', JSON.stringify(usernameArr));
}

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
          <h5 class="card-title">
            Players
          </h5>
          <div class="btn-group w-100" role="group">
            <!-- data-players로 인원수 표시 -->
            <button type="button" class="btn btn-primary active" data-players="2">2</button>
            <button type="button" class="btn btn-outline-primary" data-players="4">4</button>
            <button type="button" class="btn btn-outline-primary" data-players="8">8</button>
          </div>

          <!-- Player Input Section (inside the card) -->
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

  // 옵션 버튼 선택 시 이벤트 리스너 설정
  const btnGroups = container.querySelectorAll('.btn-group');
  btnGroups.forEach((btnGroup) => {
    btnGroup.addEventListener('click', (event) => {
      if (event.target.tagName === 'BUTTON') {
        // 같은 그룹 내 모든 버튼의 active 제거
        btnGroup.querySelectorAll('button').forEach(btn => {
          btn.classList.remove('active', 'btn-primary');
          btn.classList.add('btn-outline-primary');
        });
    
        // 클릭된 버튼에 active 적용
        event.target.classList.add('active', 'btn-primary');
        event.target.classList.remove('btn-outline-primary');
    
        // data-players 속성이 있으면 플레이어 인풋 렌더링
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
    if (!nextButton.disabled) {
      saveOptionsToSessionStorage(container);
      sessionStorage.setItem('tournament_in_progress', 'true');
      // 토너먼트 페이지로 이동
      window.location.hash = '#gameplay/tournament';
    }
  });

  return container;
}

// 외부에서 사용할 수 있도록 GameOptionPage 함수 export
export { GameOptionPage };
