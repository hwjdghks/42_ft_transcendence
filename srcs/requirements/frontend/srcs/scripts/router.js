import { trans } from './language.js';
import { LoginPage } from './pages/authorization/login.js';
import { SignupPage } from './pages/authorization/signup.js';
import { GameOptionPage } from './pages/game/option.js';
import { ProfilePage } from './pages/profile/profile.js';
import { GameTournamentPage } from './pages/game/tournament.js';
import { GamePlayPage } from './pages/game/play.js';
import { SignupVerificationPage } from './pages/authorization/signupVerification.js';
import { LoginVerificationPage } from './pages/authorization/loginVerification.js';
import { OauthCallbackPage } from './pages/authorization/oauthCallback.js';
import { validateTournamentSession } from './validation/sessionData.js';
import { checkCookie } from './validation/cookie.js';

// 현재 선택된 언어를 `localStorage`에서 가져오고, 없으면 기본값 'en'
window.curLang = localStorage.getItem("lang") || "en";

// 라우트 목록
const routes = {
  "login": LoginPage,
  "signup": SignupPage,
  "login-verification": LoginVerificationPage,
  "signup-verification": SignupVerificationPage,
  "oauth-callback": OauthCallbackPage,
  "gameplay/option": GameOptionPage,
  "gameplay/tournament": GameTournamentPage,
  "profile": ProfilePage,
};

// 현재 렌더링된 페이지(또는 DOM 요소)를 추적
let currentPageElement = null;

// 현재 라우트(문자열)를 추적 (토너먼트 관련 이동 감지를 위함)
let currentRoute = null;

// 메인 라우터 함수
export async function router() {

  // oauth 주소 해시태그 적용 /oauth-callback/?~ -> /#oauth-callback/?~
  if (window.location.pathname === '/oauth-callback/') {
    window.location.href = '/#oauth-callback/' + window.location.search;
    return;
  }

  const app = document.getElementById('app');
  const newRoute = parseRoute(window.location.hash);

  if ((newRoute === 'signup-verification' || newRoute === 'login-verification') && !sessionStorage.getItem('verificationAllowed')) {
    window.location.hash = '#login';
    return;
  }

  if (
    currentRoute &&
    isTournamentRoute(currentRoute) &&
    !isTournamentRoute(newRoute) &&
    sessionStorage.getItem("tournament_in_progress") === "true"
  ) {
    const confirmLeave = confirm("Tournament is in progress. Do you really want to end and move on?");
    if (!confirmLeave) {
      window.location.hash = currentRoute;
      return;
    } else {
      resetTournamentSession();
    }
  }

  // 보호된 라우트에 대해 토큰이 없거나 만료된 경우 로그인 페이지로 리다이렉트
  const token = await checkCookie();
  if (isProtectedRoute(newRoute) && (!token)) {
    alert('Error: please log in again.');
    window.location.hash = '#login';
    return;
  }

  // 기본 경로: 해시가 없으면 로그인 페이지로 이동
  if (!newRoute && window.location.pathname === '/') {
    const page = LoginPage();
    if (typeof page === 'string') {
      app.innerHTML = page;
    } else {
      app.replaceChildren(page);
    }
    currentPageElement = page;
    currentRoute = 'login';
    return;
  }

  // 이전 페이지 cleanup
  if (currentPageElement && typeof currentPageElement.cleanup === 'function') {
    currentPageElement.cleanup();
    currentPageElement = null;
  }

  // oauth-callback 처리
  if (newRoute.startsWith('oauth-callback')) {
    const page = OauthCallbackPage();
    if (typeof page === 'string') {
      app.innerHTML = page;
      currentPageElement = null;
    } else {
      app.replaceChildren(page);
      currentPageElement = page;
    }
    currentRoute = newRoute;
    return;
  }

  // 동적 게임 플레이 라우트 처리 (예: gameplay/play-<id>)
  if (isGamePlayRoute(newRoute)) {
    if (!validateGamePlayRoute(newRoute)) return;
  }

  // 토너먼트 관련 라우트 세션 검증 수행
  if (newRoute === 'gameplay/tournament' || isGamePlayRoute(newRoute)) {
    // 토너먼트 진행 여부 체크: 진행 중이 아니면 접근 차단
    if (sessionStorage.getItem("tournament_in_progress") !== "true") {
      alert('There are no ongoing tournaments.');
      window.location.hash = '#gameplay/option';
      return;
    }
    const validSession = await requireTournamentSession(newRoute);
    if (!validSession) return;
  }

  // 페이지 렌더러 선택 (정적 라우트 또는 동적 게임 플레이)
  let pageRenderer = routes[newRoute];
  if (!pageRenderer && isGamePlayRoute(newRoute)) {
    pageRenderer = GamePlayPage;
  }

  // 존재하지 않는 라우트면 404 처리
  if (!pageRenderer) {
    renderNotFound(app);
    currentPageElement = null;
    currentRoute = newRoute;
    return;
  }

  // 페이지 렌더링
  const pageContent = pageRenderer();
  if (typeof pageContent === 'string') {
    app.innerHTML = pageContent;
    currentPageElement = null;
  } else {
    app.replaceChildren(pageContent);
    currentPageElement = pageContent;
  }
  currentRoute = newRoute;
}

// 해시 키 추출 함수
function parseRoute(hash) {
  return hash.startsWith('#') ? hash.slice(1) : hash;
}

// 동적 경로 "gameplay/play-<id>"인지 여부를 판단하는 함수
function isGamePlayRoute(route) {
  return route.startsWith('gameplay/play-');
}

// 토너먼트 세션 검증하는 함수
async function requireTournamentSession(route) {
  if (route === 'gameplay/tournament') {
    // 토너먼트 페이지에서는 isTournamentPage를 true로 전달
    return await validateTournamentSession(true);
  } else if (isGamePlayRoute(route)) {
    return await validateTournamentSession();
  }
  return true;
}

// "gameplay/play-<id>" 경로의 유효성을 체크하는 함수
function validateGamePlayRoute(route) {
  const prefix = 'gameplay/play-';
  const gameId = route.startsWith(prefix) ? route.slice(prefix.length) : '';
  const currentMatchStr = sessionStorage.getItem('currentMatch');
  if (!currentMatchStr) {
    alert('There are no ongoing matches.');
    window.location.hash = '#gameplay/tournament';
    return false;
  }
  const currentMatch = JSON.parse(currentMatchStr);
  if (!currentMatch.id || currentMatch.id !== gameId) {
    alert('Invalid match ID.');
    window.location.hash = '#gameplay/tournament';
    return false;
  }
  const finishedGames = JSON.parse(sessionStorage.getItem('finishedGames')) || [];
  if (finishedGames.includes(gameId)) {
    alert('This game has already been shut down.');
    window.location.hash = '#gameplay/tournament';
    return false;
  }
  return true;
}

// 404
function renderNotFound(container) {
  container.innerHTML = `
    <div class="not-found text-white m-4">
      <h5>404 Error</h5>
      <p>${trans[window.curLang].notFound}</p>
      <a href="#login">${trans[window.curLang].toLoginPage}</a>
    </div>
  `;
}

// 세션 데이터 초기화
function resetTournamentSession() {
  sessionStorage.removeItem('tournament_in_progress');
  sessionStorage.removeItem('game_option');
  sessionStorage.removeItem('playerList');
  sessionStorage.removeItem('matches');
  sessionStorage.removeItem('currentMatch');
  sessionStorage.removeItem('finishedGames');
}

// 보호 대상 라우트인지 검사
function isProtectedRoute(route) {
  return route === 'profile' ||
        route === 'gameplay/option' ||
        route === 'gameplay/tournament' ||
        isGamePlayRoute(route);        
}

// 토너먼트 관련 라우트 여부 판단 (토너먼트 페이지 및 게임 플레이 페이지)
function isTournamentRoute(route) {
  return route === 'gameplay/tournament' || isGamePlayRoute(route);
}

// 이벤트 리스너 등록
window.addEventListener('load', router);
window.addEventListener('hashchange', router);
window.addEventListener('beforeunload', (e) => {
  // 페이지를 새로고침하거나 브라우저를 종료할 때 토너먼트 진행 중이면 경고
  if (sessionStorage.getItem("tournament_in_progress") === "true") {
    const confirmationMessage = "토너먼트 진행 중입니다. 페이지를 떠나면 진행 중인 대회가 종료됩니다.";
    e.returnValue = confirmationMessage;
    return confirmationMessage;
  }
});

// 모달 백드롭 제거
document.addEventListener('hidden.bs.modal', () => {
  document.querySelectorAll('.modal-backdrop').forEach((backdrop) => {
    backdrop.remove();
  });
});