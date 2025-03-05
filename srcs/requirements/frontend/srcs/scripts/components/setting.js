import { createDeleteAccountModal } from './deleteAccountModal.js';
import { fetchUpdateUsername, fetchUpdatePrivacySettings, fetchUpdatePassword } from './settingApi.js';

/**
 * 세팅 컴포넌트 렌더 함수
 */
function renderSettings() {
  const settingsContainer = document.getElementById('setting');
  if (!settingsContainer) return;

  settingsContainer.innerHTML = `
    <!-- Username Field -->
    <div class="mb-3">
      <label for="username" class="form-label text-start w-100">Username</label>
      <div class="input-group">
        <input type="text" class="form-control" id="username" placeholder="change username" disabled>
        <button class="btn btn-outline-secondary" type="button" id="editUsernameBtn">
          <i class="bi bi-gear"></i>
        </button>
      </div>
    </div>
    <!-- Password Field -->
    <div class="mb-3">
      <label for="password" class="form-label text-start w-100">Password</label>
      <div class="input-group">
        <input type="password" class="form-control" id="password" placeholder="change password" disabled>
        <button class="btn btn-outline-secondary" type="button" id="editPasswordBtn">
          <i class="bi bi-gear"></i>
        </button>
      </div>
    </div>
    <!-- Privacy Field -->
    <div class="mb-3">
      <label for="privacy" class="form-label text-start w-100">Privacy</label>
      <div class="input-group">
        <input type="privacy" class="form-control" id="privacy" placeholder="set privacy options" disabled>
        <button class="btn btn-outline-secondary" type="button" id="editPrivacyBtn">
          <i class="bi bi-gear"></i>
        </button>
      </div>
    </div>
    <button class="btn btn-danger w-100" id="deleteAccountBtn">Delete account</button>
    <div id="setting-message" class="mt-3"></div>
  `;

  // 각 모달 초기화
  if (!document.getElementById('usernameModal')) {
    createUsernameModal();
  }
  if (!document.getElementById('passwordModal')) {
    createPasswordModal();
  }
  if (!document.getElementById('privacySettingsModal')) {
    createPrivacySettingsModal();
  }
  if (!document.getElementById('deleteAccountModal')) {
    createDeleteAccountModal();
  }
  
  // Edit Username 버튼 이벤트
  const editUsernameBtn = settingsContainer.querySelector('#editUsernameBtn');
  if (editUsernameBtn) {
    editUsernameBtn.addEventListener('click', () => {
      const currentUsername = settingsContainer.querySelector('#username').value;
      document.getElementById('newUsername').value = currentUsername;
      const modal = new bootstrap.Modal(document.getElementById('usernameModal'));
      modal.show();
    });
  }
  
  // Edit Password 버튼 이벤트
  const editPasswordBtn = settingsContainer.querySelector('#editPasswordBtn');
  if (editPasswordBtn) {
    editPasswordBtn.addEventListener('click', () => {
      const modal = new bootstrap.Modal(document.getElementById('passwordModal'));
      modal.show();
    });
  }
  
  // Privacy Settings 버튼 이벤트
  const editPrivacyBtn = settingsContainer.querySelector('#editPrivacyBtn');
  if (editPrivacyBtn) {
    editPrivacyBtn.addEventListener('click', () => {
      const modal = new bootstrap.Modal(document.getElementById('privacySettingsModal'));
      modal.show();
    });
  }
  
  // Delete Account 버튼 이벤트
  const deleteAccountBtn = settingsContainer.querySelector('#deleteAccountBtn');
  if (deleteAccountBtn) {
    deleteAccountBtn.addEventListener('click', () => {
      const modal = new bootstrap.Modal(document.getElementById('deleteAccountModal'));
      modal.show();
    });
  }

  return settingsContainer;
}

/**
 * 유저 이름 변경 모달 생성 함수
 * - 오직 영어 알파벳만 허용 (정규식: /^[A-Za-z]+$/)
 * - 입력 필드가 비었거나 정규식에 맞지 않으면 저장 버튼 비활성화
 */
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
               <small class="form-text text-muted">영어, 숫자만 입력 가능합니다. (최대 10자)</small>
             </div>
             <div id="usernameModalMessage" class="mb-3"></div>
             <div class="modal-footer">
               <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
               <button type="submit" class="btn btn-primary" id="usernameSaveBtn" disabled>Save</button>
             </div>
           </form>
         </div>
      </div>
    </div>
  `;
  document.body.appendChild(modalDiv);

  const newUsernameInput = modalDiv.querySelector('#newUsername');
  const usernameSaveBtn = modalDiv.querySelector('#usernameSaveBtn');

  // 실시간 유효성 검사: 입력값이 비어있지 않고 오직 영어,숫자만 있는지 확인(최대 10자 까지)
  newUsernameInput.addEventListener('input', () => {
    const value = newUsernameInput.value.trim();
    const valid = /^[A-Za-z0-9]{0,10}$/.test(value);
    usernameSaveBtn.disabled = !value || !valid;
  });

  // 모달 닫힐 때 초기화
  modalDiv.addEventListener('hidden.bs.modal', () => {
    const usernameForm = modalDiv.querySelector('#usernameForm');
    if (usernameForm) usernameForm.reset();
    usernameSaveBtn.disabled = true;
  });

  // Username 변경 요청 처리
  const usernameForm = modalDiv.querySelector('#usernameForm');
  usernameForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newUsername = newUsernameInput.value.trim();
    try {
      const updateMessage = await fetchUpdateUsername(newUsername);
      alert(updateMessage || "Success to change");

      // 화면 상단 username 업데이트
      const usernameElement = document.querySelector('.fs-2.fw-bold');
      if (usernameElement) {
        usernameElement.textContent = newUsername;
      }
      const modalInstance = bootstrap.Modal.getInstance(modalDiv);
      modalInstance.hide();
    } catch (error) {
      alert(error.message);
      newUsernameInput.value = "";
      usernameSaveBtn.disabled = true;
    }
  });
}

/**
 * 개인정보(Privacy Settings) 변경 모달 생성 함수
 */
function createPrivacySettingsModal() {
  if (document.getElementById('privacySettingsModal')) return;

  const modalDiv = document.createElement('div');
  modalDiv.id = 'privacySettingsModal';
  modalDiv.className = 'modal fade';
  modalDiv.tabIndex = -1;
  modalDiv.innerHTML = `
    <div class="modal-dialog">
      <div class="modal-content">
         <div class="modal-header">
           <h5 class="modal-title">Privacy Settings</h5>
           <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
         </div>
         <div class="modal-body">
           <form id="privacySettingsForm">
             <div class="form-check mb-2">
               <input type="checkbox" class="form-check-input" id="modalShowInSearchCheckbox" checked>
               <label class="form-check-label" for="modalShowInSearchCheckbox">Show in friend search</label>
             </div>
             <div class="form-check mb-2">
               <input type="checkbox" class="form-check-input" id="modalShareProfileImageCheckbox" checked>
               <label class="form-check-label" for="modalShareProfileImageCheckbox">Share profile image</label>
             </div>
             <div class="form-check mb-2">
               <input type="checkbox" class="form-check-input" id="modalShareOnlineStatusCheckbox" checked>
               <label class="form-check-label" for="modalShareOnlineStatusCheckbox">Share online status</label>
             </div>
             <div id="privacySettingsModalMessage" class="mb-3"></div>
           </form>
         </div>
         <div class="modal-footer">
           <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
           <button type="button" class="btn btn-primary" id="privacySettingsSaveBtn">Save Changes</button>
         </div>
      </div>
    </div>
  `;
  document.body.appendChild(modalDiv);

  modalDiv.addEventListener('hidden.bs.modal', () => {
    const privacyForm = modalDiv.querySelector('#privacySettingsForm');
    if (privacyForm) privacyForm.reset();
    document.getElementById('modalShowInSearchCheckbox').checked = true;
    document.getElementById('modalShareProfileImageCheckbox').checked = true;
    document.getElementById('modalShareOnlineStatusCheckbox').checked = true;
  });
  
  // 개인정보 업데이트 요청 처리
  const saveBtn = modalDiv.querySelector('#privacySettingsSaveBtn');
  saveBtn.addEventListener('click', async () => {
    const showInSearch = document.getElementById('modalShowInSearchCheckbox').checked;
    const shareProfileImage = document.getElementById('modalShareProfileImageCheckbox').checked;
    const shareOnlineStatus = document.getElementById('modalShareOnlineStatusCheckbox').checked;

    const result = await fetchUpdatePrivacySettings(showInSearch, shareProfileImage, shareOnlineStatus);
    if (result.success) {
      alert('success to change');
    } else {
      alert('failed to change');
    }
    const modalInstance = bootstrap.Modal.getInstance(modalDiv);
    modalInstance.hide();
  });
}

/**
 * 패스워드 변경 모달 생성 함수
 * - 현재 패스워드, 새 패스워드, 확인용 패스워드를 모두 빈칸 없이 입력해야 저장 버튼이 활성화
 * - 새 패스워드는 숫자와 영어만 포함 가능하며, 길이는 8자 이상 50자 이하
 */
function createPasswordModal() {
  if (document.getElementById('passwordModal')) return;

  const modalDiv = document.createElement('div');
  modalDiv.id = 'passwordModal';
  modalDiv.className = 'modal fade';
  modalDiv.tabIndex = -1;
  // currentPassword: 현재 패스워드, newPassword: 새 패스워드, confirmPassword: 새 패스워드 확인
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
               <label for="currentPassword" class="form-label">Current Password</label>
               <input type="password" class="form-control" id="currentPassword" placeholder="Enter current password">
             </div>
             <div class="mb-3">
               <label for="newPassword" class="form-label">New Password</label>
               <input type="password" class="form-control" id="newPassword" placeholder="Enter new password">
               <small class="form-text text-muted">영어, 숫자만 입력 가능합니다. (최소 8자, 최대 50자)</small>
             </div>
             <div class="mb-3">
               <label for="confirmPassword" class="form-label">Confirm New Password</label>
               <input type="password" class="form-control" id="confirmPassword" placeholder="Confirm new password">
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
  const currentPasswordInput = modalDiv.querySelector('#currentPassword');
  const newPasswordInput = modalDiv.querySelector('#newPassword');
  const confirmPasswordInput = modalDiv.querySelector('#confirmPassword');
  const savePasswordBtn = modalDiv.querySelector('#savePasswordBtn');

  // 실시간 유효성 검사 함수
  function validatePasswordFields() {
    const currentPassword = currentPasswordInput.value.trim();
    const newPassword = newPasswordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();
    // 새 패스워드는 숫자와 영어만 포함, 8자 이상 50자 이하
    const newPasswordValid = /^[A-Za-z0-9]{8,50}$/.test(newPassword);
    const passwordsMatch = newPassword === confirmPassword;
    
    if (currentPassword && newPassword && confirmPassword && newPasswordValid && passwordsMatch) {
      savePasswordBtn.disabled = false;
      confirmPasswordInput.classList.remove('is-invalid');
    } else {
      savePasswordBtn.disabled = true;
      if (confirmPassword && !passwordsMatch) {
        confirmPasswordInput.classList.add('is-invalid');
      } else {
        confirmPasswordInput.classList.remove('is-invalid');
      }
    }
  }

  // 입력 이벤트로 실시간 검사 실행
  currentPasswordInput.addEventListener('input', validatePasswordFields);
  newPasswordInput.addEventListener('input', validatePasswordFields);
  confirmPasswordInput.addEventListener('input', validatePasswordFields);

  modalDiv.addEventListener('hidden.bs.modal', () => {
    passwordForm.reset();
    confirmPasswordInput.classList.remove('is-invalid');
    savePasswordBtn.disabled = true;
  });

  // Password 변경 요청 처리
  passwordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const currentPassword = currentPasswordInput.value.trim();
    const newPassword = newPasswordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();

    if (newPassword !== confirmPassword) {
      confirmPasswordInput.classList.add('is-invalid');
      alert('입력한 패스워드가 다릅니다.');
      return;
    }

    try {
      const updateMessage = await fetchUpdatePassword(currentPassword, newPassword);
      alert(updateMessage || 'success to change');
      const modalInstance = bootstrap.Modal.getInstance(modalDiv);
      modalInstance.hide();
    } catch (error) {
      alert(error.message || 'Failed to update password');
      currentPasswordInput.value = "";
      newPasswordInput.value = "";
      confirmPasswordInput.value = "";
      savePasswordBtn.disabled = true;
      console.error('Password update error:', error);
    }
  });
}

export { renderSettings };
