import { fetchOTPVerify, showMessage } from './signupApi.js';
import { checkTempCookie } from '../../validation/cookie.js';
import { trans } from '../../language.js';

export function SignupVerificationPage() {
  sessionStorage.removeItem('verificationAllowed');
  async function verifyTokenOnLoad() {
    const existingToken = await checkTempCookie();
    if (!existingToken) {
      alert("접근 할 수 없는 페이지 입니다.");
      window.location.hash = '#signup';
    }
  }

  async function handleVerificationSubmit(event) {
    event.preventDefault();

    const existingToken = await checkTempCookie();
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
      document.getElementById('verify-btn').disabled = true;
      const verifyResponse = await fetchOTPVerify(otp);
      
      showMessage(verifyResponse.message || 'Signup successful!', 'success');
      setTimeout(() => {
        window.location.hash = '#login';
      }, 500);
    } catch (error) {
      console.error(error);
      showMessage(error.message || 'OTP verification failed. Please try again.', 'error');
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
    <div class="signup-page">
      <div class="signup-container">
        <h1 class="signup-heading">${trans[window.curLang].verifyHeader}</h1>
        <form class="mt-3" id="verification-form">
          <div class="mb-3">
            <label for="otp" class="form-label">${trans[window.curLang].verifyCode}</label>
            <input type="text" class="form-control" id="otp" placeholder="${trans[window.curLang].verifyCodeHolder}" />
          </div>
          <button type="submit" class="btn signup-btn" id="verify-btn">${trans[window.curLang].verifyBtn}</button>
        </form>
        <div id="signup-message" class="mt-3"></div>
      </div>
    </div>
  `;
}
