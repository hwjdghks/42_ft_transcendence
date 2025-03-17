import { initializePingPongGame } from '../../components/game.js';

function GamePlayPage(configJson) {
  if (!configJson) {
    configJson = sessionStorage.getItem('game_option');
  }

    const currentMatch = JSON.parse(sessionStorage.getItem('currentMatch') || '{}');

  // 게임 컨테이너 DOM 생성
  const container = document.createElement("div");
  container.className = "container py-4 bg-white rounded-4 shadow p-4 mx-auto mt-5";
  container.innerHTML = `
    <div class="w-100 bg-light p-3 rounded shadow-lg text-center">
      <div id="scoreBoard" class="fs-4 fw-bold text-black">
        ${currentMatch.player1}: 0 | ${currentMatch.player2}: 0
      </div>
    </div>
    <div id="gameContainer" style="margin: 0 auto; text-align: center; position: relative;">
      <!-- 게임 내용 -->
      <div id="winnerMessage" style="position: absolute; top:50%; left:50%; transform: translate(-50%, -50%);"></div>
      <div id="countdownOverlay"
          class="display-4 fw-bold text-white bg-dark rounded-2 p-4"
          style="display:none; position:absolute; top:50%; left:50%; transform: translate(-50%, -50%);">
      </div>
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
