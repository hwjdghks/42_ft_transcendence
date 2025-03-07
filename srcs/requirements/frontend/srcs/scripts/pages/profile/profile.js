import { fetchProfileData, fetchLogout, uploadProfileImage } from "./profileApi.js";
import { renderMatchHistory } from "../../components/matchHistory.js";
import { renderFriends } from "../../components/friends.js";
import { renderSettings } from "../../components/setting.js";

/**
 * 프로필 페이지를 생성하여 반환하는 함수
 *
 * @returns {HTMLElement} 생성된 프로필 페이지 컨테이너 요소
 */
function ProfilePage() {
  const container = document.createElement('div');
  container.className = 'container py-5';
  container.innerHTML = `
    <div class="container py-5">
      <div class="bg-white rounded shadow p-4 max-width-800 mx-auto text-center">
        <!-- Profile Section -->
        <div class="mb-4">
          <img src="/static/profile.jpg" alt="Profile" class="profile-img mb-3">
          <h2 class="h4 mb-3">
            <span class="fs-2 fw-bold">username</span>
          </h2>
          <button id="profile-upload-btn" class="btn btn-secondary">
            <span class="fs-5 fw-bold">Profile Upload</span>
          </button>
          <!-- 파일 선택을 위한 숨겨진 input -->
          <input type="file" id="profile-image-input" style="display: none;" accept="image/*">
        </div>

        <!-- Stats Section -->
        <div class="row g-3 mb-4">
          <div class="col-3">
            <div class="stat-card bg-purple text-white p-3 rounded">
              <span class="fs-3 fw-bold">Totals</span>
            </div>
            <div class="text-center mt-2 fw-bold">
              <span class="fs-1 fw-bold">0</span>
            </div>
          </div>
          <div class="col-3">
            <div class="stat-card bg-primary text-white p-3 rounded">
              <span class="fs-3 fw-bold">Wins</span>
            </div>
            <div class="text-center mt-2 fw-bold">
              <span class="fs-1 fw-bold">0</span>
            </div>
          </div>
          <div class="col-3">
            <div class="stat-card bg-danger text-white p-3 rounded">
              <span class="fs-3 fw-bold">Losses</span>
            </div>
            <div class="text-center mt-2 fw-bold">
              <span class="fs-1 fw-bold">0</span>
            </div>
          </div>
          <div class="col-3">
            <div class="stat-card bg-secondary text-white p-3 rounded">
              <span class="fs-3 fw-bold">Draws</span>
            </div>
            <div class="text-center mt-2 fw-bold">
              <span class="fs-1 fw-bold">0</span>
            </div>
          </div>
        </div>

        <!-- Accordion Sections -->
        <div class="accordion mt-4">
          <div class="accordion-item mb-3 border-0">
            <button class="accordion-toggle w-100 p-3 text-start bg-white rounded-3 shadow-sm d-flex justify-content-between align-items-center" data-content="matchHistory">
              <span class="fs-4 fw-bold">Match history</span>
              <i class="bi bi-chevron-down"></i>
            </button>
            <div id="matchHistory" class="content p-3 bg-white rounded-3 mt-2 shadow-sm" style="display: none;">
              <!-- matchHistory 내용 -->
            </div>
          </div>
          <div class="accordion-item mb-3 border-0">
            <button class="accordion-toggle w-100 p-3 text-start bg-white rounded-3 shadow-sm d-flex justify-content-between align-items-center" data-content="friends">
              <span class="fs-4 fw-bold">Friends</span>
              <i class="bi bi-chevron-down"></i>
            </button>
            <div id="friends" class="content p-3 bg-white rounded-3 mt-2" style="display: none;">
              <!-- Friends list will be rendered here -->
            </div>
          </div>
          <div class="accordion-item mb-3 border-0">
            <button class="accordion-toggle w-100 p-3 text-start bg-white rounded-3 shadow-sm d-flex justify-content-between align-items-center" data-content="setting">
              <span class="fs-4 fw-bold">Setting</span>
              <i class="bi bi-chevron-down"></i>
            </button>
            <div id="setting" class="content p-3 bg-white rounded-3 mt-2" style="display: none;">
              <!-- Setting content -->
            </div>
          </div>
          <button class="btn btn-outline-primary w-100 mb-2" id="logoutBtn">Log out</button>
        </div>
      </div>
    </div>
  `;

  // ProfilePage 내부에서만 사용되는 toggleContent 함수
  function toggleContent(id) {
    const content = container.querySelector(`#${id}`);
    if (!content) return;

    const button = content.previousElementSibling;
    const icon = button.querySelector('.bi-chevron-down');

    // 다른 아코디언 콘텐츠는 모두 숨기기
    container.querySelectorAll('.content').forEach(el => {
      if (el.id !== id) {
        el.style.display = 'none';
        const prevBtn = el.previousElementSibling;
        if (prevBtn) {
          const prevIcon = prevBtn.querySelector('.bi-chevron-down');
          if (prevIcon) prevIcon.style.transform = 'rotate(0deg)';
        }
      }
    });

    if (content.style.display === 'none' || content.style.display === '') {
      content.style.display = 'block';
      if (icon) icon.style.transform = 'rotate(180deg)';

      // 각 콘텐츠 영역별 처리
      if (id === 'matchHistory') {
        renderMatchHistory();
      } else if (id === 'friends') {
        renderFriends();
      } else if (id === 'setting') {
        renderSettings();
      }
    } else {
      content.style.display = 'none';
    }
  }

  // 아코디언 토글 버튼에 이벤트 리스너 등록
  const accordionToggles = container.querySelectorAll('.accordion-toggle');
  accordionToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      const id = toggle.getAttribute('data-content');
      toggleContent(id);
    });
  });

    // 로그아웃 버튼 이벤트 등록
    const logoutBtn = container.querySelector('#logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', handleLogout);
    }

  // 프로필 데이터, 드롭다운, 프로필 업로드 초기화
  updateProfilePage();
  initializeDropdowns();
  initProfileUpload(container);

  return container;
}

/**
 * 드롭다운 및 아코디언 관련 초기화 함수
 * 각 드롭다운 토글 버튼에 클릭 이벤트를 등록하고, 문서 클릭 시 드롭다운 메뉴를 숨김
 *
 * @returns {void}
 */
function initializeDropdowns() {
  document.querySelectorAll('.dropdown').forEach(dropdown => {
    const toggle = dropdown.querySelector('.dropdown-toggle');
    const menu = dropdown.querySelector('.dropdown-menu');
    const chevron = toggle.querySelector('.chevron');

    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      menu.classList.toggle('show');
      chevron.classList.toggle('rotated');
    });

    document.addEventListener('click', () => {
      menu.classList.remove('show');
      chevron.classList.remove('rotated');
    });
  });
}

/**
 * 프로필 페이지의 정보를 업데이트하는 함수
 * 사용자 이름, 프로필 이미지 및 통계 정보를 data 객체의 값으로 갱신
 *
 * @param {Object} data 프로필 업데이트에 필요한 데이터
 * @param {string} [data.username] 사용자 이름
 * @param {string} [data.profile_image] 프로필 이미지 URL
 * @param {number} [data.total] 총 게임 수
 * @param {number} [data.win] 승리 수
 * @param {number} [data.lose] 패배 수
 * @param {number} [data.draw] 무승부 수
 */
async function updateProfilePage() {
  try {
    const data = await fetchProfileData();
    const usernameElement = document.querySelector('.fs-2.fw-bold');
    if (usernameElement && data.username) {
      usernameElement.textContent = data.username;
    }
  
    const profileImg = document.querySelector('.profile-img');
    if (profileImg) {
      profileImg.src = data.profile_image || '/static/profile.jpg';
    }
  
    const statElements = document.querySelectorAll('.stat-card + .text-center .fs-1.fw-bold');
    if (statElements.length >= 4) {
      statElements[0].textContent = data.total  || 0; // Totals
      statElements[1].textContent = data.win    || 0; // Wins
      statElements[2].textContent = data.lose   || 0; // Losses
      statElements[3].textContent = data.draw   || 0; // Draws
    }
  } catch (error) {
    alert('프로필 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.');
  }
}

/**
 * 프로필 업로드 기능을 담당하는 함수
 * 프로필 업로드 버튼과 파일 입력 이벤트를 등록하여 사용자가 이미지를 선택하면 업로드를 진행
 *
 * @param {HTMLElement} container 프로필 페이지가 포함된 컨테이너 요소
 */
function initProfileUpload(container) {
  const uploadBtn = container.querySelector('#profile-upload-btn');
  const fileInput = container.querySelector('#profile-image-input');

  if (!uploadBtn || !fileInput) return;

  uploadBtn.addEventListener('click', () => {
    fileInput.click();
  });

  fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
      uploadProfileImage(file);
    }
  });
}

/**
 * 로그아웃 기능을 담당하는 함수
 *
 * @returns {void}
 */
async function handleLogout() {
  try {
    const logoutLog = await fetchLogout();
    alert(logoutLog);

    // 세션 스토리지 클리어
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem("tournament_in_progress");
    sessionStorage.removeItem("game_option");
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("matches");
    sessionStorage.removeItem("currentMatch");

    setTimeout(() => {
      window.location.href = '#login';
    }, 1000);

  } catch (error) {
    alert(error);
  }
}

export { ProfilePage, updateProfilePage };
