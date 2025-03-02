// setting.js

import { createDeleteAccountModal } from './deleteAccountModal.js';

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

// Username 변경 모달 생성 함수
function createUsernameModal() {
  if (document.getElementById('usernameModal')) return;

  const modalDiv = document.createElement('div');
  modalDiv.id = 'usernameModal';
  modalDiv.className = 'modal fade';
  modalDiv.tabIndex = -1;
  modalDiv.innerHTML = `
    <div class="modal-dialog">
      <div class="modal-content">
         <div class="modal-header">
           <h5 class="modal-title">Change Username</h5>
           <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
         </div>
         <div class="modal-body">
           <form id="usernameForm">
             <div class="mb-3">
               <label for="newUsername" class="form-label">New Username</label>
               <input type="text" class="form-control" id="newUsername" placeholder="Enter new username">
             </div>
             <div id="usernameModalMessage" class="mb-3"></div>
             <div class="modal-footer">
               <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
               <button type="submit" class="btn btn-primary">Save</button>
             </div>
           </form>
         </div>
      </div>
    </div>
  `;
  document.body.appendChild(modalDiv);

  // 모달이 완전히 닫힐 때마다 폼/메시지/클래스 초기화
  modalDiv.addEventListener('hidden.bs.modal', () => {
    const messageDiv = document.getElementById('usernameModalMessage');
    if (messageDiv) {
      messageDiv.textContent = '';
      messageDiv.className = 'mb-3'; // alert 클래스 제거
    }
    const newUsernameInput = document.getElementById('newUsername');
    if (newUsernameInput) {
      newUsernameInput.value = '';
    }
  });

  const usernameForm = modalDiv.querySelector('#usernameForm');
  usernameForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const newUsername = document.getElementById('newUsername').value.trim();
    const messageDiv = document.getElementById('usernameModalMessage');

    if (!newUsername) {
      messageDiv.textContent = 'Username cannot be empty';
      messageDiv.className = 'alert alert-danger';
      return;
    }

    try {
      const token = sessionStorage.getItem('fa_token');
      const response = await fetch('https://localhost/api/users/update/username/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          token: token,
          new_username: newUsername
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update username');
      }

      const result = await response.json();
      messageDiv.textContent = result.message || 'Username updated successfully';
      messageDiv.className = 'alert alert-success';
      
      // 화면 상단 username도 즉시 변경
      const usernameElement = document.querySelector('.fs-2.fw-bold');
      if (usernameElement && newUsername) {
        usernameElement.textContent = newUsername;
      }

      // 1초 후 모달 닫기
      setTimeout(() => {
        const modalInstance = bootstrap.Modal.getInstance(modalDiv);
        modalInstance.hide();
      }, 1000);

    } catch (error) {
      messageDiv.textContent = error.message || 'Error updating username';
      messageDiv.className = 'alert alert-danger';
      console.error('Username update error:', error);
    }
  });
}

// Password 변경 모달 생성 함수
function createPasswordModal() {
  if (document.getElementById('passwordModal')) return;

  const modalDiv = document.createElement('div');
  modalDiv.id = 'passwordModal';
  modalDiv.className = 'modal fade';
  modalDiv.tabIndex = -1;
  modalDiv.innerHTML = `
    <div class="modal-dialog">
      <div class="modal-content">
         <div class="modal-header">
           <h5 class="modal-title">Change Password</h5>
           <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
         </div>
         <div class="modal-body">
           <form id="passwordForm">
             <div class="mb-3">
               <label for="newPassword" class="form-label">New Password</label>
               <input type="password" class="form-control" id="newPassword" placeholder="Enter new password">
             </div>
             <div class="mb-3">
               <label for="confirmPassword" class="form-label">Confirm New Password</label>
               <input type="password" class="form-control" id="confirmPassword" placeholder="Confirm new password">
               <div id="confirmPasswordFeedback" class="invalid-feedback">
                 입력한 패스워드가 다릅니다.
               </div>
             </div>
             <div id="passwordModalMessage" class="mb-3"></div>
             <div class="modal-footer">
               <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
               <button type="submit" class="btn btn-primary" id="savePasswordBtn" disabled>Save</button>
             </div>
           </form>
         </div>
      </div>
    </div>
  `;
  document.body.appendChild(modalDiv);

  const passwordForm = modalDiv.querySelector('#passwordForm');
  const newPasswordInput = modalDiv.querySelector('#newPassword');
  const confirmPasswordInput = modalDiv.querySelector('#confirmPassword');
  const savePasswordBtn = modalDiv.querySelector('#savePasswordBtn');
  const messageDiv = modalDiv.querySelector('#passwordModalMessage');

  // 모달이 완전히 닫힐 때마다 폼/메시지/클래스 초기화
  modalDiv.addEventListener('hidden.bs.modal', () => {
    messageDiv.textContent = '';
    messageDiv.className = 'mb-3'; // alert 제거
    newPasswordInput.value = '';
    confirmPasswordInput.value = '';
    confirmPasswordInput.classList.remove('is-invalid');
    savePasswordBtn.disabled = true;
  });

  // 실시간 검증 함수
  function validatePasswordMatch() {
    const newPassword = newPasswordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    
    if (confirmPassword && newPassword !== confirmPassword) {
      confirmPasswordInput.classList.add('is-invalid');
      savePasswordBtn.disabled = true;
    } else {
      confirmPasswordInput.classList.remove('is-invalid');
      // 두 인풋 모두 값이 있을 때만 저장 버튼 활성화
      if (newPassword && confirmPassword) {
        savePasswordBtn.disabled = false;
      } else {
        savePasswordBtn.disabled = true;
      }
    }
  }

  newPasswordInput.addEventListener('input', validatePasswordMatch);
  confirmPasswordInput.addEventListener('input', validatePasswordMatch);

  passwordForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const newPassword = newPasswordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    // 추가 검증: 혹시 실시간 검증을 우회한 경우
    if (newPassword !== confirmPassword) {
      confirmPasswordInput.classList.add('is-invalid');
      messageDiv.textContent = '입력한 패스워드가 다릅니다.';
      messageDiv.className = 'alert alert-danger';
      return;
    }

    try {
      const token = sessionStorage.getItem('fa_token');
      const response = await fetch('https://localhost/api/users/update/password/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          new_password: newPassword
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        // 백엔드에서 전달한 에러 메시지를 그대로 사용
        throw new Error(errorData.message || 'Failed to update password');
      }

      const result = await response.json();
      messageDiv.textContent = result.message || 'Password updated successfully';
      messageDiv.className = 'alert alert-success';

      // 1초 뒤 모달 닫기
      setTimeout(() => {
        const modalInstance = bootstrap.Modal.getInstance(modalDiv);
        modalInstance.hide();
      }, 1000);

    } catch (error) {
      messageDiv.textContent = error.message || 'Error updating password';
      messageDiv.className = 'alert alert-danger';
      console.error('Password update error:', error);
    }
  });
}

function renderSettings() {
  const container = document.createElement('div');
  container.className = 'container py-5';

  container.innerHTML = `
        <!-- Username Field -->
        <div class="mb-3">
          <label for="username" class="form-label text-start w-100">Username</label>
          <div class="input-group">
            <input type="text" class="form-control" id="username" placeholder="Enter your username" disabled>
            <button class="btn btn-outline-secondary" type="button" id="editUsernameBtn">
              <i class="bi bi-gear"></i>
            </button>
          </div>
        </div>
        <!-- Password Field -->
        <div class="mb-3">
          <label for="password" class="form-label text-start w-100">Password</label>
          <div class="input-group">
            <input type="password" class="form-control" id="password" placeholder="Enter your password" disabled>
            <button class="btn btn-outline-secondary" type="button" id="editPasswordBtn">
              <i class="bi bi-gear"></i>
            </button>
          </div>
        </div>
        <button class="btn btn-outline-primary w-100 mb-2" id="logoutBtn">Log out</button>
        <button class="btn btn-danger w-100" id="deleteAccountBtn">Delete account</button>
        <div id="setting-message" class="mt-3"></div>
  `;

  // 로그아웃 처리
  const logoutBtn = container.querySelector('#logoutBtn');
  logoutBtn.addEventListener('click', handleLogout);

  // Delete Account 모달 생성 및 처리
  if (!document.getElementById('deleteAccountModal')) {
    createDeleteAccountModal();
  }
  const deleteAccountBtn = container.querySelector('#deleteAccountBtn');
  deleteAccountBtn.addEventListener('click', () => {
    const modal = new bootstrap.Modal(document.getElementById('deleteAccountModal'));
    modal.show();
  });

  // Username 모달 생성 및 처리
  if (!document.getElementById('usernameModal')) {
    createUsernameModal();
  }
  const editUsernameBtn = container.querySelector('#editUsernameBtn');
  editUsernameBtn.addEventListener('click', () => {
    // 현재 username 값을 모달에 미리 채워넣음
    document.getElementById('newUsername').value = document.getElementById('username').value;
    const modal = new bootstrap.Modal(document.getElementById('usernameModal'));
    modal.show();
  });

  // Password 모달 생성 및 처리
  if (!document.getElementById('passwordModal')) {
    createPasswordModal();
  }
  const editPasswordBtn = container.querySelector('#editPasswordBtn');
  editPasswordBtn.addEventListener('click', () => {
    const modal = new bootstrap.Modal(document.getElementById('passwordModal'));
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

// 전역에서 사용하기 위해 window에 할당
window.renderSettings = renderSettings;
