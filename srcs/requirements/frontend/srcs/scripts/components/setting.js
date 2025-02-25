// setting.js
import { createDeleteAccountModal } from './deleteAccountModal.js';

function renderSettings() {
    const container = document.createElement('div');
    container.className = 'container py-5';
  
    container.innerHTML = `
      <div class="bg-white rounded shadow p-4 max-width-800 mx-auto text-center">
          <!-- Setting Form -->
          <h2 class="fs-2 fw-bold mb-4">Setting</h2>
  
          <!-- Username Section -->
          <div class="mb-3">
              <label for="username" class="form-label">Username</label>
              <input type="text" class="form-control" id="username" placeholder="Enter your username">
          </div>
  
          <!-- Password Section -->
          <div class="mb-3">
              <label for="password" class="form-label">Password</label>
              <input type="password" class="form-control" id="password" placeholder="Enter your password">
          </div>
  
          <!-- Language Section -->
          <div class="mb-3">
              <label for="language" class="form-label">Language</label>
              <select class="form-select" id="language">
                  <option value="korean">Korean</option>
                  <option value="english">English</option>
                  <!-- Add more languages as needed -->
              </select>
          </div>
  
          <!-- Buttons Section -->
          <button class="btn btn-purple w-100 mb-2">Change data</button>
          <button class="btn btn-outline-primary w-100 mb-2" id="logoutBtn">Log out</button>
          <button class="btn btn-danger w-100" id="deleteAccountBtn">Delete account</button>
          <div id="setting-message" class="mt-3"></div>
      </div>
    `;

    const logoutBtn = container.querySelector('#logoutBtn');
    logoutBtn.addEventListener('click', handleLogout);

    // 모달이 없으면 생성
    if (!document.getElementById('deleteAccountModal')) {
        createDeleteAccountModal();
    }

    // Delete Account 버튼 클릭 시 모달 표시
    const deleteAccountBtn = container.querySelector('#deleteAccountBtn');
    deleteAccountBtn.addEventListener('click', () => {
        const modal = new bootstrap.Modal(document.getElementById('deleteAccountModal'));
        modal.show();
    });
  
    return container;
  }

function showMessage(message, type) {
    const messageDiv = document.getElementById('setting-message');
    if (!messageDiv) return;

    messageDiv.textContent = message;
    messageDiv.className = `alert ${type === 'success' ? 'alert-success' : 'alert-danger'}`;
}

async function fetchLogout() {
    const token = sessionStorage.getItem('fa_token');
    const response = await fetch('https://localhost/api/users/signout/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error('Logout failed');
    }

    return await response.json();
}


async function handleLogout() {
    try {
        const response = await fetchLogout();
        showMessage(response.message, 'success');
        
        // 세션 스토리지 클리어
        sessionStorage.removeItem('fa_token');
        sessionStorage.removeItem('userId');
        
        setTimeout(() => {
            window.location.href = '#login';
        }, 1000);

    } catch (error) {
        showMessage('Failed to logout. Please try again.', 'error');
        console.error('Logout error:', error);
    }
}

  window.renderSettings = renderSettings;
  
