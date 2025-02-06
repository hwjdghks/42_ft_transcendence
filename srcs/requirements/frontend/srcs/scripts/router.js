// ./scripts/router.js

const pages = {
  login: () => `
    <h1>Login Page</h1>
    <p>Welcome to the login page.</p>
  `,

  signup: () => `
    <h1>Signup Page</h1>
    <p>Sign up to create an account.</p>
  `,


  "gameplay/option": window.getGameOptionPage, 
  "gameplay/list": window.getGamePlayerListPage,
  "gameplay/tournamant": window.getTournamentPage,
  "gameplay/play": window.getPingPongGamePage,

  profile: () => {
    return window.createProfilePage().outerHTML;
  },

  // 기본(해당 해시가 없을 경우)
  default: () => `
    <h1>Welcome</h1>
    <p>Select a page from the menu.</p>
  `
};

// 라우터 함수
function router() {
  
  const hash = window.location.hash.replace('#', '') || 'default';
  console.log('Current hash:', hash);

  const app = document.getElementById('app');
  const renderPage = pages[hash] || pages.default;
  console.log('Current hash:', hash);
  console.log('Rendered page:', renderPage);
  
  // HTML 문자열을 받아서 app.innerHTML에 주입
  const pageContent = renderPage();
  if (typeof pageContent === 'string') {
    app.innerHTML = pageContent;
  } else {
    app.replaceChildren(pageContent);
  }

  console.log('App innerHTML updated:', app.innerHTML);
}

// 첫 로딩 시 실행
window.addEventListener('load', router);
// 해시 변경 시마다 실행
window.addEventListener('hashchange', router);
