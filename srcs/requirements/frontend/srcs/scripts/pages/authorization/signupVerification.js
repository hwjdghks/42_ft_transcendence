// SignupVerificationPage.js
import { fetchOTPVerify, showMessage } from './signupApi.js';

export function SignupVerificationPage() {
  // "Sign Up" 버튼 클릭 시 호출
  async function handleVerificationSubmit(event) {
    event.preventDefault();

    const existingToken = sessionStorage.getItem("signup_fa");
    if (!existingToken) {
      showMessage('No token found. Please go back to signup page.', 'error');
      return;
    }

    const otp = document.getElementById('otp').value.trim();
    if (!otp) {
      showMessage('Please enter your OTP code.', 'error');
      return;
    }

    try {
      const verifyResponse = await fetchOTPVerify(existingToken, otp);
      sessionStorage.setItem('signup_fa', verifyResponse.token);
      showMessage(verifyResponse.message || 'Signup successful!', 'success');

      // 가입 완료 후 이동
      setTimeout(() => {
        window.location.hash = '#login';
      }, 500);
    } catch (error) {
      console.error(error);
      showMessage(error.message || 'OTP verification failed. Please try again.', 'error');
    }
  }

  setTimeout(() => {
    const verificationForm = document.getElementById('verification-form');
    if (verificationForm) {
      verificationForm.addEventListener('submit', handleVerificationSubmit);
    }
  }, 0);

  // Verification 페이지 UI 렌더
  return `
    <div class="signup-page">
      <div class="signup-container">
        <h1 class="signup-heading">Verify Code</h1>
        <form class="mt-3" id="verification-form">
          <div class="mb-3">
            <label for="otp" class="form-label">Verification Code</label>
            <input type="text" class="form-control" id="otp" placeholder="Enter OTP code" />
          </div>
          <button type="submit" class="btn signup-btn" id="verify-btn">Sign Up</button>
        </form>
        <div id="signup-message" class="mt-3"></div>
      </div>
    </div>
  `;
}
