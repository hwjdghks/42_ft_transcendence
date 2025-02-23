// ./scripts/router.js
import { LoginPage } from './pages/authorization/login.js';
import { SignupPage } from './pages/authorization/signup.js';
import { GameOptionPage } from './pages/game/option.js';
import { GameTournamentPage } from './pages/game/tournament.js';
import { GamePlayPage } from './pages/game/play.js';
import { SignupVerificationPage } from './pages/authorization/signupVerification.js';
import { LoginVerificationPage } from './pages/authorization/loginVerification.js';
const NotFoundPage = () => `
  <div class="not-found">
    <h1>404 - Page Not Found</h1>
    <p>요청하신 페이지를 찾을 수 없습니다.</p>
    <a href="#login">로그인 페이지로 이동</a>
  </div>
`;

// gameplay/play는 등록하지 않습니다. (동적 경로만 허용)
const pages = {
  login: () => LoginPage(),
  signup: () => SignupPage(),
  "login-verification": () => LoginVerificationPage(),
  "signup-verification": () => SignupVerificationPage(),
  "gameplay/option": () => GameOptionPage(),
  "gameplay/tournament": () => GameTournamentPage(),
  "gameplay/play": () => GamePlayPage(),
  profile: () => window.createProfilePage().outerHTML,
};

function router() {
  // 해시가 없으면 로그인 페이지로 이동
  if (window.location.pathname === '/' && !window.location.hash) {
    const app = document.getElementById('app');
    app.innerHTML = LoginPage();
    return;
  }

  // 해시에서 '#' 제거
  const hash = window.location.hash.replace('#', '');
  const app = document.getElementById('app');

  // 동적 경로 체크: URL이 "gameplay/play-<id>" 형태인 경우
  if (hash.startsWith('gameplay/play-')) {
    const gameIdFromURL = hash.substring('gameplay/play-'.length);

    // 현재 진행 중인 경기(currentMatch)가 있는지 확인
    const currentMatchStr = sessionStorage.getItem('currentMatch');
    if (!currentMatchStr) {
      alert('현재 진행 중인 경기가 없습니다.');
      window.location.hash = '#gameplay/tournament';
      return;
    }
    const currentMatch = JSON.parse(currentMatchStr);
    if (!currentMatch.id || currentMatch.id !== gameIdFromURL) {
      alert('잘못된 경기 ID입니다.');
      window.location.hash = '#gameplay/tournament';
      return;
    }

    // 이미 종료된 경기인지 확인
    let finishedGames = JSON.parse(sessionStorage.getItem('finishedGames')) || [];
    if (finishedGames.includes(gameIdFromURL)) {
      alert('이 게임은 이미 종료되었습니다.');
      window.location.hash = '#gameplay/tournament';
      return;
    }
  }

  // 토너먼트 시작 전에는 gameplay/tournament 또는 gameplay/play 경로 접근 금지
  if ((hash === 'gameplay/tournament' || hash === 'gameplay/play') &&
      sessionStorage.getItem('tournament_in_progress') !== 'true') {
    alert('토너먼트 사이클이 시작되지 않았습니다. 먼저 게임 옵션을 설정해주세요.');
    window.location.hash = '#gameplay/option';
    return;
  }
  
  // 토너먼트 진행 중일 때, 허용되지 않은 페이지로 이동 시 확인
  if (sessionStorage.getItem('tournament_in_progress') === 'true') {
    const allowedDuringTournament = ['gameplay/tournament'];
    // 동적 경로 "gameplay/play-<id>"는 허용됨
    if (hash && !allowedDuringTournament.includes(hash) && !hash.startsWith('gameplay/play-')) {
      const leave = confirm('현재 토너먼트가 진행 중입니다. 정말 나가시겠습니까?');
      if (!leave) {
        window.location.hash = '#gameplay/tournament';
        return;
      } else {
        sessionStorage.removeItem('tournament_in_progress');
        sessionStorage.removeItem('game_option');
        sessionStorage.removeItem('username');
        sessionStorage.removeItem('matches');
        sessionStorage.removeItem('currentMatch');
      }
    }
  }

  // 등록된 페이지가 없으면 404 처리 (예: "gameplay/play"는 등록되어 있지 않음)
  if (hash && !pages[hash] && !hash.startsWith('gameplay/play-')) {
    app.innerHTML = NotFoundPage();
    return;
  }

  let renderPage;
  if (hash.startsWith('gameplay/play-')) {
    renderPage = () => GamePlayPage();
  } else {
    renderPage = pages[hash] || pages.login;
  }

  const pageContent = renderPage();
  if (typeof pageContent === 'string') {
    app.innerHTML = pageContent;
  } else {
    app.replaceChildren(pageContent);
  }
}

window.addEventListener('load', router);
window.addEventListener('hashchange', router);

window.addEventListener('beforeunload', (event) => {
  if (sessionStorage.getItem("tournament_in_progress") === "true") {
    sessionStorage.removeItem("tournament_in_progress");
    sessionStorage.removeItem('game_option');
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('matches');
    sessionStorage.removeItem('currentMatch');
  }
});
