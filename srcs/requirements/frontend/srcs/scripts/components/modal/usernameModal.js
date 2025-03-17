import { trans } from '../../language.js';
import { isInputUsernameValid } from '../../validation/inputData.js';
import { postUpdateUsername } from '../../api/scriptApi.js';
import { renderMatchHistory } from '../matchHistory.js';

export function createUsernameModal() {
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
      newUsernameInput.nextElementSibling.classList.remove('text-danger');
    } else {
      newUsernameInput.classList.add('is-invalid');
      usernameSaveBtn.disabled = true;
      newUsernameInput.nextElementSibling.classList.add('text-danger');
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
      const usernameElement = document.querySelector('.fs-3.fw-bold');
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
