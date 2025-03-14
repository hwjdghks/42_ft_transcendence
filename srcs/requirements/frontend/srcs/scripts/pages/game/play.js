import { initializePingPongGame } from '../../components/game.js';

function GamePlayPage(configJson) {
  if (!configJson) {
    configJson = sessionStorage.getItem('game_option');
  }

    const currentMatch = JSON.parse(sessionStorage.getItem('currentMatch') || '{}');

  // 게임 컨테이너 DOM 생성
  const container = document.createElement("div");
  container.className = "game-container";
  container.innerHTML = `
    <div id="scoreBoard">${currentMatch.player1}: 0 | ${currentMatch.player2}: 0</div>
    <div id="gameContainer"></div>
    <div id="winnerMessage"></div>
    <!-- 카운트다운 UI -->
    <div id="countdownOverlay" 
         style="display:none; position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); font-size:2em; color:#fff;">
    </div>
  `;

  container.cleanup = function() {};

  setTimeout(() => {
    loadThreeJS(() => {
      const cleanupFn = initializePingPongGame(container, configJson, currentMatch);
      container.cleanup = cleanupFn;
    });
  }, 100);
  
  return container;
}

function loadThreeJS(callback) {
  // 이미 THREE가 로드되어 있으면 바로 callback 실행
  if (window.THREE) {
    callback();
    return;
  }

  const script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
  script.onload = callback;
  document.head.appendChild(script);
}


export { GamePlayPage };
