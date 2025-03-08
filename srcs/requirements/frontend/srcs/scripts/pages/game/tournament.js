import { trans } from '../../language.js';

export function GameTournamentPage() {
  const container = document.createElement('div');
  container.className = 'container py-5';

  // const options = JSON.parse(sessionStorage.getItem('game_option'));
  const playerList = JSON.parse(sessionStorage.getItem('playerList'));

  // 대진표(matches)가 없으면 생성
  let matches = JSON.parse(sessionStorage.getItem('matches'));
  if (!matches) {
    matches = createBracket(playerList);
    sessionStorage.setItem('matches', JSON.stringify(matches));
  }

  const nextButton = createNextButton();
  renderBracket(matches, container, nextButton);

  // Next 버튼 클릭 시 최종 검증 후 경기 진행 (빈값, 유효성, 첫 플레이어 비교)
  nextButton.addEventListener('click', () => {
    matches = handleNextButtonClick(matches, container, nextButton);
    sessionStorage.setItem('matches', JSON.stringify(matches));
  });

  return container;
}

// --- 토너먼트 관련 유틸리티 함수 ---
function generateUUID() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  
  // UUID v4 규격에 맞게 변형
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  
  const hex = Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  return `${hex.substr(0, 8)}-${hex.substr(8, 4)}-${hex.substr(12, 4)}-${hex.substr(16, 4)}-${hex.substr(20, 12)}`;
}

export function resetTournamentSession() {
  sessionStorage.removeItem('tournament_in_progress');
  sessionStorage.removeItem('game_option');
  sessionStorage.removeItem('playerList');
  sessionStorage.removeItem('matches');
  sessionStorage.removeItem('currentMatch');
  sessionStorage.removeItem('finishedGames');
}

function createBracket(players) {
  if (!players || !Array.isArray(players) || players.length === 0) {
    console.error('Player list is null or empty.');
    return [];
  }
  const matches = [];
  for (let i = 0; i < players.length; i += 2) {
    matches.push({
      player1: players[i],
      player2: players[i + 1],
      winner: null,
      score: null,
    });
  }
  return matches;
}



function renderBracket(matchData, parent, nextButton) {
  parent.innerHTML = ''; // 기존 내용 초기화

  const title = document.createElement('h2');
  title.textContent = trans[window.curLang].tournamentHeader;
  title.className = 'mb-4 fw-bold';
  parent.appendChild(title);

  const bracketDiv = document.createElement('div');
  bracketDiv.id = 'bracket';

  matchData.forEach((match, index) => {
    const matchCard = document.createElement('div');
    matchCard.className = 'card mb-2';
    const cardBody = document.createElement('div');
    cardBody.className = 'card-body d-flex justify-content-between align-items-center';
    const matchTitle = document.createElement('div');
    matchTitle.innerHTML = `<strong>${trans[window.curLang].tournamentMatch} ${index + 1}</strong> : ${match.player1} vs ${match.player2}`;
    cardBody.appendChild(matchTitle);

    if (match.winner) {
      let scoreText = '';
      if (match.score) {
        scoreText = ` | ${trans[window.curLang].tournamentScore}: ${match.score.player1} - ${match.score.player2}`;
      }
      const winnerInfo = document.createElement('div');
      winnerInfo.innerHTML = `<span class="text-success fw-bold">${trans[window.curLang].tournamentWinner}: ${match.winner}</span><small class="text-muted ms-2">${scoreText}</small>`;
      cardBody.appendChild(winnerInfo);
    } else {
      const tbdInfo = document.createElement('div');
      tbdInfo.innerHTML = `<span class="text-muted">${trans[window.curLang].tournamentTBD}</span>`;
      cardBody.appendChild(tbdInfo);
    }

    matchCard.appendChild(cardBody);
    bracketDiv.appendChild(matchCard);
  });

  parent.appendChild(bracketDiv);
  parent.appendChild(nextButton);
}

function createNextButton() {
  const nextButton = document.createElement('button');
  nextButton.textContent = trans[window.curLang].tournamentNextMatch;
  nextButton.className = 'btn btn-primary mt-4';
  return nextButton;
}

function handleNextButtonClick(matches, container, nextButton) {
  const nextMatch = matches.find(match => !match.winner);

  if (nextMatch) {
    // 진행할 경기 존재 시: UUID 부여 후 현재 경기 저장 및 play 페이지 이동
    const gameId = generateUUID();
    nextMatch.id = gameId;
    sessionStorage.setItem('currentMatch', JSON.stringify(nextMatch));
    window.location.hash = '#gameplay/play-' + gameId;
  } else {
    // 모든 경기 종료 시: 다음 라운드 진행 또는 최종 우승 결정
    const winners = matches.map(m => m.winner).filter(Boolean);
    if (winners.length > 1) {
      matches = createBracket(winners);
      sessionStorage.setItem('matches', JSON.stringify(matches));
      renderBracket(matches, container, nextButton);
    } else {
      // 최종 우승자 발표 후 토너먼트 세션 초기화
      alert(`${trans[window.curLang].tournamentLastAlert} ${winners[0]} 🏆`);
      sessionStorage.setItem('tournament_in_progress', 'false');
      // resetTournamentSession();
      window.location.hash = '#gameplay/option';
    }
  }
  return matches;
}
