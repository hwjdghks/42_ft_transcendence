import { fetchLogin, fetchLoginOTPRequest, showMessage } from './loginApi.js';
import { fetchFriends } from '../../components/friends.js';
import { trans } from '../../language.js';

async function handleLoginSubmit(event) {
  event.preventDefault();
  
  const loginBtn = document.querySelector('.btn.login-btn');
  loginBtn.disabled = true;

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  try {
    const response = await fetchLogin({ email, password });
    const otpResponse = await fetchLoginOTPRequest();
    showMessage(otpResponse.message || 'OTP has been sent. Check your email.', 'success');

    setTimeout(async () => {
      sessionStorage.setItem('verificationAllowed', 'true');
      window.location.hash = "#login-verification"; 
      
      loginBtn.disabled = false;
    }, 1000);

  } catch (error) {
    showMessage(error.message || 'An error occurred. Please try again later.', 'error');
    console.error('Login error:', error);
    loginBtn.disabled = false;
  }
}

async function handleOauthSubmit(event) {
  event.preventDefault();
  console.log("Oauth btn click!");

  try {
    const response = await fetch("https://localhost/api/oauth/42intra/signin/", {
      method: "GET",
      credentials: 'include',
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error("Failed to fetch redirect URL");
    }

    const data = await response.json();
    if (data.redirect_url) {
      window.location.href = data.redirect_url;
    } else {
      throw new Error("redirect_url not found in response");
    }
  } catch (error) {
    console.error("Redirection error:", error);
    showMessage(error.message || "Redirection error", "error");
  }
}

export function LoginPage() {
  setTimeout(() => {
    const loginForm = document.getElementById('login-form');
    const oauthBtn = document.querySelector('.btn.oauth-btn');
    oauthBtn.addEventListener('click', handleOauthSubmit);
    if (loginForm) {
      loginForm.addEventListener('submit', handleLoginSubmit);
    }
  }, 0);

  return `
    <div class="login-page">
      <div class="login-container">
        <h3 class="login-heading">${trans[window.curLang].loginHeader}</h3>
        <form class="mt-3" id="login-form">
          <div class="mb-3">
            <label for="email" class="form-label">${trans[window.curLang].loginEmail}</label>
            <input type="email" class="form-control" id="email" placeholder="${trans[window.curLang].loginEmailHolder}">
          </div>
          <div class="mb-3">
            <label for="password" class="form-label">${trans[window.curLang].loginPassword}</label>
            <input type="password" class="form-control" id="password" placeholder="${trans[window.curLang].loginPasswordHolder}">
          </div>
          <button type="submit" class="btn login-btn">${trans[window.curLang].loginBtn}</button>
          <button type="button" class="btn oauth-btn">${trans[window.curLang].loginOauthBtn}</button>
        </form>
        <div id="login-message" class="mt-3"></div>
        <a href="/#signup" class="btn btn-link mt-3">${trans[window.curLang].loginSignupBtn}</a>
      </div>
    </div>
  `;
}
