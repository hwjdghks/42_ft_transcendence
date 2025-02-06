// ./srcs/scripts/pages/game/gamePlayerList.js

function getGamePlayerListPage() {
    // 컨테이너 div 생성
    const container = document.createElement('div');
    container.className = 'container py-5';
    container.style.maxWidth = '600px';
  
    // 내부 HTML
    container.innerHTML = `
      <!-- 상단 제목과 뒤로가기 버튼 -->
      <div class="d-flex align-items-center mb-4">
      <!-- 페이지 제목 -->
      <h2 class="fw-bold mb-0">Player List</h2>
        <!-- 뒤로가기 -->
        <button class="btn btn-link text-decoration-none text-dark me-3" onclick="window.history.back()">
          <i class="bi bi-arrow-left fs-4"></i>
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
        <button class="btn btn-primary w-50" id="playerListNextBtn">Next</button>
      </div>
    `;
  
    // Next 버튼 동작 예시
    const nextBtn = container.querySelector('#playerListNextBtn');
    nextBtn.addEventListener('click', () => {
      // 예: 다음 라우트(#gameplay)로 이동, 혹은 다른 기능 등
      window.location.hash = '#tournamant';
    });
  
    return container;
  }
  
  // 라우터에서 쓸 수 있게 전역에 등록
  window.getGamePlayerListPage = getGamePlayerListPage;
  