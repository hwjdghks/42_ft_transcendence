import { trans, changeLanguage } from '../language.js';
import { createDeleteAccountModal } from './modal/deleteAccountModal.js';
import { createUsernameModal } from './modal/usernameModal.js';
import { createPasswordModal } from './modal/passwordModal.js';
import { createPrivacyModal, loadPrivacySettingsLocally } from './modal/privacyModal.js';

// 모든 모달 열기 요청이 동시에 발생하지 않도록 하는 전역 플래그
let isModalOpening = false;

export function renderSettings() {
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
        <option value="fn">France</option>
      </select>
    </div>
    <button class="btn btn-danger w-100" id="deleteAccountBtn">${trans[window.curLang].settingDeleteAccount}</button>
    <div id="setting-message" class="mt-3"></div>
  `;

  // 모달이 한 번만 생성되도록 초기화
  if (!document.getElementById('usernameModal')) {
    createUsernameModal();
  }
  if (!document.getElementById('passwordModal')) {
    createPasswordModal();
  }
  if (!document.getElementById('privacySettingsModal')) {
    createPrivacyModal();
  }
  if (!document.getElementById('deleteAccountModal')) {
    createDeleteAccountModal();
  }
  
  // Edit Username 버튼 이벤트
  const editUsernameBtn = settingsContainer.querySelector('#editUsernameBtn');
  if (editUsernameBtn) {
    editUsernameBtn.addEventListener('click', () => {
      if (isModalOpening) return; // 이미 열기 중이면 동작 중단
      isModalOpening = true;
      
      const currentUsername = settingsContainer.querySelector('#username').value;
      document.getElementById('newUsername').value = currentUsername;
      const modalElement = document.getElementById('usernameModal');
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
      // 모달이 완전히 열리면 플래그 해제
      modalElement.addEventListener('shown.bs.modal', () => {
        isModalOpening = false;
      }, { once: true });
    });
  }
  
  // Edit Password 버튼 이벤트
  const editPasswordBtn = settingsContainer.querySelector('#editPasswordBtn');
  if (editPasswordBtn) {
    editPasswordBtn.addEventListener('click', () => {
      if (isModalOpening) return;
      isModalOpening = true;
      
      const modalElement = document.getElementById('passwordModal');
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
      modalElement.addEventListener('shown.bs.modal', () => {
        isModalOpening = false;
      }, { once: true });
    });
  }
  
  // Privacy Settings 버튼 이벤트 – 최신 localStorage 값 반영
  const editPrivacyBtn = settingsContainer.querySelector('#editPrivacyBtn');
  if (editPrivacyBtn) {
    editPrivacyBtn.addEventListener('click', () => {
      if (isModalOpening) return;
      isModalOpening = true;
      
      loadPrivacySettingsLocally();
      const modalElement = document.getElementById('privacySettingsModal');
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
      modalElement.addEventListener('shown.bs.modal', () => {
        isModalOpening = false;
      }, { once: true });
    });
  }

  // 언어 변경 이벤트
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
      if (isModalOpening) return;
      isModalOpening = true;
      
      const modalElement = document.getElementById('deleteAccountModal');
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
      modalElement.addEventListener('shown.bs.modal', () => {
        isModalOpening = false;
      }, { once: true });
    });
  }

  return settingsContainer;
}

document.addEventListener("DOMContentLoaded", () => {
  const modals = document.querySelectorAll(".modal");
  modals.forEach(modal => {
    modal.addEventListener("hidden.bs.modal", () => {
      if (modal.contains(document.activeElement)) {
        document.activeElement.blur();
      }
      setTimeout(() => {
        modal.removeAttribute("aria-hidden");
      }, 300);
    });
  });
});

export function updateModals() {
  // 1. 사용자 이름 변경 모달 업데이트
  const usernameModal = document.getElementById('usernameModal');
  if (usernameModal) {
    const modalTitle = usernameModal.querySelector('.modal-title');
    if (modalTitle) {
      modalTitle.textContent = trans[window.curLang].settingModalUsername;
    }
    const newUsernameLabel = usernameModal.querySelector('label[for="newUsername"]');
    if (newUsernameLabel) {
      newUsernameLabel.textContent = trans[window.curLang].settingModalNewUsername;
    }
    const newUsernameInput = usernameModal.querySelector('#newUsername');
    if (newUsernameInput) {
      newUsernameInput.placeholder = trans[window.curLang].settingModalNewUsernameHolder;
    }
    const usernameSmall = usernameModal.querySelector('#newUsername + small');
    if (usernameSmall) {
      usernameSmall.textContent = trans[window.curLang].settingModalUsernameSmall;
    }
    // 버튼 업데이트 (btn-close는 제외)
    usernameModal.querySelectorAll('button[data-bs-dismiss="modal"]').forEach(btn => {
      if (!btn.classList.contains('btn-close')) {
        btn.textContent = trans[window.curLang].Cancel;
      }
    });
    const saveBtn = usernameModal.querySelector('#usernameSaveBtn');
    if (saveBtn) {
      saveBtn.textContent = trans[window.curLang].Save;
    }
  }
  
  // 2. 비밀번호 변경 모달 업데이트
  const passwordModal = document.getElementById('passwordModal');
  if (passwordModal) {
    const modalTitle = passwordModal.querySelector('.modal-title');
    if (modalTitle) {
      modalTitle.textContent = trans[window.curLang].settingModalPassword;
    }
    const currentPasswordLabel = passwordModal.querySelector('label[for="currentPassword"]');
    if (currentPasswordLabel) {
      currentPasswordLabel.textContent = trans[window.curLang].settingModalCurPassword;
    }
    const currentPasswordInput = passwordModal.querySelector('#currentPassword');
    if (currentPasswordInput) {
      currentPasswordInput.placeholder = trans[window.curLang].settingModalCurPasswordHolder;
    }
    const newPasswordLabel = passwordModal.querySelector('label[for="newPassword"]');
    if (newPasswordLabel) {
      newPasswordLabel.textContent = trans[window.curLang].settingModalNewPassword;
    }
    const newPasswordInput = passwordModal.querySelector('#newPassword');
    if (newPasswordInput) {
      newPasswordInput.placeholder = trans[window.curLang].settingModalNewPasswordHolder;
    }
    const newPasswordSmall = newPasswordInput ? newPasswordInput.parentElement.querySelector('small') : null;
    if (newPasswordSmall) {
      newPasswordSmall.textContent = trans[window.curLang].settingModalPasswordSmall;
    }
    const confirmPasswordLabel = passwordModal.querySelector('label[for="confirmPassword"]');
    if (confirmPasswordLabel) {
      confirmPasswordLabel.textContent = trans[window.curLang].settingModalConPassword;
    }
    const confirmPasswordInput = passwordModal.querySelector('#confirmPassword');
    if (confirmPasswordInput) {
      confirmPasswordInput.placeholder = trans[window.curLang].settingModalConPasswordHolder;
    }
    passwordModal.querySelectorAll('button[data-bs-dismiss="modal"]').forEach(btn => {
      if (!btn.classList.contains('btn-close')) {
        btn.textContent = trans[window.curLang].Cancel;
      }
    });
    const saveBtn = passwordModal.querySelector('#savePasswordBtn');
    if (saveBtn) {
      saveBtn.textContent = trans[window.curLang].Save;
    }
  }
  
  // 3. 개인정보 설정 모달 업데이트
  const privacyModal = document.getElementById('privacySettingsModal');
  if (privacyModal) {
    const modalTitle = privacyModal.querySelector('.modal-title');
    if (modalTitle) {
      modalTitle.textContent = trans[window.curLang].settingModalPrivacy;
    }
    const isFriendEnabledLabel = privacyModal.querySelector('label[for="modalisFriendEnabledCheckbox"]');
    if (isFriendEnabledLabel) {
      isFriendEnabledLabel.textContent = trans[window.curLang].settingModalPrivacy1;
    }
    const shareProfileLabel = privacyModal.querySelector('label[for="modalShareProfileImageCheckbox"]');
    if (shareProfileLabel) {
      shareProfileLabel.textContent = trans[window.curLang].settingModalPrivacy2;
    }
    const shareOnlineLabel = privacyModal.querySelector('label[for="modalShareOnlineStatusCheckbox"]');
    if (shareOnlineLabel) {
      shareOnlineLabel.textContent = trans[window.curLang].settingModalPrivacy3;
    }
    privacyModal.querySelectorAll('button[data-bs-dismiss="modal"]').forEach(btn => {
      if (!btn.classList.contains('btn-close')) {
        btn.textContent = trans[window.curLang].Cancel;
      }
    });
    const saveBtn = privacyModal.querySelector('#privacySettingsSaveBtn');
    if (saveBtn) {
      saveBtn.textContent = trans[window.curLang].Save;
    }
  }
  
  // 4. 계정 삭제 모달 업데이트
  const deleteModal = document.getElementById('deleteAccountModal');
  if (deleteModal) {
    const modalTitle = deleteModal.querySelector('.modal-title');
    if (modalTitle) {
      modalTitle.textContent = trans[window.curLang].settingModalDelete;
    }
    const modalBody = deleteModal.querySelector('.modal-body p');
    if (modalBody) {
      modalBody.textContent = trans[window.curLang].settingModalDeleteBody;
    }
    const otpInput = deleteModal.querySelector('#otpInput');
    if (otpInput) {
      otpInput.placeholder = trans[window.curLang].settingModalDeleteHolder;
    }
    deleteModal.querySelectorAll('button[data-bs-dismiss="modal"]').forEach(btn => {
      if (!btn.classList.contains('btn-close')) {
        btn.textContent = trans[window.curLang].Cancel;
      }
    });
    const confirmBtn = deleteModal.querySelector('#confirmDelete');
    if (confirmBtn) {
      confirmBtn.textContent = trans[window.curLang].settingModalBtn;
    }
  }
}
