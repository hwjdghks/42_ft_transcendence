import { checkCookie } from '../validation/cookie.js';
import { trans, changeLanguage } from '../language.js';
import { postLogout } from '../api/scriptApi.js';

// 토큰 쿠키 삭제 함수
function clearTokenCookie() {
  document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

async function isLoggedIn() {
  const token = await checkCookie();
  console.log("🔹 [isLoggedIn] JWT Token 상태:", token);
  return token !== null && token !== "undefined";
}

function updateNavbar() {
  const navbar = document.getElementById('navbar');
  const currentHash = window.location.hash;
  
  // 인증 관련 페이지: 로그인, 회원가입, OTP 인증 등 (해시가 없는 경우도 포함)
  const authPages = ["#login", "#signup", "#login-verification", "#signup-verification", "#oauth-callback"];
  const isAuthPage = !currentHash || authPages.some(page => currentHash.startsWith(page));

  if (isAuthPage) {
    // 인증 페이지에서는 로고와 언어 전환 이모지만 렌더링
    navbar.innerHTML = `
      <nav>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <img src="../static/logo.png" alt="Logo" style="height: 30px;">
          </div>
        </div>
      </nav>
    `;
  } else {
    // 보호된 페이지에서는 프로필, 게임 메뉴 링크도 함께 렌더링
    navbar.innerHTML = `
      <nav>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 20px;">
            <img src="../static/logo.png" alt="Logo" style="height: 30px;">
            <a href="#profile" class="nav-link protected-link">${trans[window.curLang].navProfile}</a>
            <a href="#gameplay/option" class="nav-link protected-link">${trans[window.curLang].navGamePlay}</a>
          </div>
        </div>
      </nav>
    `;

    // 보호된 링크 클릭 시 로그인 상태 검증
    document.querySelectorAll('.protected-link').forEach(link => {
      link.addEventListener('click', async (event) => {
        if (!(await isLoggedIn())) {
          event.preventDefault();
          alert('Log in is required.');
          window.location.hash = "#login";
        }
      });
    });
  }

  updateActiveLink();
}

function updateActiveLink() {
  const currentHash = window.location.hash;
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === currentHash);
  });
}

// 창 닫거나 새로고침할 때 쿠키 토큰 삭제
window.addEventListener('beforeunload', clearTokenCookie);

window.updateNavbar = updateNavbar;
window.addEventListener('DOMContentLoaded', updateNavbar);
window.addEventListener('hashchange', updateNavbar);
