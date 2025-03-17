import { getProfileData, postLogout, postProfileImage } from "../../api/scriptApi.js";
import { renderMatchHistory } from "../../components/matchHistory.js";
import { renderFriends } from "../../components/friends.js";
import { renderSettings } from "../../components/setting.js";
import { trans } from '../../language.js'
import { removeCookie } from "../../validation/cookie.js";

function ProfilePage() {
  const container = document.createElement('div');
  container.className = 'container py-4 bg-white rounded-4 shadow p-4 mx-auto text-center mt-5';
  container.innerHTML = `
        <!-- Profile Section -->
        <div class="mb-4">
          <img src="/static/profile.jpg" alt="Profile" class="profile-img mb-1 rounded-circle">
          <h2 class="h4 mb-3">
            <span class="fs-3 fw-bold"></span>
          </h2>
          <button id="profile-upload-btn" class="btn btn-secondary">
            <span class="fw-bold">${trans[window.curLang].profileUpload}</span>
          </button>
          <!-- 파일 선택을 위한 숨겨진 input -->
          <input type="file" id="profile-image-input" style="display: none;" accept="image/*">
        </div>

        <!-- Stats Section -->
        <div class="row g-3 mb-4 justify-content-center">
          <div class="col-3">
            <div class="stat-card bg-purple text-white p-2 rounded-top">
              <span class="fs-5 fw-bold">${trans[window.curLang].total}</span>
            </div>
            <div class="text-center fw-bold bg-dark rounded-bottom">
              <span class="fs-5 fw-bold text-white">0</span>
            </div>
          </div>
          <div class="col-3">
            <div class="stat-card bg-primary text-white p-2 rounded-top">
              <span class="fs-5 fw-bold">${trans[window.curLang].wins}</span>
            </div>
            <div class="text-center fw-bold bg-dark rounded-bottom">
              <span class="fs-5 fw-bold text-white">0</span>
            </div>
          </div>
          <div class="col-3">
            <div class="stat-card bg-danger text-white p-2 rounded-top">
              <span class="fs-5 fw-bold">${trans[window.curLang].losses}</span>
            </div>
            <div class="text-center fw-bold bg-dark rounded-bottom">
              <span class="fs-5 fw-bold text-white">0</span>
            </div>
          </div>
        </div>

        <!-- Accordion Sections -->
        <div class="accordion mt-4">
          <div class="accordion-item mb-3 border-0">
            <button class="accordion-toggle w-100 p-3 text-start bg-white rounded-3 shadow-sm d-flex justify-content-between align-items-center" data-content="matchHistory">
              <span class="fs-5 fw-bold">${trans[window.curLang].matchHistory}</span>
              <i class="bi bi-chevron-down"></i>
            </button>
            <div id="matchHistory" class="content p-3 bg-white rounded-3 mt-2" style="display: none;">
              <!-- matchHistory 내용 -->
            </div>
          </div>
          <div class="accordion-item mb-3 border-0">
            <button class="accordion-toggle w-100 p-3 text-start bg-white rounded-3 shadow-sm d-flex justify-content-between align-items-center" data-content="friends">
              <span class="fs-5 fw-bold">${trans[window.curLang].friends}</span>
              <i class="bi bi-chevron-down"></i>
            </button>
            <div id="friends" class="content p-3 bg-white rounded-3 mt-2" style="display: none;">
              <!-- Friends list will be rendered here -->
            </div>
          </div>
          <div class="accordion-item mb-3 border-0">
            <button class="accordion-toggle w-100 p-3 text-start bg-white rounded-3 shadow-sm d-flex justify-content-between align-items-center" data-content="setting">
              <span class="fs-5 fw-bold">${trans[window.curLang].setting}</span>
              <i class="bi bi-chevron-down"></i>
            </button>
            <div id="setting" class="content p-3 bg-white rounded-3 mt-2" style="display: none;">
              <!-- Setting content -->
            </div>
          </div>
          <button class="btn btn-outline-primary w-100 mb-2" id="logoutBtn">${trans[window.curLang].logout}</button>
        </div>
  `;

  function toggleContent(id) {
    const content = container.querySelector(`#${id}`);
    if (!content) return;

    const button = content.previousElementSibling;
    const icon = button.querySelector('.bi-chevron-down');

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

  const accordionToggles = container.querySelectorAll('.accordion-toggle');
  accordionToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      const id = toggle.getAttribute('data-content');
      toggleContent(id);
    });
  });

    const logoutBtn = container.querySelector('#logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', handleLogout);
    }

  updateProfilePage();
  initializeDropdowns();
  initProfileUpload(container);

  return container;
}

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

async function updateProfilePage() {
  try {
    const data = await getProfileData();
    const usernameElement = document.querySelector('.fs-3.fw-bold');
    if (usernameElement && data.username) {
      usernameElement.textContent = data.username;
    }
  
    const profileImg = document.querySelector('.profile-img');
    if (profileImg) {
      profileImg.src = data.profile_image || '/static/profile.jpg';
    }
  
    const statElements = document.querySelectorAll('.stat-card + .text-center .fs-5.fw-bold');
    if (statElements.length >= 3) {
      statElements[0].textContent = data.total  || 0; // Totals
      statElements[1].textContent = data.win    || 0; // Wins
      statElements[2].textContent = data.lose   || 0; // Losses
    }

    const isFriendEnabled = data.is_friend_enabled;
    const shareProfileImage = data.share_profile_image;
    const shareOnlineStatus = data.share_online_status;

    const settings = {
      isFriendEnabled,
      shareProfileImage,
      shareOnlineStatus
    };

    // console.log(settings);
    localStorage.setItem('privacySettings', JSON.stringify(settings));

  } catch (error) {
    alert('Error' + error.message);
  }
}

function initProfileUpload(container) {
  const uploadBtn = container.querySelector('#profile-upload-btn');
  const fileInput = container.querySelector('#profile-image-input');

  if (!uploadBtn || !fileInput) return;

  uploadBtn.addEventListener('click', () => {
    fileInput.click();
  });

  fileInput.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        await postProfileImage(file);
      } catch (error) {
        alert('Error: ' + error.message);
      }
    }
  });
}

async function handleLogout() {
  try {
    await postLogout();
    await removeCookie('jwt');
    alert('Success');
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
    alert("Error: " + error.message);
  }
}
export { ProfilePage, updateProfilePage };
