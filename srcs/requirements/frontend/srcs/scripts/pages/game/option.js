function getGameOptionPage() {
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

  // === 버튼 그룹 클릭 시 active 토글 로직 ===
  const btnGroups = container.querySelectorAll('.btn-group');
  btnGroups.forEach(btnGroup => {
    btnGroup.addEventListener('click', (event) => {
      if (event.target.tagName === 'BUTTON') {
        btnGroup.querySelectorAll('button').forEach(btn => {
          btn.classList.remove('active', 'btn-primary');
          btn.classList.add('btn-outline-primary');
        });
        event.target.classList.add('active', 'btn-primary');
        event.target.classList.remove('btn-outline-primary');

        // 플레이어 인원수 버튼을 클릭했을 때만
        const players = parseInt(event.target.getAttribute('data-players'));
        if (!isNaN(players)) {
          renderPlayerInputs(players);
        }

        // 선택 사항을 저장
        saveOptionsToSessionStorage();
      }
    });
  });

  function renderPlayerInputs(players) {
    const playerInputs = container.querySelector('#playerInputs');
    playerInputs.innerHTML = '';

    // User 1 (고정, 본인 이름이라 가정. 실제 로그인 연동 시 수정)
    playerInputs.innerHTML += `
      <div class="mb-3">
        <label class="form-label">User 1</label>
        <input type="text" class="form-control" placeholder="username" value="Me" disabled>
      </div>
    `;

    // 나머지 인원 입력
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
    inputs.forEach(input => {
      input.addEventListener('input', saveOptionsToSessionStorage);
    });
  }

  // 처음에는 2인용(기본)으로 렌더링
  renderPlayerInputs(2);

  // Next 버튼
  const nextButton = container.querySelector('#game-option-next');
  nextButton.addEventListener('click', () => {
    if (validateInputs()) {
      saveOptionsToSessionStorage();
      // 토너먼트 페이지로 이동
      window.location.hash = '#gameplay/tournament';
    } else {
      alert('모든 플레이어의 이름을 입력하세요.');
    }
  });

  function saveOptionsToSessionStorage() {
    const players = container.querySelector('.btn-group .active[data-players]')?.getAttribute('data-players') || '2';
    const paddleSize = container.querySelectorAll('.btn-group')[1].querySelector('.active')?.textContent;
    const ballSpeed = container.querySelectorAll('.btn-group')[2].querySelector('.active')?.textContent;
    const obstacles = container.querySelectorAll('.btn-group')[3].querySelector('.active')?.textContent;

    // 플레이어 이름들을 배열 형태로 수집
    const playerInputs = container.querySelectorAll('#playerInputs input');
    const usernameArr = [...playerInputs].map(input => input.value);

    // game_option 예시 (원하면 확장 가능)
    const options = {
      players,
      paddleSize,
      ballSpeed,
      obstacles,
    };
    // 필요한 경우 유지
    sessionStorage.setItem('game_option', JSON.stringify(options));

    // Tournament 페이지에서 사용할 플레이어 이름 ()
    sessionStorage.setItem('username', JSON.stringify(usernameArr));
  }

  function validateInputs() {
    const inputs = container.querySelectorAll('#playerInputs input:not([disabled])');
    return [...inputs].every(input => input.value.trim() !== '');
  }

  return container;
}

window.getGameOptionPage = getGameOptionPage;
