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
    const cleanupFn = initializePingPongGame(container, configJson, currentMatch);
    container.cleanup = cleanupFn;
  }, 100);

  return container;
}

export { GamePlayPage };
