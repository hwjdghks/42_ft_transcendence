/**
 * 경기 결과 데이터를 가져옴
 * 
 * @returns {Promise<Array>} 경기 결과 배열을 반환
 * @throws {Error} API 호출 실패 시 예외 발생
 */
async function postMatchResults() {
  const response = await fetch('https://localhost/api/match/results/', {
      method: 'GET',
      credentials: 'include',
      headers: {
          'Content-Type': 'application/json',
      }
      // 
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed postMatchResults()');
  }
  const result = await response.json();
  return result.match_results;
}

/**
* 경기 기록을 불러와 최신 5개 경기 결과를 화면에 렌더링
* 
* @returns {Promise<void>}
*/
async function renderMatchHistory() {
  try {
      const allMatches = await postMatchResults();

      // 경기 결과가 없을 경우, 사용자에게 알림 표시
      if (!allMatches || allMatches.length === 0) {
          document.getElementById('matchHistory').innerHTML = `
              <div class="alert alert-info">경기 결과가 없습니다.</div>`;
          return;
      }

      // 최신 경기 순으로 정렬
      const sortedMatches = allMatches.sort(
          (a, b) => new Date(b.match_date) - new Date(a.match_date)
      );

      // 최신 5개 경기만 선택
      const topMatches = sortedMatches.slice(0, 5);

      // HTML 생성 및 렌더링
      const matchHistoryHTML = topMatches
          .map(match => createMatchHistoryItem(match))
          .join('');
      document.getElementById('matchHistory').innerHTML = matchHistoryHTML;
  } catch (error) {
      console.error('매치 기록 불러오기 실패:', error);
  }
}

/**
* 단일 경기 결과 항목을 HTML로 생성
* 
* @returns {string} HTML 문자열
*/
function createMatchHistoryItem(match) {
	const currentProfileUrl = sessionStorage.getItem('user_profile_image') || '/static/profile.jpg';
	const profileUrl = match.profile_image_url ? match.profile_image_url : currentProfileUrl;
  // 경기 결과에 따른 CSS 클래스 지정
  const statusColorClass = {
      'win': 'border-primary bg-primary bg-opacity-10',
      'lose': 'border-danger bg-danger bg-opacity-10'
  }[match.game_result.toLowerCase()];

  return `
      <div class="card mb-3 ${statusColorClass} border-2">
          <div class="card-body">
              <div class="d-flex justify-content-between align-items-center">

                  <!-- 사용자 정보 -->
                  <div class="d-flex flex-column align-items-center">
                      <div class="rounded-circle bg-light" style="width: 48px; height: 48px;">
                          <img src="${profileUrl}" alt="Player 1"
                               style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">
                      </div>
                      <span class="fw-bold mt-1">${match.username}</span>
                  </div>

                  <!-- 경기 결과 -->
                  <div class="text-center">
                      <div class="fw-bold mb-1 fs-5">${match.game_result.toUpperCase()}</div>
                      <div class="fs-4 fw-bold">${match.user_score} : ${match.guest_score}</div>
                      <small class="text-muted">${match.match_date}</small>
                  </div>

                  <!-- 상대방 정보 -->
                  <div class="d-flex flex-column align-items-center">
                      <div class="rounded-circle bg-light" style="width: 48px; height: 48px;">
                          <img src="/static/profile.jpg" alt="Player 2"
                               style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">
                      </div>
                      <span class="fw-bold mt-1">${match.guestname}</span>
                  </div>

              </div>
          </div>
      </div>
  `;
}

export { renderMatchHistory };
