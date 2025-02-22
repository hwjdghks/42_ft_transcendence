// login.js
import { fetchLogin, fetchLoginOTPRequest, showMessage } from './loginApi.js';

async function handleLoginSubmit(event) {
  event.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  try {
    const response = await fetchLogin({ email, password });
    sessionStorage.setItem('login_1fa', response.token);

    const otpResponse = await fetchLoginOTPRequest(response.token);
    showMessage(otpResponse.message || 'OTP has been sent. Check your email.', 'success');

    sessionStorage.setItem('login_fa', response.token);

    window.location.hash = '#login-verification';
  } catch (error) {
    showMessage(error.message || 'An error occurred. Please try again later.', 'error');
    console.error('Login error:', error);
  }
}

export function LoginPage() {
  setTimeout(() => {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', handleLoginSubmit);
    }
  }, 0);

  return `
    <div class="login-page">
      <div class="login-container">
        <h1 class="login-heading">Login</h1>
        <form class="mt-3" id="login-form">
          <div class="mb-3">
            <label for="email" class="form-label">Email address</label>
            <input type="email" class="form-control" id="email" placeholder="Enter your email">
          </div>
          <div class="mb-3">
            <label for="password" class="form-label">Password</label>
            <input type="password" class="form-control" id="password" placeholder="Enter your password">
          </div>
          <button type="submit" class="btn login-btn">Submit</button>
        </form>
        <div id="login-message" class="mt-3"></div>
        <a href="/#signup" class="btn btn-link mt-3">Sign up</a>
      </div>
    </div>
  `;
}
