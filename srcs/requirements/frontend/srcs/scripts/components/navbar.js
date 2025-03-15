import { checkCookie } from '../validation/cookie.js';
import { trans } from '../language.js';

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
    navbar.innerHTML = `
      <nav class="navbar navbar-expand bg-light sticky-top py-2">
        <div class="container d-flex justify-content-center align-items-center">
            <img src="../static/logo.png" alt="Logo" height="30">
        </div>
      </nav>
    `;
  } else {
    navbar.innerHTML = `
      <nav class="navbar navbar-expand bg-light sticky-top py-2">
        <div class="container d-flex justify-content-center align-items-center gap-3">
            <img src="../static/logo.png" alt="Logo" height="30">
          <a href="#profile" class="nav-link fw-bold fs-5 protected-link">${trans[window.curLang].navProfile}</a>
          <a href="#gameplay/option" class="nav-link fw-bold fs-5 protected-link">${trans[window.curLang].navGamePlay}</a>
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
