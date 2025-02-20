function GameTournamentPage() {
  const container = document.createElement('div');
  container.className = 'container py-5';

  // 세션스토리지에서 옵션, 유저 목록 불러오기
  const options = JSON.parse(sessionStorage.getItem('game_option'));
  const usernames = JSON.parse(sessionStorage.getItem('username'));

  if (!options || !usernames) {
    alert('옵션 데이터가 없습니다. 다시 설정해주세요.');
    window.location.hash = '#gameplay/option';
    return container;
  } else {
    sessionStorage.setItem("tournament_in_progress", "true");
  }

  // 기존 매치 목록 또는 새 대진표 생성
  let matches = JSON.parse(sessionStorage.getItem('matches')) || createBracket(usernames);

  // 대진표 렌더링 함수
  function renderBracket(matchData, parent) {
    parent.innerHTML = ''; // 기존 내용 초기화

    const title = document.createElement('h2');
    title.textContent = 'Tournament Bracket';
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
      matchTitle.innerHTML = `
        <strong>Match ${index + 1}</strong> 
        : ${match.player1} vs ${match.player2 ?? '부전승'}
      `;
      cardBody.appendChild(matchTitle);

      if (match.winner) {
        let scoreText = '';
        if (match.score) {
          scoreText = ` | 점수: ${match.score.player1} - ${match.score.player2}`;
        }
        const winnerInfo = document.createElement('div');
        winnerInfo.innerHTML = `
          <span class="text-success fw-bold">승자: ${match.winner}</span>
          <small class="text-muted ms-2">${scoreText}</small>
        `;
        cardBody.appendChild(winnerInfo);
      } else {
        const tbdInfo = document.createElement('div');
        tbdInfo.innerHTML = `<span class="text-muted">TBD</span>`;
        cardBody.appendChild(tbdInfo);
      }

      matchCard.appendChild(cardBody);
      bracketDiv.appendChild(matchCard);
    });

    parent.appendChild(bracketDiv);
    parent.appendChild(nextButton);
  }

  // "다음 경기 진행" 버튼
  const nextButton = document.createElement('button');
  nextButton.textContent = '다음 경기 진행';
  nextButton.className = 'btn btn-primary mt-4';

  // 랜덤 id 생성 함수
  function generateUUID() {
    // 16바이트의 Uint8Array를 생성
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
  
    // 버전 4를 지정 (UUID의 7번째 바이트의 상위 4비트를 0100으로 설정)
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    // RFC4122 변형을 지정 (9번째 바이트의 상위 2비트를 10으로 설정)
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
  
    // 16진수 문자열로 변환 후 UUID 형식(8-4-4-4-12)으로 포맷팅
    const hex = Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    return `${hex.substr(0, 8)}-${hex.substr(8, 4)}-${hex.substr(12, 4)}-${hex.substr(16, 4)}-${hex.substr(20, 12)}`;
  }
  
  nextButton.addEventListener('click', () => {
    const nextMatch = matches.find(match => !match.winner);

    if (nextMatch) {
      // 랜덤 id 부여
      const gameId = generateUUID();
      nextMatch.id = gameId;
      sessionStorage.setItem('currentMatch', JSON.stringify(nextMatch));
      sessionStorage.setItem('matches', JSON.stringify(matches));
      // URL을 동적 경로로 전환: #gameplay/play-<gameId>
      window.location.hash = '#gameplay/play-' + gameId;
    } else {
      // 모든 경기 종료 후: 다음 라운드 또는 최종 우승 처리
      const winners = matches.map(m => m.winner).filter(Boolean);
      if (winners.length > 1) {
        matches = createBracket(winners);
        sessionStorage.setItem('matches', JSON.stringify(matches));
        renderBracket(matches, container);
      } else {
        alert(`🏆 최종 우승자: ${winners[0]} 🏆`);
        resetTournamentSession();
      }
    }
  });

  function resetTournamentSession() {
    sessionStorage.removeItem('tournament_in_progress');
    sessionStorage.removeItem('game_option');
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('matches');
    sessionStorage.removeItem('currentMatch');
  }

  // 대진표 최초 렌더링
  renderBracket(matches, container);

  return container;
}

// 대진표 생성 함수 (2명씩 짝)
function createBracket(players) {
  const matches = [];
  for (let i = 0; i < players.length; i += 2) {
    matches.push({
      player1: players[i],
      player2: players[i + 1] || null,
      winner: null,
      score: null
    });
  }
  return matches;
}

export { GameTournamentPage }