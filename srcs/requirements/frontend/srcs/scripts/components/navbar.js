import { checkCookie } from '../validation/cookie.js';
import { trans } from '../language.js';

const navbar = document.getElementById('navbar');

async function isLoggedIn() {
  const token = await checkCookie();
  console.log("🔹 [isLoggedIn] JWT Token 상태:", token);
  return token !== null && token !== "undefined"; 
}

function updateNavbar() {
  const navbar = document.getElementById('navbar');
  navbar.innerHTML = `
    <nav>
      <div>
        <div>
          <img src="../static/logo.png" alt="Logo">
          <a href="#profile" class="nav-link protected-link">${trans[window.curLang].navProfile}</a>
          <a href="#gameplay/option" class="nav-link protected-link">${trans[window.curLang].navGamePlay}</a>
        </div>
      </div>
    </nav>
  `;

  // console.log("🔹 [updateNavbar] 네비게이션 업데이트 완료");

  document.querySelectorAll('.protected-link').forEach(link => {
      link.addEventListener('click', (event) => {
          console.log("🔹 [protected-link] 클릭됨, 로그인 상태:", isLoggedIn());

          if (!isLoggedIn()) {
              event.preventDefault();
              alert('Log in is required.');
              window.location.hash = "#login";
          }
      });
  });

  updateActiveLink();
}

function updateActiveLink() {
  const currentHash = window.location.hash;
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === currentHash);
  });
}

window.updateNavbar = updateNavbar;
window.addEventListener('DOMContentLoaded', updateNavbar);
window.addEventListener('hashchange', updateNavbar);
