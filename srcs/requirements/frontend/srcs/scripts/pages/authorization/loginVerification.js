import { fetchLoginOTPVerify, showMessage } from './loginApi.js';

export function LoginVerificationPage() {
  async function verifyTokenOnLoad() {
    const existingToken = sessionStorage.getItem("fa_temp_token");
    if (!existingToken) {
      alert("접근 할 수 없는 페이지 입니다.");
      window.location.hash = '#login';
    }
  }

  async function handleVerificationSubmit(event) {
    event.preventDefault();
  
    const existingToken = sessionStorage.getItem("fa_temp_token");
    if (!existingToken) {
      showMessage('No token found. Please go back to login page.', 'error');
      return;
    }

    const otp = document.getElementById('otp').value.trim();
    if (!otp) {
      showMessage('Please enter your OTP code.', 'error');
      return;
    }

    try {
      // 중복 제출 방지: 버튼 비활성화
      document.getElementById('verify-btn').disabled = true;
      const verifyResponse = await fetchLoginOTPVerify(existingToken, otp);
      
      // OTP 검증 성공 시 최종 토큰으로 업데이트하고 임시 토큰 제거
      sessionStorage.setItem('fa_token', verifyResponse.token);
      sessionStorage.removeItem('fa_temp_token');
      
      showMessage(verifyResponse.message || 'Login successful!', 'success');
      setTimeout(() => {
        window.location.hash = '#profile';
      }, 500);
    } catch (error) {
      console.error(error);
      showMessage(error.message || 'OTP verification failed. Please try again.', 'error');
      // 에러 발생 시 버튼 다시 활성화
      document.getElementById('verify-btn').disabled = false;
    }
  }

  verifyTokenOnLoad();

  setTimeout(() => {
    const verificationForm = document.getElementById('verification-form');
    if (verificationForm) {
      verificationForm.addEventListener('submit', handleVerificationSubmit);
    }
  }, 0);

  return `
    <div class="login-page">
      <div class="login-container">
        <h1 class="login-heading">Verify Code</h1>
        <form class="mt-3" id="verification-form">
          <div class="mb-3">
            <label for="otp" class="form-label">Verification Code</label>
            <input type="text" class="form-control" id="otp" placeholder="Enter OTP code" />
          </div>
          <button type="submit" class="btn login-btn" id="verify-btn">Verify</button>
        </form>
        <div id="login-message" class="mt-3"></div>
      </div>
    </div>
  `;
}
