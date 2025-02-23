import { fetchOTPVerify, showMessage } from './signupApi.js';

export function SignupVerificationPage() {
  async function verifyTokenOnLoad() {
    const existingToken = sessionStorage.getItem("fa_token");
    if (!existingToken) {
      alert("접근 할 수 없는 페이지 입니다.");
      window.location.hash = '#signup';
    }
  }

  async function handleVerificationSubmit(event) {
    event.preventDefault();

    const existingToken = sessionStorage.getItem("fa_token");
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
      sessionStorage.setItem('fa_token', verifyResponse.token);
      showMessage(verifyResponse.message || 'Signup successful!', 'success');

      setTimeout(() => {
        window.location.hash = '#login';
      }, 500);
    } catch (error) {
      console.error(error);
      showMessage(error.message || 'OTP verification failed. Please try again.', 'error');
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
