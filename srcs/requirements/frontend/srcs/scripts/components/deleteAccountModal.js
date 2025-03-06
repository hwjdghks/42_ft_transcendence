export function createDeleteAccountModal() {
    // 모달 HTML 생성: 기존 username 확인 필드를 제거하고 OTP 입력 필드를 추가함
    const modal = document.createElement('div');
    modal.innerHTML = `
      <div id="deleteAccountModal" class="modal fade" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h2 class="h4 mb-3">
                <span class="fs-1 fw-bold text-danger">Warning</span>
              </h2>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <p>
                계정 탈퇴를 진행하기 위해 이메일로 OTP가 전송되었습니다.<br>
                OTP 코드를 입력해주세요.
              </p>
              <input type="text" id="otpInput" class="form-control" placeholder="Enter OTP code">
              <div id="deleteAccountMessage" class="mt-2"></div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="button" class="btn btn-danger" id="confirmDelete" disabled>Delete Account</button>
            </div>
          </div>
        </div>
      </div>
    `;
  
    document.body.appendChild(modal);
  
    // Bootstrap 모달 인스턴스 생성
    const deleteAccountModalEl = document.getElementById('deleteAccountModal');
    const bootstrapModal = new bootstrap.Modal(deleteAccountModalEl);
  
    // sessionStorage에서 JWT 토큰(fa_token) 가져오기
    const token = sessionStorage.getItem('fa_token');
  
    // 모달 내 메시지 표시 함수 (로그인 방식과 동일한 형식)
    function showMessage(message, type = 'success') {
      const messageDiv = document.getElementById('deleteAccountMessage');
      messageDiv.textContent = message;
      messageDiv.className = type === 'success' ? 'text-success' : 'text-danger';
    }
  
    // OTP 요청 API 호출 함수
    function requestOTP() {
      fetch('https://localhost/api/auth/2fa/withdraw/request/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({})
      })
        .then(response => response.json())
        .then(data => {
          // OTP 요청 성공 시, 백엔드에서 전달된 메시지를 표시
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
  
    // 모달이 열리면 OTP 자동 요청 (Bootstrap 이벤트 활용)
    deleteAccountModalEl.addEventListener('shown.bs.modal', () => {
      // 이전 메시지 초기화
      showMessage('');
      // OTP 요청
      requestOTP();
    });
  
    // OTP 입력 필드와 탈퇴 확인 버튼 요소 가져오기
    const otpInput = modal.querySelector('#otpInput');
    const confirmDeleteBtn = modal.querySelector('#confirmDelete');
  
    // OTP 입력이 있으면 탈퇴 버튼 활성화
    otpInput.addEventListener('input', () => {
      if (otpInput.value.trim() !== '') {
        confirmDeleteBtn.disabled = false;
      } else {
        confirmDeleteBtn.disabled = true;
      }
    });
  
    // 탈퇴 요청 처리
    confirmDeleteBtn.addEventListener('click', () => {
      const otpValue = otpInput.value.trim();
      if (!otpValue) {
        showMessage('OTP 코드를 입력해주세요.', 'error');
        return;
      }
  
      fetch('https://localhost/api/users/withdraw/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ otp: otpValue })
      })
        .then(response =>
          response.json().then(data => ({ ok: response.ok, data }))
        )
        .then(({ ok, data }) => {
          if (ok) {
            // 탈퇴 성공: 성공 메시지 출력 후 세션 클리어 및 로그인 페이지로 이동
            alert(data.message || '계정이 성공적으로 삭제되었습니다.');
            sessionStorage.clear();
            bootstrapModal.hide();
            setTimeout(() => {
              window.location.href = '#login';
            }, 500);
          } else {
            // 탈퇴 실패: 백엔드에서 받은 오류 메시지를 표시
            showMessage(data.message || '탈퇴 실패. 다시 시도해주세요.', 'error');
          }
        })
        .catch(error => {
          showMessage(error.message || '탈퇴 요청 중 오류가 발생했습니다.', 'error');
        });
    });
  
    return modal;
  }
  