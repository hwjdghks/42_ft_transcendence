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

/**
 * 라우트 목록 (정적 페이지)
 */
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

/**
 * 현재 렌더링된 페이지(또는 DOM 요소)를 추적
 */
let currentPageElement = null;
// 현재 라우트(문자열)를 추적 (토너먼트 관련 이동 감지를 위함)
let currentRoute = null;

/**
 * 토너먼트 관련 라우트 여부 판단 (토너먼트 페이지 및 게임 플레이 페이지)
 * @param {string} route 
 * @returns {boolean}
 */
function isTournamentRoute(route) {
  return route === 'gameplay/tournament' || isGamePlayRoute(route);
}

/**
 * 메인 라우터 함수
 */
async function router() {
  const app = document.getElementById('app');
  const newRoute = parseRoute(window.location.hash);

  if (
    currentRoute &&
    isTournamentRoute(currentRoute) &&
    !isTournamentRoute(newRoute) &&
    sessionStorage.getItem("tournament_in_progress") === "true"
  ) {
    const confirmLeave = confirm("토너먼트가 진행 중입니다. 정말로 토너먼트를 종료하고 이동하시겠습니까?");
    if (!confirmLeave) {
      return;
    } else {
      resetTournamentSession();
    }
  }

  // 보호된 라우트에 대해 토큰이 없거나 만료된 경우 로그인 페이지로 리다이렉트
  const token = sessionStorage.getItem('fa_token');
  if (isProtectedRoute(newRoute) && (!token || isTokenExpired(token))) {
    alert('토큰이 만료되었거나 존재하지 않습니다. 다시 로그인 해주세요.');
    sessionStorage.removeItem('fa_token');
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
      alert("현재 진행 중인 토너먼트가 없습니다.");
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

/**
 * 현재 URL 해시에서 라우트 키를 추출합니다.
 * @param {string} hash 
 * @returns {string} 라우트 키
 */
function parseRoute(hash) {
  return hash.startsWith('#') ? hash.slice(1) : hash;
}

/**
 * 동적 경로 "gameplay/play-<id>"인지 여부를 판단합니다.
 * @param {string} route 
 * @returns {boolean}
 */
function isGamePlayRoute(route) {
  return route.startsWith('gameplay/play-');
}

/**
 * 토너먼트 관련 라우트(토너먼트 페이지 또는 게임 플레이 페이지)에 대해 세션 검증을 수행합니다.
 * 토너먼트 진행 중이 아니라면 경고 후 접근 차단합니다.
 * @param {string} route 
 * @returns {Promise<boolean>}
 */
async function requireTournamentSession(route) {
  if (route === 'gameplay/tournament') {
    // 토너먼트 페이지에서는 isTournamentPage를 true로 전달
    return await validateTournamentSession(true);
  } else if (isGamePlayRoute(route)) {
    return await validateTournamentSession();
  }
  return true;
}

/**
 * "gameplay/play-<id>" 경로의 유효성을 체크합니다.
 * - 현재 진행중인 경기 정보가 존재하는지,
 * - URL의 게임 ID가 currentMatch와 일치하는지,
 * - 이미 종료된 경기인지 등을 확인합니다.
 * @param {string} route 
 * @returns {boolean}
 */
function validateGamePlayRoute(route) {
  const prefix = 'gameplay/play-';
  const gameId = route.startsWith(prefix) ? route.slice(prefix.length) : '';
  const currentMatchStr = sessionStorage.getItem('currentMatch');
  if (!currentMatchStr) {
    alert('현재 진행 중인 경기가 없습니다.');
    window.location.hash = '#gameplay/tournament';
    return false;
  }
  const currentMatch = JSON.parse(currentMatchStr);
  if (!currentMatch.id || currentMatch.id !== gameId) {
    alert('잘못된 경기 ID입니다.');
    window.location.hash = '#gameplay/tournament';
    return false;
  }
  const finishedGames = JSON.parse(sessionStorage.getItem('finishedGames')) || [];
  if (finishedGames.includes(gameId)) {
    alert('이 게임은 이미 종료되었습니다.');
    window.location.hash = '#gameplay/tournament';
    return false;
  }
  return true;
}

/**
 * 404 페이지 렌더링 함수
 * @param {HTMLElement} container 
 */
function renderNotFound(container) {
  container.innerHTML = `
    <div class="not-found">
      <h1>404 - Page Not Found</h1>
      <p>요청하신 페이지를 찾을 수 없습니다.</p>
      <a href="#login">로그인 페이지로 이동</a>
    </div>
  `;
}

/**
 * 토너먼트 진행 중 세션 데이터를 초기화합니다.
 */
function resetTournamentSession() {
  sessionStorage.removeItem('tournament_in_progress');
  sessionStorage.removeItem('game_option');
  sessionStorage.removeItem('playerList');
  sessionStorage.removeItem('matches');
  sessionStorage.removeItem('currentMatch');
  sessionStorage.removeItem('finishedGames');
}

/**
 * 보호된 라우트 여부를 판단합니다.
 * 로그인, 게임 관련, 프로필 등 토큰이 필요한 페이지가 여기에 포함됩니다.
 * @param {string} route 
 * @returns {boolean}
 */
function isProtectedRoute(route) {
  return route === 'profile' ||
         route === 'gameplay/option' ||
         route === 'gameplay/tournament' ||
         isGamePlayRoute(route);
}

/**
 * JWT 토큰이 만료되었는지 검사합니다.
 * @param {string} token 
 * @returns {boolean} 만료되었다면 true 반환
 */
function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    // exp는 보통 초 단위이므로 밀리초로 변환
    return (payload.exp * 1000) < Date.now();
  } catch (e) {
    console.error("토큰 디코딩 실패:", e);
    return true;
  }
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
