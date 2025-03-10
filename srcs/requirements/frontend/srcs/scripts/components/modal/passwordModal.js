import { trans } from '../../language.js';
import { isInputPasswordValid } from '../../validation/inputData.js';
import { postUpdatePassword } from '../../api/scriptApi.js';

export function createPasswordModal() {
  if (document.getElementById('passwordModal')) return;

  const modalDiv = document.createElement('div');
  modalDiv.id = 'passwordModal';
  modalDiv.className = 'modal fade';
  modalDiv.tabIndex = -1;
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
  
    const newPasswordHint = newPasswordInput.parentElement.querySelector('small');
    const confirmPasswordHint = confirmPasswordInput.parentElement.querySelector('small');
  
    if (!newPasswordValid) {
      newPasswordInput.classList.add('is-invalid');
      if (newPasswordHint) newPasswordHint.classList.add('text-danger');
    } else {
      newPasswordInput.classList.remove('is-invalid');
      if (newPasswordHint) newPasswordHint.classList.remove('text-danger');
    }
  
    if (!passwordsMatch) {
      confirmPasswordInput.classList.add('is-invalid');
      if (confirmPasswordHint) confirmPasswordHint.classList.add('text-danger');
    } else {
      confirmPasswordInput.classList.remove('is-invalid');
      if (confirmPasswordHint) confirmPasswordHint.classList.remove('text-danger');
    }
  
    savePasswordBtn.disabled = !(currentPassword && newPasswordValid && passwordsMatch);
  }
  
  currentPasswordInput.addEventListener('input', validatePasswordFields);
  newPasswordInput.addEventListener('input', validatePasswordFields);
  confirmPasswordInput.addEventListener('input', validatePasswordFields);

  modalDiv.addEventListener('hidden.bs.modal', () => {
    passwordForm.reset();
    confirmPasswordInput.classList.remove('is-invalid');
    savePasswordBtn.disabled = true;
  });

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
