import { fetchLoginOTPVerify, showMessage } from './loginApi.js';
import { fetchFriends } from '../../components/friends.js'
import { checkTempCookie } from '../../validation/cookie.js';
import { trans } from '../../language.js';

export function LoginVerificationPage() {
  sessionStorage.removeItem('verificationAllowed');
  async function verifyTokenOnLoad() {
    const existingToken = await checkTempCookie();
    if (!existingToken) {
      alert("접근 할 수 없는 페이지 입니다.");
      window.location.hash = '#login';
    }
  }

  async function handleVerificationSubmit(event) {
    event.preventDefault();
    
    const existingToken = await checkTempCookie();
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
      document.getElementById('verify-btn').disabled = true;
      const verifyResponse = await fetchLoginOTPVerify(otp);
  
      sessionStorage.setItem('username', verifyResponse.username);

  
      setTimeout(async () => {
        fetchFriends();
        window.location.hash = "#profile"; 
      }, 1000);
  
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
    <div class="login-page">
      <div class="login-container">
        <h1 class="login-heading">${trans[window.curLang].verifyHeader}</h1>
        <form class="mt-3" id="verification-form">
          <div class="mb-3">
            <label for="otp" class="form-label">${trans[window.curLang].verifyCode}</label>
            <input type="text" class="form-control" id="otp" placeholder="${trans[window.curLang].verifyCodeHolder}" />
          </div>
          <button type="submit" class="btn login-btn" id="verify-btn">${trans[window.curLang].verifyBtn}</button>
        </form>
        <div id="login-message" class="mt-3"></div>
      </div>
    </div>
  `;
}
