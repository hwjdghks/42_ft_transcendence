import { fetchSignup, fetchOTPRequest, showMessage } from './signupApi.js';
import { trans } from '../../language.js';

export function SignupPage() {
  async function handleSendCodeSubmit(event) {
    event.preventDefault();

    const signupBtn = document.querySelector('.btn.signup-btn');
    signupBtn.disabled = true;

    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm_password').value;

    const requiredConsent = document.getElementById('requiredConsent').checked;
    if (!requiredConsent) {
      showMessage('You must agree to the required privacy policy to sign up.', 'error');
      signupBtn.disabled = false;
      return;
    }

    if (password !== confirmPassword) {
      showMessage('Passwords do not match. Please try again.', 'error');
      signupBtn.disabled = false;
      return;
    }

    const friendSearchConsent = document.getElementById('friendSearchConsent').checked;
    const profileImageConsent = document.getElementById('profileImageConsent').checked;
    const onlineStatusConsent = document.getElementById('onlineStatusConsent').checked;

    try {
      const signupResponse = await fetchSignup({ 
        username, 
        email, 
        password, 
        show_in_search: friendSearchConsent, 
        share_profile_image: profileImageConsent, 
        share_online_status: onlineStatusConsent 
      });
      // console.log("Signup Response:", signupResponse);
  
      const otpResponse = await fetchOTPRequest();
      // console.log("OTP Response:", otpResponse);
      showMessage(otpResponse.message || 'OTP has been sent. Check your email.', 'success');
      sessionStorage.setItem('verificationAllowed', 'true');

      setTimeout(() => {
        window.location.hash = '#signup-verification';
        signupBtn.disabled = false;
      }, 1000);
    } catch (error) {
      console.error(error);
      showMessage(error.message || 'Signup failed. Please try again.', 'error');
      signupBtn.disabled = false;
    }
  }

  setTimeout(() => {
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
      signupForm.addEventListener('submit', handleSendCodeSubmit);
    }
  }, 0);

  return `
  <style>
    .signup-container {
      max-height: 80vh;
      overflow-y: auto;
    }
  </style>
  <div class="signup-page">
    <div class="signup-container">
      <h1 class="signup-heading">${trans[window.curLang].signupHeader}</h1>
      <form class="mt-3" id="signup-form">
        <div class="mb-3">
          <label for="username" class="form-label">${trans[window.curLang].signupUsername}</label>
          <input type="text" class="form-control" id="username" placeholder="${trans[window.curLang].signupUsernameHolder}" />
        </div>
        <div class="mb-3">
          <label for="email" class="form-label">${trans[window.curLang].signupEmail}</label>
          <input type="email" class="form-control" id="email" placeholder="${trans[window.curLang].signupEmailHolder}" />
        </div>
        <div class="mb-3">
          <label for="password" class="form-label">${trans[window.curLang].signupPassword}</label>
          <input type="password" class="form-control" id="password" placeholder="${trans[window.curLang].signupPasswordHolder}" />
        </div>
        <div class="mb-3">
          <label for="confirm_password" class="form-label">${trans[window.curLang].signupConfirmPassword}</label>
          <input type="password" class="form-control" id="confirm_password" placeholder="${trans[window.curLang].signupConfirmPasswordHolder}" />
        </div>

        <!-- 필수 동의 항목 -->
        <div class="card mb-3">
          <div class="card-header">
            개인정보 수집 및 이용 동의 안내 (필수 항목)
          </div>
          <div class="card-body">
            <p><strong>이메일</strong>: 회원가입 및 로그인 시 본인 인증, 계정 관련 공지 전달</p>
            <p><strong>유저네임</strong>: 게임 내 아이디 및 친구 기능(친구 검색, 친구 추가 등)에 사용</p>
            <p><strong>비밀번호</strong>: 계정 보호 및 로그인 인증</p>
            <hr />
            <p><strong>통제자 정보</strong>: 본 서비스는 팀 프로젝트로 운영됩니다.</p>
            <p>책임자: minkyole</p>
            <p>연락처: 이메일 – [fkfkalsrb@gmail.com]</p>
            <hr />
            <p><strong>처리 목적 및 법적 근거</strong>:</p>
            <ul>
              <li>회원가입 및 로그인: 회원님의 신원 확인 및 계정 보호를 위함 (법적 근거: 명시적 동의)</li>
              <li>게임 내 친구 기능 제공: 친구 검색, 친구 추가, 프로필 공개 등 (법적 근거: 명시적 동의)</li>
            </ul>
            <div class="form-check">
              <input type="checkbox" class="form-check-input" id="requiredConsent" required>
              <label class="form-check-label" for="requiredConsent">
                위 개인정보 수집 및 이용에 동의합니다. (필수)
              </label>
            </div>
            <hr />
            <p><strong>보관 기간</strong>: 회원가입 후 계정이 유지되는 동안 보관되며, 회원 탈퇴 시 즉시 삭제됩니다.</p>
            <p><strong>동의 철회</strong>: 필수 항목의 경우 동의 철회 시 가입이 불가하며, 기존 계정도 삭제됩니다. 선택 항목은 언제든지 설정에서 변경 가능합니다.</p>
            <p><strong>개인정보 제공 의무</strong>: 필수 항목 미제공 시 가입이 거절되며, 선택 항목 미제공 시 친구 관련 기능에 제한이 있을 수 있습니다.</p>
          </div>
        </div>

        <!-- 선택 동의 항목 -->
        <div class="card mb-3">
          <div class="card-header">
            개인정보 수집 및 이용 동의 안내 (선택 항목)
          </div>
          <div class="card-body">
            <div class="form-check mb-2">
              <input type="checkbox" class="form-check-input" id="friendSearchConsent">
              <label class="form-check-label" for="friendSearchConsent">
                친구 검색 표시: 다른 유저가 친구 검색 시 회원님의 정보(유저네임)가 노출됩니다.
              </label>
            </div>
            <div class="form-check mb-2">
              <input type="checkbox" class="form-check-input" id="profileImageConsent">
              <label class="form-check-label" for="profileImageConsent">
                프로필 사진 공유: 친구들에게 회원님의 프로필 사진이 공개됩니다.
              </label>
            </div>
            <div class="form-check mb-2">
              <input type="checkbox" class="form-check-input" id="onlineStatusConsent">
              <label class="form-check-label" for="onlineStatusConsent">
                온라인 상태 공유: 친구들이 회원님의 온라인 접속 여부를 확인할 수 있습니다.
              </label>
            </div>
            <p>※ 해당 선택 항목은 친구 기능 제공(친구 검색, 친구 추가 등)을 위함입니다.</p>
          </div>
        </div>

        <button type="submit" class="btn signup-btn" id="signup-btn">${trans[window.curLang].signupSendBtn}</button>
        <div id="signup-message"></div>
        <a href="/#login" class="btn btn-link mt-3">${trans[window.curLang].signupLoginBtn}</a>
      </form>
    </div>
  </div>
  `;
}
