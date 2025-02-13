// ./scripts/router.js
import { LoginPage } from './pages/authorization/login.js';
import { SignupPage } from './pages/authorization/signup.js';

import { GameOptionPage } from './pages/game/option.js';
import { GameTournamentPage } from './pages/game/tournament.js';
// import { GamePlayPage } from './pages/game/play.js';


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
  "gameplay/option": () => GameOptionPage(), 
  "gameplay/tournament": () => GameTournamentPage(),
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


  // 토너먼트 시작 전에는 'gameplay/tournament' 또는 'gameplay/play' 경로 접근 금지
  if ((hash === 'gameplay/tournament' || hash === 'gameplay/play') &&
      sessionStorage.getItem('tournament_in_progress') !== 'true') {
    alert('토너먼트 사이클이 시작되지 않았습니다. 먼저 게임 옵션을 설정해주세요.');
    window.location.hash = '#gameplay/option';
    return;
  }
  
  // 토너먼트 진행 중일 때 토너먼트 관련 페이지만 허용하고, 그 외 이동 시 사용자 확인 후 세션 초기화
  if (sessionStorage.getItem('tournament_in_progress') === 'true') {
    const allowedDuringTournament = ['gameplay/tournament', 'gameplay/play'];
    if (hash && !allowedDuringTournament.includes(hash)) {
      const leave = confirm('현재 토너먼트가 진행 중입니다. 정말 나가시겠습니까?');
      if (!leave) {
        // 이탈 취소: 강제로 토너먼트 페이지로 복귀
        // window.location.hash = '#gameplay/tournament';
        return;
      } else {
        // 사용자가 이탈을 선택한 경우, 세션 스토리지 초기화
        sessionStorage.removeItem('tournament_in_progress');
        sessionStorage.removeItem('game_option');
        sessionStorage.removeItem('username');
        sessionStorage.removeItem('matches');
        sessionStorage.removeItem('currentMatch');
      }
    }
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

// router.js나 index.html, 혹은 공통 스크립트 어딘가에 배치
window.addEventListener('beforeunload', (event) => {
  if (sessionStorage.getItem("tournament_in_progress") === "true") {
    // 토너먼트 도중 새로고침/창 닫기 시 데이터 초기화
    sessionStorage.removeItem("tournament_in_progress");
    sessionStorage.removeItem('game_option');
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('matches');
    sessionStorage.removeItem('currentMatch');

    // event.preventDefault();
    // event.returnValue = '';
  }
});