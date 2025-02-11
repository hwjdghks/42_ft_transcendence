// ./scripts/router.js
import { LoginPage } from './pages/authorization/login.js';
import { SignupPage } from './pages/authorization/signup.js';

const NotFoundPage = () => `
  <div class="not-found">
    <h1>404 - Page Not Found</h1>
    <p>요청하신 페이지를 찾을 수 없습니다.</p>
    <a href="#login">로그인 페이지로 이동</a>
  </div>
`;

const pages = {
  login: () => LoginPage(),
  signup: () => SignupPage(),

  // gameOption.js에서 전역으로 등록한 함수
  "gameplay/option": window.getGameOptionPage, 
  "gameplay/list": window.getGamePlayerListPage,
  "gameplay/tournament": window.getTournamentPage,
  "gameplay/play": window.getPingPongGamePage,
  // 혹은 ESModule 방식이라면 import 해서: gameplay: getGameOptionPage,
  profile: () => {
    return window.createProfilePage().outerHTML;
  },
};

// 라우터 함수
function router() {
  // 루트 경로('/')이고 해시가 없는 경우 로그인 페이지로 리다이렉트
  if (window.location.pathname === '/' && !window.location.hash) {
    const app = document.getElementById('app');
    app.innerHTML = LoginPage();
    return;
  }

  const hash = window.location.hash.replace('#', '');
  const app = document.getElementById('app');
  
  // hash가 비어있지 않고, pages 객체에 없는 경우 404 페이지 표시
  if (hash && !pages[hash]) {
    app.innerHTML = NotFoundPage();
    return;
  }
  
  // 그 외의 경우 해당하는 페이지 또는 로그인 페이지 표시
  const renderPage = pages[hash] || pages.login;
  const pageContent = renderPage();
  
  if (typeof pageContent === 'string') {
    app.innerHTML = pageContent;
  } else {
    app.replaceChildren(pageContent);
  }
}

// 첫 로딩 시 실행
window.addEventListener('load', router);
// 해시 변경 시마다 실행
window.addEventListener('hashchange', router);