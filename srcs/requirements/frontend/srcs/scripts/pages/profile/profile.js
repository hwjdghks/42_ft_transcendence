// [1] 프로필 페이지 생성 함수 (라우터에서 import하여 사용)
export function ProfilePage() {
    const container = document.createElement('div');
    container.className = 'container py-5';
  
    // [2] UI 구조(HTML) 원본 그대로 보존
    container.innerHTML = `
        <div class="container py-5">
            <div class="bg-white rounded shadow p-4 max-width-800 mx-auto text-center">
                <!-- Profile Section -->
                <div class="mb-4">
                     <img src="/static/profile.jpg" alt="Profile" class="profile-img mb-3">
                    <h2 class="h4 mb-3">
                        <span class="fs-2 fw-bold">
                            username
                        </span>
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
                        <!-- 인라인 onclick 사용 -->
                        <button class="w-100 p-3 text-start bg-white rounded-3 shadow-sm d-flex justify-content-between align-items-center" 
                            data-content="matchHistory" onclick="toggleContent('matchHistory')">
                            <span class="fs-4 fw-bold">Match history</span>
                            <i class="bi bi-chevron-down"></i>
                        </button>
                        <div id="matchHistory" class="content p-3 bg-white rounded-3 mt-2 shadow-sm" style="display: none;">
                            <!-- matchHistory 내용 -->
                        </div>
                    </div>
                    <div class="accordion-item mb-3 border-0">
                        <button class="w-100 p-3 text-start bg-white rounded-3 shadow-sm d-flex justify-content-between align-items-center" 
                            data-content="friends" onclick="toggleContent('friends')">
                            <span class="fs-4 fw-bold">Friends</span>
                            <i class="bi bi-chevron-down"></i>
                        </button>
                        <div id="friends" class="content p-3 bg-white rounded-3 mt-2" style="display: none;">
                            <!-- Friends list will be rendered here -->
                        </div>
                    </div>
                    <div class="accordion-item mb-3 border-0">
                        <button class="w-100 p-3 text-start bg-white rounded-3 shadow-sm d-flex justify-content-between align-items-center" 
                            data-content="setting" onclick="toggleContent('setting')">
                            <span class="fs-4 fw-bold">Setting</span>
                            <i class="bi bi-chevron-down"></i>
                        </button>
                        <div id="setting" class="content p-3 bg-white rounded-3 mt-2" style="display: none;">
                            <!-- Setting content -->
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
  
    // dropdown 동작이 있다면 필요시 초기화
    initializeDropdowns();
  
    // API로부터 프로필 데이터 받아와 UI 업데이트
    fetchProfileData();
  
    initProfileUpload(container);
    // 최종적으로 container를 반환 (라우터에서 #app에 삽입)
    return container;
  }
  
  // [3] 인라인 onclick에서 사용되는 함수 (토글 로직)
  //     인라인 onclick이 전역 스코프(window)를 바라보므로,
  //     모듈만으로는 접근 불가 → export + window 할당
  export function toggleContent(id) {
    const content = document.getElementById(id);
    if (!content) return;
  
    const button = content.previousElementSibling;
    const icon = button.querySelector('.bi-chevron-down');
  
    // 다른 콘텐츠 닫기
    document.querySelectorAll('.content').forEach(el => {
        if (el.id !== id) {
            el.style.display = 'none';
            const prevBtn = el.previousElementSibling;
            if (prevBtn) {
                const prevIcon = prevBtn.querySelector('.bi-chevron-down');
                if (prevIcon) prevIcon.style.transform = 'rotate(0deg)';
            }
        }
    });
  
    // 현재 콘텐츠 토글
    if (content.style.display === 'none' || content.style.display === '') {
        content.style.display = 'block';
        if (icon) icon.style.transform = 'rotate(180deg)';
  
        // 필요한 경우 matchHistory/friends/setting에 대한 렌더링
        if (id === 'matchHistory') {
            content.innerHTML = loadMatchHistory(); // 예: matchHistory.js
        } else if (id === 'friends') {
            renderFriends();                       // 예: friends.js
        } else if (id === 'setting') {
            content.innerHTML = ''; 
            content.appendChild(renderSettings()); // 예: setting.js
        }
  
    } else {
        content.style.display = 'none';
        if (icon) icon.style.transform = 'rotate(0deg)';
    }
  }
  
  // 만약 이 함수가 반드시 전역 window에서 필요하다면:
  window.toggleContent = toggleContent;
  
  // [4] dropdown / accordions 초기화 (필요하다면)
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
  
  // [5] 프로필 API 호출 후, UI 업데이트
  async function fetchProfileData() {
    try {
        const token = sessionStorage.getItem('fa_token');
        const response = await fetch('https://localhost/api/users/profile/', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
  
        if (!response.ok) {
            throw new Error('Failed to fetch profile data');
        }
  
        const profileData = await response.json(); 
        updateProfilePage(profileData);
  
    } catch (error) {
        console.error('Error fetching profile data:', error);
    }
  }
  
  // [6] 프로필 데이터 반영 함수
  function updateProfilePage(data) {
    // 예시 data: { username: "...", stats: { totals: ..., wins: ..., losses: ..., draws: ... } }
  
    const usernameElement = document.querySelector('.fs-2.fw-bold');
    if (usernameElement && data.username) {
        usernameElement.textContent = data.username;
    }
  
    const stats = data.stats || {};
    const statElements = document.querySelectorAll('.stat-card + .text-center .fs-1.fw-bold');
    if (statElements.length >= 4) {
        statElements[0].textContent = stats.totals  || 0; // Totals
        statElements[1].textContent = stats.wins    || 0; // Wins
        statElements[2].textContent = stats.losses  || 0; // Losses
        statElements[3].textContent = stats.draws   || 0; // Draws
    }
  }
  
  async function uploadProfileImage(file) {
    const token = sessionStorage.getItem('fa_token');
    const formData = new FormData();
    formData.append('profile_image', file);
  
    try {
      const response = await fetch('https://localhost/api/users/upload/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      const data = await response.json();
      if (response.ok) {
        alert(data.message || "프로필 업로드 성공");
        console.log(data.profile_image_url);
        if (data.profile_image_url) {
            const profileImg = document.querySelector('.profile-img');
            if (profileImg) {
                profileImg.src = data.profile_image_url;

            }
          }
      } else {
        throw new Error(data.error || "프로필 업로드 실패");
      }
    } catch (error) {
      console.error("프로필 업로드 에러:", error);
      alert(error.message);
    }
  }
  
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
  