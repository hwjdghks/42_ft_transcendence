import { trans, changeLanguage } from '../language.js';
import { createDeleteAccountModal } from './deleteAccountModal.js';
import { postUpdateUsername, postUpdatePrivacySettings, postUpdatePassword } from '../api/scriptApi.js';
import { isInputUsernameValid, isInputPasswordValid } from '../validation/inputData.js';
import { renderMatchHistory } from '../components/matchHistory.js';

/**
 * 세팅 컴포넌트 렌더 함수
 */
function renderSettings() {
  const settingsContainer = document.getElementById('setting');
  if (!settingsContainer) return;

  settingsContainer.innerHTML = `
    <!-- Username Field -->
    <div class="mb-3">
      <label for="username" class="form-label text-start w-100">${trans[window.curLang].settingUsername}</label>
      <div class="input-group">
        <input type="text" class="form-control" id="username" placeholder="${trans[window.curLang].settingUsernameHolder}" disabled>
        <button class="btn btn-outline-secondary" type="button" id="editUsernameBtn">
          <i class="bi bi-gear"></i>
        </button>
      </div>
    </div>
    <!-- Password Field -->
    <div class="mb-3">
      <label for="password" class="form-label text-start w-100">${trans[window.curLang].settingPassword}</label>
      <div class="input-group">
        <input type="password" class="form-control" id="password" placeholder="${trans[window.curLang].settingPasswordHolder}" disabled>
        <button class="btn btn-outline-secondary" type="button" id="editPasswordBtn">
          <i class="bi bi-gear"></i>
        </button>
      </div>
    </div>
    <!-- Privacy Field -->
    <div class="mb-3">
      <label for="privacy" class="form-label text-start w-100">${trans[window.curLang].settingPrivacy}</label>
      <div class="input-group">
        <input type="privacy" class="form-control" id="privacy" placeholder="${trans[window.curLang].settingPrivacyHolder}" disabled>
        <button class="btn btn-outline-secondary" type="button" id="editPrivacyBtn">
          <i class="bi bi-gear"></i>
        </button>
      </div>
    </div>
    <!-- Language Selection Dropdown -->
    <div class="mb-3">
      <label for="language-select" class="form-label text-start w-100">${trans[window.curLang].settingLanguage}</label>
      <select id="language-select" class="form-select">
        <option value="en">English</option>
        <option value="ko">한국어</option>
      </select>
    </div>
    <button class="btn btn-danger w-100" id="deleteAccountBtn">${trans[window.curLang].settingDeleteAccount}</button>
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

  // 언어 변경 버튼 이벤트
  const languageSelect = settingsContainer.querySelector('#language-select');
  languageSelect.value = localStorage.getItem("lang") || "en";
  languageSelect.addEventListener("change", (e) => {
    const selectedLang = e.target.value;
    localStorage.setItem("lang", selectedLang);
    window.curLang = selectedLang;
    changeLanguage(window.curLang);
  });

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

// 유저 이름 변경 모달 생성 함수
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
           <h5 class="modal-title">${trans[window.curLang].settingModalUsername}</h5>
           <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
         </div>
         <div class="modal-body">
           <form id="usernameForm">
             <div class="mb-3">
               <label for="newUsername" class="form-label">${trans[window.curLang].settingModalNewUsername}</label>
               <input type="text" class="form-control" id="newUsername" placeholder="${trans[window.curLang].settingModalNewUsernameHolder}">
               <small class="form-text text-muted">${trans[window.curLang].settingModalUsernameSmall}</small>
             </div>
             <div id="usernameModalMessage" class="mb-3"></div>
             <div class="modal-footer">
               <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${trans[window.curLang].Cancel}</button>
               <button type="submit" class="btn btn-primary" id="usernameSaveBtn" disabled>${trans[window.curLang].Save}</button>
             </div>
           </form>
         </div>
      </div>
    </div>
  `;
  document.body.appendChild(modalDiv);

  const newUsernameInput = modalDiv.querySelector('#newUsername');
  const usernameSaveBtn = modalDiv.querySelector('#usernameSaveBtn');

  // 실시간 유효성 검사
  newUsernameInput.addEventListener('input', () => {
    const value = newUsernameInput.value.trim();
    const valid = isInputUsernameValid(value);
    
    if (valid) {
      newUsernameInput.classList.remove('is-invalid');
      usernameSaveBtn.disabled = false;
      document.querySelector("#newUsername").nextElementSibling.classList.remove('text-danger');
    } else {
      newUsernameInput.classList.add('is-invalid');
      usernameSaveBtn.disabled = true;
      document.querySelector("#newUsername").nextElementSibling.classList.add('text-danger');
    }
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
      const updateMessage = await postUpdateUsername(newUsername);
      alert(updateMessage.message || 'Success');

      // 화면 상단 username 업데이트
      const usernameElement = document.querySelector('.fs-2.fw-bold');
      if (usernameElement) {
        usernameElement.textContent = newUsername;
      }

      renderMatchHistory();

      const modalInstance = bootstrap.Modal.getInstance(modalDiv);
      modalInstance.hide();
    } catch (error) {
      alert('Error: ' + error.message);
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
           <h5 class="modal-title">${trans[window.curLang].settingModalPrivacy}</h5>
           <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
         </div>
         <div class="modal-body">
           <form id="privacySettingsForm">
             <div class="form-check mb-2">
               <input type="checkbox" class="form-check-input" id="modalShowInSearchCheckbox" checked>
               <label class="form-check-label" for="modalShowInSearchCheckbox">${trans[window.curLang].settingModalPrivacy1}</label>
             </div>
             <div class="form-check mb-2">
               <input type="checkbox" class="form-check-input" id="modalShareProfileImageCheckbox" checked>
               <label class="form-check-label" for="modalShareProfileImageCheckbox">${trans[window.curLang].settingModalPrivacy2}</label>
             </div>
             <div class="form-check mb-2">
               <input type="checkbox" class="form-check-input" id="modalShareOnlineStatusCheckbox" checked>
               <label class="form-check-label" for="modalShareOnlineStatusCheckbox">${trans[window.curLang].settingModalPrivacy3}</label>
             </div>
             <div id="privacySettingsModalMessage" class="mb-3"></div>
           </form>
         </div>
         <div class="modal-footer">
           <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${trans[window.curLang].Cancel}</button>
           <button type="button" class="btn btn-primary" id="privacySettingsSaveBtn">${trans[window.curLang].Save}</button>
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

    try {
      await postUpdatePrivacySettings(showInSearch, shareProfileImage, shareOnlineStatus);
      alert('Success');
    } catch (error) {
      alert('Error: ' + error.message);
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
           <h5 class="modal-title">${trans[window.curLang].settingModalPassword}</h5>
           <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
         </div>
         <div class="modal-body">
           <form id="passwordForm">
             <div class="mb-3">
               <label for="currentPassword" class="form-label">${trans[window.curLang].settingModalCurPassword}</label>
               <input type="password" class="form-control" id="currentPassword" placeholder="${trans[window.curLang].settingModalCurPasswordHolder}">
             </div>
             <div class="mb-3">
               <label for="newPassword" class="form-label">${trans[window.curLang].settingModalNewPassword}</label>
               <input type="password" class="form-control" id="newPassword" placeholder="${trans[window.curLang].settingModalNewPasswordHolder}">
               <small class="form-text text-muted">${trans[window.curLang].settingModalPasswordSmall}</small>
             </div>
             <div class="mb-3">
               <label for="confirmPassword" class="form-label">${trans[window.curLang].settingModalConPassword}</label>
               <input type="password" class="form-control" id="confirmPassword" placeholder="${trans[window.curLang].settingModalConPasswordHolder}">
             </div>
             <div id="passwordModalMessage" class="mb-3"></div>
             <div class="modal-footer">
               <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${trans[window.curLang].Cancel}</button>
               <button type="submit" class="btn btn-primary" id="savePasswordBtn" disabled>${trans[window.curLang].Save}</button>
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

  function validatePasswordFields() {
    const currentPassword = currentPasswordInput.value.trim();
    const newPassword = newPasswordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();
  
    const newPasswordValid = isInputPasswordValid(newPassword);
    const passwordsMatch = newPassword === confirmPassword;
  
    // newPassword 안내문을 찾음
    const newPasswordHint = newPasswordInput.parentElement.querySelector('small');
    const confirmPasswordHint = confirmPasswordInput.parentElement.querySelector('small');
  
    // 새 비밀번호 유효성 검사
    if (!newPasswordValid) {
      newPasswordInput.classList.add('is-invalid');
      if (newPasswordHint) newPasswordHint.classList.add('text-danger');
    } else {
      newPasswordInput.classList.remove('is-invalid');
      if (newPasswordHint) newPasswordHint.classList.remove('text-danger');
    }
  
    // 비밀번호 확인 검사
    if (!passwordsMatch) {
      confirmPasswordInput.classList.add('is-invalid');
      if (confirmPasswordHint) confirmPasswordHint.classList.add('text-danger');
    } else {
      confirmPasswordInput.classList.remove('is-invalid');
      if (confirmPasswordHint) confirmPasswordHint.classList.remove('text-danger');
    }
  
    // 모든 조건을 만족하면 버튼 활성화
    savePasswordBtn.disabled = !(currentPassword && newPasswordValid && passwordsMatch);
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
      alert('Passwords do not match.');
      return;
    }

    try {
      const updateMessage = await postUpdatePassword(currentPassword, newPassword);
      alert('Success');
      const modalInstance = bootstrap.Modal.getInstance(modalDiv);
      modalInstance.hide();
    } catch (error) {
      alert('Error: ' + error.message);
      currentPasswordInput.value = "";
      newPasswordInput.value = "";
      confirmPasswordInput.value = "";
      savePasswordBtn.disabled = true;
    }
  });
}

function updateModals() {
  const usernameModal = document.getElementById('usernameModal');
  if (usernameModal) {
    usernameModal.querySelector('.modal-title').textContent = trans[window.curLang].settingModalUsername;
    usernameModal.querySelector('.form-label').textContent = trans[window.curLang].settingModalNewUsername;
    usernameModal.querySelector('#newUsername').placeholder = trans[window.curLang].settingModalNewUsernameHolder;
    usernameModal.querySelector('.form-text').textContent = trans[window.curLang].settingModalUsernameSmall;
    usernameModal.querySelector('#usernameSaveBtn').textContent = trans[window.curLang].Save;
    usernameModal.querySelector('.btn-secondary').textContent = trans[window.curLang].Cancel;
  }

  const passwordModal = document.getElementById('passwordModal');
  if (passwordModal) {
    passwordModal.querySelector('.modal-title').textContent = trans[window.curLang].settingModalPassword;
    passwordModal.querySelector('#savePasswordBtn').textContent = trans[window.curLang].Save;
    passwordModal.querySelector('.btn-secondary').textContent = trans[window.curLang].Cancel;

    passwordModal.querySelector('label[for="currentPassword"]').textContent = trans[window.curLang].settingModalCurPassword;
    passwordModal.querySelector('#currentPassword').placeholder = trans[window.curLang].settingModalCurPasswordHolder;
    
    passwordModal.querySelector('label[for="newPassword"]').textContent = trans[window.curLang].settingModalNewPassword;
    passwordModal.querySelector('#newPassword').placeholder = trans[window.curLang].settingModalNewPasswordHolder;
    
    passwordModal.querySelector('label[for="confirmPassword"]').textContent = trans[window.curLang].settingModalConPassword;
    passwordModal.querySelector('#confirmPassword').placeholder = trans[window.curLang].settingModalConPasswordHolder;

    passwordModal.querySelector('.form-text').textContent = trans[window.curLang].settingModalPasswordSmall;
  }

  const privacyModal = document.getElementById('privacySettingsModal');
  if (privacyModal) {
    privacyModal.querySelector('.modal-title').textContent = trans[window.curLang].settingModalPrivacy;
    privacyModal.querySelector('.btn-secondary').textContent = trans[window.curLang].Cancel;
    privacyModal.querySelector('#privacySettingsSaveBtn').textContent = trans[window.curLang].Save;

    privacyModal.querySelector('label[for="modalShowInSearchCheckbox"]').textContent = trans[window.curLang].settingModalPrivacy1;
    privacyModal.querySelector('label[for="modalShareProfileImageCheckbox"]').textContent = trans[window.curLang].settingModalPrivacy2;
    privacyModal.querySelector('label[for="modalShareOnlineStatusCheckbox"]').textContent = trans[window.curLang].settingModalPrivacy3;
  }

  const deleteAccountModal = document.getElementById('deleteAccountModal');
  if (deleteAccountModal) {
    deleteAccountModal.querySelector('.modal-header h2 span').textContent = trans[window.curLang].settingModalDelete;
    deleteAccountModal.querySelector('.modal-body p').textContent = trans[window.curLang].settingModalDeleteBody;
    deleteAccountModal.querySelector('#otpInput').placeholder = trans[window.curLang].settingModalDeleteHolder;
    deleteAccountModal.querySelector('.modal-footer .btn-secondary').textContent = trans[window.curLang].Cancel;
    deleteAccountModal.querySelector('.modal-footer #confirmDelete').textContent = trans[window.curLang].settingModalBtn;
  }  
}

document.addEventListener("DOMContentLoaded", () => {
  const modals = document.querySelectorAll(".modal");
  modals.forEach(modal => {
    modal.addEventListener("hidden.bs.modal", () => {
      setTimeout(() => {
        modal.removeAttribute("aria-hidden");
      }, 100);
    });
  });
});

export { renderSettings, updateModals };
