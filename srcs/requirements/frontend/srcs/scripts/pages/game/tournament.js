function getTournamentPage() {
  const container = document.createElement('div');
  container.className = 'container py-5';

  // 세션스토리지에서 옵션/유저 목록/매치 목록 불러오기
  const options = JSON.parse(sessionStorage.getItem('game_option'));
  const usernames = JSON.parse(sessionStorage.getItem('username'));

  // 데이터가 없으면 옵션 페이지로 돌려보내기
  if (!options || !usernames) {
    alert('옵션 데이터가 없습니다. 다시 설정해주세요.');
    window.location.hash = '#gameplay/option';
    return container; // 안전상 return
  }

  // 초기 matches 불러오기(이미 있는지 확인)
  let matches = JSON.parse(sessionStorage.getItem('matches')) || createBracket(usernames);

  // 대진표 그리는 함수
  function renderBracket(matchData, parent) {
    parent.innerHTML = ''; // 기존 내용 초기화

    // 제목
    const title = document.createElement('h2');
    title.textContent = 'Tournament Bracket';
    title.className = 'mb-4 fw-bold';
    parent.appendChild(title);

    // bracket container
    const bracketDiv = document.createElement('div');
    bracketDiv.id = 'bracket';

    // 각 매치 표시
    matchData.forEach((match, index) => {
      const matchCard = document.createElement('div');
      matchCard.className = 'card mb-2'; // Bootstrap card로 간단한 스타일

      const cardBody = document.createElement('div');
      cardBody.className = 'card-body d-flex justify-content-between align-items-center';

      // 매치 기본 정보
      const matchTitle = document.createElement('div');
      matchTitle.innerHTML = `
        <strong>Match ${index + 1}</strong> 
        : ${match.player1} vs ${match.player2 ?? '부전승'}
      `;

      cardBody.appendChild(matchTitle);

      // (이미 승자 결정) 혹은 점수가 있으면 표시
      if (match.winner) {
        // 스코어 표시
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
        // 아직 승자가 없으면 TBD
        const tbdInfo = document.createElement('div');
        tbdInfo.innerHTML = `<span class="text-muted">TBD</span>`;
        cardBody.appendChild(tbdInfo);
      }

      matchCard.appendChild(cardBody);
      bracketDiv.appendChild(matchCard);
    });

    parent.appendChild(bracketDiv);

    // "Next Match" 버튼(아래에서 재생성)
    parent.appendChild(nextButton);
  }

  // 다음 매치 or 다음 라운드 진행 버튼
  const nextButton = document.createElement('button');
  nextButton.textContent = '다음 경기 진행';
  nextButton.className = 'btn btn-primary mt-4';

  nextButton.addEventListener('click', () => {
    // 아직 winner가 없는 매치를 찾음
    const nextMatch = matches.find(match => !match.winner);

    if (nextMatch) {
      // 이 매치를 currentMatch로 설정하고, play 페이지로 이동
      sessionStorage.setItem('currentMatch', JSON.stringify(nextMatch));
      sessionStorage.setItem('matches', JSON.stringify(matches));
      window.location.hash = '#gameplay/play';
    } else {
      // 남은 매치가 모두 끝났으면, 우승자들만 모아서 다음 라운드 or 최종 우승
      const winners = matches.map(m => m.winner).filter(Boolean);

      if (winners.length > 1) {
        // 다음 라운드 대진표 생성
        matches = createBracket(winners);

        // 새 대진표를 세션스토리지에 저장
        sessionStorage.setItem('matches', JSON.stringify(matches));

        // 화면 갱신(새로고침 없이도 대진표 렌더)
        renderBracket(matches, container);
      } else {
        // 최종 우승자 1명
        alert(`🏆 최종 우승자: ${winners[0]} 🏆`);

        // 토너먼트 관련 세션스토리지 초기화(필요시)
        resetTournamentSession();
        // 필요하다면 메인 화면(#profile 등)으로 이동하거나, 그대로 끝
      }
    }
  });

  // 세션스토리지 정리하는 함수 (선택)
  function resetTournamentSession() {
    sessionStorage.removeItem('game_option');
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('matches');
    sessionStorage.removeItem('currentMatch');
  }

  // bracket 첫 렌더링
  renderBracket(matches, container);

  return container;
}

// 대진표 생성 로직 (8강, 4강, 2강 등)
function createBracket(players) {
  const matches = [];
  // 2명씩 짝지어서 매치 생성
  for (let i = 0; i < players.length; i += 2) {
    matches.push({
      player1: players[i],
      player2: players[i + 1] || null,
      winner: null,
      score: null // 스코어 저장용
    });
  }
  return matches;
}

window.getTournamentPage = getTournamentPage;
