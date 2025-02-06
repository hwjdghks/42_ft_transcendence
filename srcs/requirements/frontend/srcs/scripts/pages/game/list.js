function getGamePlayerListPage() {
    const container = document.createElement('div');
    container.className = 'container py-5';
  
    // 내부 HTML
    container.innerHTML = `
      <!-- 상단 제목과 뒤로가기 버튼 -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="fw-bold">Player List</h2>
        <button class="btn btn-outline-secondary" id="game-list-back">
          <i class="bi bi-arrow-left"></i> Back
        </button>
      </div>
  
      <!-- 첫 번째 사용자 (성공 아이콘) -->
      <div class="mb-3">
        <label class="form-label">User 1</label>
        <div class="input-group">
          <input type="text" class="form-control" placeholder="username" value="username_sample">
          <!-- 오른쪽 체크 아이콘 -->
          <span class="input-group-text border-success text-success">
            <i class="bi bi-check-circle"></i>
          </span>
        </div>
      </div>
  
      <!-- 두 번째 사용자 (에러 아이콘 + 에러메시지) -->
      <div class="mb-3">
        <label class="form-label">User 1</label>
        <div class="input-group has-validation">
          <input type="text" class="form-control is-invalid" placeholder="username">
          <span class="input-group-text border-danger text-danger">
            <i class="bi bi-x-circle"></i>
          </span>
          <!-- 에러 메시지 -->
          <div class="invalid-feedback" style="display: block;">
            username rule
          </div>
        </div>
      </div>
  
      <!-- 나머지 사용자 입력 필드들 -->
      <div class="mb-3">
        <label class="form-label">User 1</label>
        <input type="text" class="form-control" placeholder="username">
      </div>
      <div class="mb-3">
        <label class="form-label">User 1</label>
        <input type="text" class="form-control" placeholder="username">
      </div>
      <div class="mb-3">
        <label class="form-label">User 1</label>
        <input type="text" class="form-control" placeholder="username">
      </div>
      <div class="mb-3">
        <label class="form-label">User 1</label>
        <input type="text" class="form-control" placeholder="username">
      </div>
      <div class="mb-3">
        <label class="form-label">User 1</label>
        <input type="text" class="form-control" placeholder="username">
      </div>
      <div class="mb-4">
        <label class="form-label">User 1</label>
        <input type="text" class="form-control" placeholder="username">
      </div>
  
      <!-- Next 버튼 -->
      <div class="text-center">
        <button class="btn btn-primary w-50" id="game-list-next">Next</button>
      </div>
    `;
  
    // Next 버튼 동작 예시
    const nextBtn = container.querySelector('#game-list-next');
    nextBtn.addEventListener('click', () => {
      window.location.hash = '#gameplay/tournamant';
    });

    // back 버튼
    const backBtn = container.querySelector('#game-list-back');
    backBtn.addEventListener('click', () => {
      window.location.hash = '#gameplay/option';
    });
  
    return container;
  }
  
  // 라우터에서 쓸 수 있게 전역에 등록
  window.getGamePlayerListPage = getGamePlayerListPage;
  