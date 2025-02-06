// ./srcs/scripts/pages/game/tournamant.js

function getTournamentPage() {
    // 컨테이너 생성
    const container = document.createElement('div');
    container.className = 'container py-5';
    
    // 페이지 내용 (백 버튼 + "Tournament" 제목 + 브래킷 + Next 버튼)
    container.innerHTML = `
      <!-- 상단 제목과 뒤로가기 버튼 -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="fw-bold">Tournament</h2>
        <button class="btn btn-outline-secondary" id="game-tournamant-back">
          <i class="bi bi-arrow-left"></i> Back
        </button>
      </div>

      <!-- 브래킷 3컬럼: Top 8 / Top 4 / Final -->
      <div class="row">
        <!-- Left Column: Top 8 -->
        <div class="col-12 col-md-4 mb-4">
          <h5 class="fw-bold mb-3">Top 8</h5>
  
          <!-- Match 1 -->
          <div class="border rounded p-3 mb-3">
            <div class="d-flex justify-content-between align-items-center">
              <span class="fw-bold fs-5">7 : 0</span>
              <small>2025/03/15</small>
            </div>
            <div class="mt-2 text-muted">username vs ???</div>
          </div>
  
          <!-- Match 2 -->
          <div class="border rounded p-3 mb-3">
            <div class="d-flex justify-content-between align-items-center">
              <span class="fw-bold fs-5">0 : 7</span>
              <small>2025/03/15</small>
            </div>
            <div class="mt-2 text-muted">username vs username</div>
          </div>
  
          <!-- Match 3 (다음 플레이 강조) -->
          <div class="border border-2 rounded p-3 mb-3" style="border-color: #6e44ff !important;">
            <div class="text-primary fw-bold">Next play</div>
            <div class="d-flex justify-content-between align-items-center">
              <span class="fw-bold fs-5">0 : 0</span>
              <small>2025/03/15</small>
            </div>
            <div class="mt-2 text-muted">username vs username</div>
          </div>
  
          <!-- Match 4 (Waiting...) -->
          <div class="border rounded p-3">
            <div class="text-secondary fw-bold">Waiting..</div>
            <div class="d-flex justify-content-between align-items-center">
              <span class="fw-bold fs-5">0 : 0</span>
              <small>2025/03/15</small>
            </div>
            <div class="mt-2 text-muted">username vs username</div>
          </div>
        </div>
  
        <!-- Middle Column: Top 4 -->
        <div class="col-12 col-md-4 mb-4">
          <h5 class="fw-bold mb-3">Top 4</h5>
  
          <!-- Match 1 -->
          <div class="border rounded p-3 mb-3">
            <div class="text-secondary fw-bold">Waiting..</div>
            <div class="d-flex justify-content-between align-items-center">
              <span class="fw-bold fs-5">0 : 0</span>
              <small>2025/03/15</small>
            </div>
            <div class="mt-2 text-muted">??? vs ???</div>
          </div>
  
          <!-- Match 2 -->
          <div class="border rounded p-3">
            <div class="text-secondary fw-bold">Waiting..</div>
            <div class="d-flex justify-content-between align-items-center">
              <span class="fw-bold fs-5">0 : 0</span>
              <small>2025/03/15</small>
            </div>
            <div class="mt-2 text-muted">??? vs ???</div>
          </div>
        </div>
  
        <!-- Right Column: Final -->
        <div class="col-12 col-md-4 mb-4">
          <h5 class="fw-bold mb-3">Final</h5>
  
          <!-- Match 1 -->
          <div class="border rounded p-3">
            <div class="text-secondary fw-bold">Waiting..</div>
            <div class="d-flex justify-content-between align-items-center">
              <span class="fw-bold fs-5">0 : 0</span>
              <small>2025/03/15</small>
            </div>
            <div class="mt-2 text-muted">??? vs ???</div>
          </div>
        </div>
      </div>

      <!-- 하단 Next 버튼 (원한다면 라우트 이동 등 기능 처리) -->
      <div class="text-center">
        <button class="btn btn-primary w-50" id="game-tournamant-next">Next</button>
      </div>
    `;

    // Next 버튼
    const nextBtn = container.querySelector('#game-tournamant-next');
    nextBtn.addEventListener('click', () => {
      window.location.hash = '#gameplay/play';
    });

    // back 버튼
    const backBtn = container.querySelector('#game-tournamant-back');
    backBtn.addEventListener('click', () => {
      window.location.hash = '#gameplay/list';
    });
  
    return container;
  }
  
  // 전역 등록 (라우터에서 사용)
  window.getTournamentPage = getTournamentPage;
  