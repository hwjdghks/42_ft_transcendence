import { trans } from '../language.js';

export function createDeleteAccountModal() {
  const modal = document.createElement('div');
  modal.innerHTML = `
      <div id="deleteAccountModal" class="modal fade" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h2 class="h4 mb-3">
                <span class="fs-1 fw-bold text-danger">${trans[window.curLang].settingModalDelete}</span>
              </h2>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
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
      </div>
    `;
  document.body.appendChild(modal);
  const deleteAccountModalEl = document.getElementById('deleteAccountModal');
  const bootstrapModal = new bootstrap.Modal(deleteAccountModalEl);

  function showMessage(message, type = 'success') {
    const messageDiv = document.getElementById('deleteAccountMessage');
    messageDiv.textContent = message;
    messageDiv.className = type === 'success' ? 'text-success' : 'text-danger';
  }

  function requestOTP() {
    fetch('https://localhost/api/auth/2fa/withdraw/request/', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({})
    })
      .then(response => response.json())
      .then(data => {
        if (data && data.message) {
          showMessage(data.message, 'success');
        } else {
          showMessage('OTP가 전송되었습니다.', 'success');
        }
      })
      .catch(error => {
        showMessage(error.message || 'OTP 요청 중 오류가 발생했습니다.', 'error');
      });
  }

  deleteAccountModalEl.addEventListener('shown.bs.modal', () => {
    showMessage('');
    requestOTP();
  });

  deleteAccountModalEl.addEventListener('hidden.bs.modal', () => {
    const otpInput = modal.querySelector('#otpInput');
    otpInput.value = '';
    showMessage('');
    const confirmDeleteBtn = modal.querySelector('#confirmDelete');
    confirmDeleteBtn.disabled = true;
  });

  const otpInput = modal.querySelector('#otpInput');
  const confirmDeleteBtn = modal.querySelector('#confirmDelete');

  otpInput.addEventListener('input', () => {
    confirmDeleteBtn.disabled = otpInput.value.trim() === '';
  });

  confirmDeleteBtn.addEventListener('click', () => {
    const otpValue = otpInput.value.trim();
    if (!otpValue) {
      showMessage('OTP 코드를 입력해주세요.', 'error');
      return;
    }
    fetch('https://localhost/api/users/withdraw/', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ otp: otpValue })
    })
      .then(response => response.json().then(data => ({ ok: response.ok, data })))
      .then(({ ok, data }) => {
        if (ok) {
          // 성공 처리
          sessionStorage.clear();
          otpInput.value = '';
          showMessage('');
          if (document.activeElement) document.activeElement.blur();
  
          // 모달 닫기
          bootstrapModal.hide();
  
          // ★ 모달 닫힘 애니메이션 대기 후 처리
          setTimeout(() => {
            // 백드롭 제거
            const backdrop = document.querySelector('.modal-backdrop');
            if (backdrop) backdrop.remove();
  
            // 모달 DOM 제거
            modal.remove();
  
            // 로그인 페이지로 이동
            window.location.href = '#login';
  
            // 알림 표시 (비차단식 토스트 사용도 고려 가능)
            alert(data.message || '계정이 성공적으로 삭제되었습니다.');
          }, 500); // 모달 fade 애니메이션 시간이 보통 300~500ms 정도
        } else {
          // 실패 처리
          showMessage(data.message || '탈퇴 실패. 다시 시도해주세요.', 'error');
        }
      })
      .catch(error => {
        showMessage(error.message || '탈퇴 요청 중 오류가 발생했습니다.', 'error');
      });
  });
  
  
  
  return modal;
}
