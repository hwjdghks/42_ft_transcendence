function getGameOptionPage() {
  const container = document.createElement('div');
  container.className ='container py-5';
  container.innerHTML = 
  `
    <div class="container py-5">
      <!-- Header Section -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="fw-bold">Game Option</h2>
        <button class="btn btn-outline-secondary">
          <i class="bi bi-arrow-left"></i> Back
        </button>
      </div>

      <!-- Players Section -->
      <div class="card mb-4">
        <div class="card-body">
          <h5 class="card-title">Players</h5>
          <div class="btn-group w-100" role="group">
            <button type="button" class="btn btn-primary active">2</button>
            <button type="button" class="btn btn-outline-primary">4</button>
            <button type="button" class="btn btn-outline-primary">8</button>
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

      <!-- Background Theme Section -->
      <div class="card mb-4">
        <div class="card-body">
          <h5 class="card-title">Background Theme</h5>
          <div class="btn-group w-100" role="group">
            <button type="button" class="btn btn-primary active">R</button>
            <button type="button" class="btn btn-outline-primary">G</button>
            <button type="button" class="btn btn-outline-primary">B</button>
            <button type="button" class="btn btn-outline-primary">W</button>
            <button type="button" class="btn btn-outline-primary">Black</button>
          </div>
        </div>
      </div>

      <!-- Next Button -->
      <div class="text-center">
        <button class="btn btn-success w-50" id="game-option-next">Next</button>
      </div>
    </div>
  `;
  // 3) 위에서 만든 container 내부의 요소를 찾아서 이벤트 리스너를 붙인다.
  //    예: btn-group 관련 클릭 이벤트
  const btnGroups = container.querySelectorAll('.btn-group');
  btnGroups.forEach(btnGroup => {
    btnGroup.addEventListener('click', (event) => {
      if (event.target.tagName === 'BUTTON') {
        // 1) 모든 버튼 초기화
        btnGroup.querySelectorAll('button').forEach(btn => {
          btn.classList.remove('active', 'btn-primary');
          btn.classList.add('btn-outline-primary');
        });
        // 2) 클릭된 버튼 활성화
        event.target.classList.add('active', 'btn-primary');
        event.target.classList.remove('btn-outline-primary');
      }
    });
  });

  // Next 버튼 이벤트 예시
  const nextButton = container.querySelector('#game-option-next');
  if (nextButton) {
    nextButton.addEventListener('click', () => {
      // 선택된 옵션 수집
      const options = {
        // 예: 첫 번째 .btn-group에서 active 버튼의 textContent
        players: container.querySelector('.btn-group:nth-of-type(1) .active')?.textContent.trim(),
        // ...
      };
      // 로컬 스토리지에 저장
      localStorage.setItem('gameOptions', JSON.stringify(options));
      // 라우터 이동
      window.location.hash = '#playerList';
    });
  }
  return container;
}

window.getGameOptionPage = getGameOptionPage;
