import { fetchSignup, fetchOTPRequest, showMessage } from './signupApi.js';

export function SignupPage() {
  async function handleSendCodeSubmit(event) {
    event.preventDefault();

    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm_password').value;

    if (password !== confirmPassword) {
      showMessage('Passwords do not match. Please try again.', 'error');
      return;
    }

    try {
      const signupResponse = await fetchSignup({ username, email, password });
      console.log("Signup Response:", signupResponse);

      // 임시 토큰으로 저장
      sessionStorage.setItem('fa_temp_token', signupResponse.token);

      const otpResponse = await fetchOTPRequest(signupResponse.token);
      console.log("OTP Response:", otpResponse);
      showMessage(otpResponse.message || 'OTP has been sent. Check your email.', 'success');

      window.location.hash = '#signup-verification'; 
    } catch (error) {
      console.error(error);
      showMessage(error.message || 'Signup failed. Please try again.', 'error');
    }
  }

  setTimeout(() => {
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
      signupForm.addEventListener('submit', handleSendCodeSubmit);
    }
  }, 0);

  return `
    <div class="signup-page">
      <div class="signup-container">
        <h1 class="signup-heading">Sign Up</h1>
        <form class="mt-3" id="signup-form">
          <div class="mb-3">
            <label for="username" class="form-label">Username</label>
            <input type="text" class="form-control" id="username" placeholder="Enter your username" />
          </div>
          <div class="mb-3">
            <label for="email" class="form-label">Email address</label>
            <input type="email" class="form-control" id="email" placeholder="Enter your email" />
          </div>
          <div class="mb-3">
            <label for="password" class="form-label">Password</label>
            <input type="password" class="form-control" id="password" placeholder="Enter your password" />
          </div>
          <div class="mb-3">
            <label for="confirm_password" class="form-label">Confirm Password</label>
            <input type="password" class="form-control" id="confirm_password" placeholder="Confirm your password" />
          </div>
          <button type="submit" class="btn signup-btn" id="signup-btn">Send Code</button>
        </form>
        <div id="signup-message" class="mt-3"></div>
      </div>
    </div>
  `;
}
