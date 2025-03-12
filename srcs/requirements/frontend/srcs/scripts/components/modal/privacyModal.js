import { trans } from '../../language.js';
import { postUpdatePrivacySettings } from '../../api/scriptApi.js';

export function createPrivacyModal() {
  // 모달이 이미 존재하면 생성하지 않음
  if (document.getElementById('privacySettingsModal')) return;
  
  // localStorage에서 저장된 값 읽기 (저장된 값이 없으면 기본값 true)
  let storedSettings = localStorage.getItem('privacySettings');
  let settings = {
    showInSearch: true,
    shareProfileImage: true,
    shareOnlineStatus: true,
  };
  if (storedSettings) {
    try {
      settings = JSON.parse(storedSettings);
    } catch (e) {
      console.error("Error parsing privacySettings from localStorage", e);
    }
  }

  // 각 체크박스의 초기 checked 상태 설정
  const showInSearchChecked = settings.showInSearch ? 'checked' : '';
  const shareProfileImageChecked = settings.shareProfileImage ? 'checked' : '';
  const shareOnlineStatusChecked = settings.shareOnlineStatus ? 'checked' : '';

  // 모달 HTML 템플릿
  const modalHtml = `
    <div class="modal-dialog">
      <div class="modal-content">
         <div class="modal-header">
           <h5 class="modal-title">${trans[window.curLang].settingModalPrivacy}</h5>
           <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
         </div>
         <div class="modal-body">
           <form id="privacySettingsForm">
             <div class="form-check mb-2">
               <input type="checkbox" class="form-check-input" id="modalShowInSearchCheckbox" ${showInSearchChecked}>
               <label class="form-check-label" for="modalShowInSearchCheckbox">${trans[window.curLang].settingModalPrivacy1}</label>
             </div>
             <div class="form-check mb-2">
               <input type="checkbox" class="form-check-input" id="modalShareProfileImageCheckbox" ${shareProfileImageChecked}>
               <label class="form-check-label" for="modalShareProfileImageCheckbox">${trans[window.curLang].settingModalPrivacy2}</label>
             </div>
             <div class="form-check mb-2">
               <input type="checkbox" class="form-check-input" id="modalShareOnlineStatusCheckbox" ${shareOnlineStatusChecked}>
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

  // 모달 컨테이너 생성 및 DOM에 추가
  const modalDiv = document.createElement('div');
  modalDiv.id = 'privacySettingsModal';
  modalDiv.className = 'modal fade';
  modalDiv.tabIndex = -1;
  modalDiv.innerHTML = modalHtml;
  document.body.appendChild(modalDiv);

  // 모달이 열릴 때 최신 localStorage 값을 불러옴
  modalDiv.addEventListener('shown.bs.modal', () => {
    loadPrivacySettingsLocally();
  });
  
  // 모달 닫힐 때 폼 리셋 (필요하다면 주석 해제)
  modalDiv.addEventListener('hidden.bs.modal', () => {
    // const privacyForm = modalDiv.querySelector('#privacySettingsForm');
    // if (privacyForm) privacyForm.reset();
  });
  
  // 개인정보 업데이트 요청 처리
  const saveBtn = modalDiv.querySelector('#privacySettingsSaveBtn');
  saveBtn.addEventListener('click', async () => {
    const showInSearch = document.getElementById('modalShowInSearchCheckbox').checked;
    const shareProfileImage = document.getElementById('modalShareProfileImageCheckbox').checked;
    const shareOnlineStatus = document.getElementById('modalShareOnlineStatusCheckbox').checked;

    try {
      await postUpdatePrivacySettings(showInSearch, shareProfileImage, shareOnlineStatus);
      // 저장 성공 시 localStorage에도 반영
      savePrivacySettingsLocally();
      alert('Success');
    } catch (error) {
      alert('Error: ' + error.message);
    }
    const modalInstance = bootstrap.Modal.getInstance(modalDiv);
    modalInstance.hide();
  });
}

// localStorage에 개인정보 설정 저장
function savePrivacySettingsLocally() {
  const showInSearch = document.getElementById('modalShowInSearchCheckbox').checked;
  const shareProfileImage = document.getElementById('modalShareProfileImageCheckbox').checked;
  const shareOnlineStatus = document.getElementById('modalShareOnlineStatusCheckbox').checked;

  const settings = {
    showInSearch,
    shareProfileImage,
    shareOnlineStatus
  };

  localStorage.setItem('privacySettings', JSON.stringify(settings));
}

// localStorage의 개인정보 설정을 폼에 반영
export function loadPrivacySettingsLocally() {
  const storedSettings = localStorage.getItem('privacySettings');
  if (storedSettings) {
    const { showInSearch, shareProfileImage, shareOnlineStatus } = JSON.parse(storedSettings);
    document.getElementById('modalShowInSearchCheckbox').checked = showInSearch;
    document.getElementById('modalShareProfileImageCheckbox').checked = shareProfileImage;
    document.getElementById('modalShareOnlineStatusCheckbox').checked = shareOnlineStatus;
  }
}
