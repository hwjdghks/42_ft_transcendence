import { trans } from '../../language.js';
import { postRequestOTP, postWithdrawAccount } from '../../api/scriptApi.js';

export function createDeleteAccountModal() {
  // 이미 존재하면 재생하지 않음
  if (document.getElementById('deleteAccountModal')) return;

  // 모달 DOM 생성
  const modalDiv = document.createElement('div');
  modalDiv.id = 'deleteAccountModal';
  modalDiv.className = 'modal fade';
  modalDiv.tabIndex = -1;
  modalDiv.innerHTML = `
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title text-danger">${trans[window.curLang].settingModalDelete}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <p>${trans[window.curLang].settingModalDeleteBody}</p>
          <input type="text" id="otpInput" class="form-control" placeholder="${trans[window.curLang].settingModalDeleteHolder}">
          <div id="deleteAccountMessage" class="mt-2"></div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${trans[window.curLang].Cancel}</button>
          <button type="button" class="btn btn-danger" id="confirmDelete" disabled>${trans[window.curLang].settingModalBtn}</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modalDiv);

  // Bootstrap 모달 인스턴스 생성
  const bootstrapModal = new bootstrap.Modal(modalDiv);

  // 메시지 출력 함수
  function showMessage(message, type = 'success') {
    const messageDiv = modalDiv.querySelector('#deleteAccountMessage');
    messageDiv.textContent = message;
    messageDiv.className = type === 'success' ? 'text-success mt-2' : 'text-danger mt-2';
  }

  // 모달 내 DOM 요소 참조
  const otpInput = modalDiv.querySelector('#otpInput');
  const confirmDeleteBtn = modalDiv.querySelector('#confirmDelete');

  // 모달이 열리면 OTP 요청
  modalDiv.addEventListener('shown.bs.modal', async () => {
    showMessage('');
    try {
      const data = await postRequestOTP();
      showMessage(data.message || 'OTP가 전송되었습니다.', 'success');
    } catch (error) {
      showMessage(error.message || 'OTP 요청 중 오류가 발생했습니다.', 'error');
    }
  });

  // 모달이 닫힐 때 필드와 상태 초기화
  modalDiv.addEventListener('hidden.bs.modal', () => {
    otpInput.value = '';
    showMessage('');
    confirmDeleteBtn.disabled = true;
  });

  // OTP 입력에 따라 확인 버튼 활성화 처리
  otpInput.addEventListener('input', () => {
    confirmDeleteBtn.disabled = otpInput.value.trim() === '';
  });

  // 탈퇴 버튼 클릭 시 계정 탈퇴 처리
  confirmDeleteBtn.addEventListener('click', async () => {
    const otpValue = otpInput.value.trim();
    if (!otpValue) {
      showMessage('OTP 코드를 입력해주세요.', 'error');
      return;
    }
    try {
      const data = await postWithdrawAccount(otpValue);
      // 성공 처리
      sessionStorage.clear();
      otpInput.value = '';
      showMessage('');
      if (document.activeElement) document.activeElement.blur();

      bootstrapModal.hide();
      setTimeout(() => {
        // 백드롭 제거 및 모달 DOM 삭제
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) backdrop.remove();
        modalDiv.remove();
        // 로그인 페이지로 이동 후 알림 표시
        window.location.href = '#login';
        alert(data.message || '계정이 성공적으로 삭제되었습니다.');
      }, 500);
    } catch (error) {
      showMessage(error.message || '탈퇴 요청 중 오류가 발생했습니다.', 'error');
    }
  });

  return modalDiv;
}
