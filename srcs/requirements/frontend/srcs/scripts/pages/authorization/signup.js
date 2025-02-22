// SignupPage.js
import { fetchSignup, fetchOTPRequest, showMessage } from './signupApi.js'; // 공통 함수 모듈화 예시
// 만약 기존처럼 이 파일 안에 다 작성하고 싶다면 import 대신 기존 함수를 그대로 두면 됨.

export function SignupPage() {
  // "Send Code" 버튼 클릭 시 호출
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
      // 1. 회원가입
      const signupResponse = await fetchSignup({ username, email, password });
      console.log("Signup Response:", signupResponse);

      // 2. 1차 토큰 저장
      sessionStorage.setItem('signup_fa', signupResponse.token);

      // 3. OTP 요청
      const otpResponse = await fetchOTPRequest(signupResponse.token);
      console.log("OTP Response:", otpResponse);
      showMessage(otpResponse.message || 'OTP has been sent. Check your email.', 'success');

      // 4. 다음 페이지(Verification)로 이동
      window.location.hash = '#signup-verification'; 
      // 해시 라우팅을 사용한다면 이렇게, 
      // 아니면 window.location = '/signup-verification.html' 같은 식으로 페이지 이동

    } catch (error) {
      console.error(error);
      showMessage(error.message || 'Signup failed. Please try again.', 'error');
    }
  }

  // 페이지 로딩 후 이벤트 바인딩
  setTimeout(() => {
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
      signupForm.addEventListener('submit', handleSendCodeSubmit);
    }
  }, 0);

  // Signup 페이지의 UI 렌더
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
