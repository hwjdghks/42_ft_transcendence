// ./scripts/router.js

// 예: 다른 페이지들도 각 js 파일에서 비슷하게 "HTML 문자열을 리턴"하는 함수를
// 전역(window) 혹은 export로 꺼내온 뒤, 아래 객체에 매핑해주면 됩니다.
const pages = {
  login: () => `
    <h1>Login Page</h1>
    <p>Welcome to the login page.</p>
  `,

  signup: () => `
    <h1>Signup Page</h1>
    <p>Sign up to create an account.</p>
  `,

  // gameOption.js에서 전역으로 등록한 함수
  gameplay: window.getGameOptionPage, 
  // 혹은 ESModule 방식이라면 import 해서: gameplay: getGameOptionPage,

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
