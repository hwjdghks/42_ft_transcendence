// API로부터 경기 결과를 가져오는 함수
async function fetchMatchResults() {
    const token = sessionStorage.getItem('fa_token'); // 저장된 JWT 토큰 사용
    const response = await fetch('https://localhost/api/match/results/', {
        method: 'GET',
        headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
        }
    });
    if (!response.ok) {
        throw new Error('경기 결과 가져오기 실패');
    }
    const result = await response.json();
    // API 응답 구조에 맞춰 경기 결과 배열을 반환 (예: result.data)
    return result.match_results;
    }
    
    // 경기 기록을 로드하여 최신 5개만 화면에 렌더링하는 함수
    async function loadMatchHistory() {
        try {
          const allMatches = await fetchMatchResults();
          
          // 결과가 없을 경우 메시지 출력
          if (!allMatches || allMatches.length === 0) {
            document.getElementById('matchHistory').innerHTML = `<div class="alert alert-info">경기 결과가 없습니다.</div>`;
            return;
          }

          const sortedMatches = allMatches.sort((a, b) => new Date(b.match_date) - new Date(a.match_date));
          const topMatches = sortedMatches.slice(0, 5);
          
          const matchHistoryHTML = topMatches.map(match => createMatchHistoryItem(match)).join('');
          document.getElementById('matchHistory').innerHTML = matchHistoryHTML;
        } catch (error) {
          console.error('매치 기록 불러오기 실패:', error);
        }
    }

    // 단일 경기 결과 항목을 HTML로 생성하는 함수
    function createMatchHistoryItem(match) {
        // 상태에 따른 클래스 지정
        const statusColorClass = {
          'win': 'border-primary bg-primary bg-opacity-10',
          'draw': 'border-secondary bg-secondary bg-opacity-10',
          'lose': 'border-danger bg-danger bg-opacity-10'
        }[match.game_result.toLowerCase()];
      
        return `
          <div class="card mb-3 ${statusColorClass} border-2">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center">
                <!-- Player 1 정보 -->
    
                <div class="d-flex flex-column align-items-center">
                    <div class="rounded-circle bg-light" style="width: 48px; height: 48px;">
                        <img src="${match.profile_image_url}" alt="Player 1" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">
                    </div>
                    <span class="fw-bold mt-1">${match.username}</span>
                </div>
    
                <!-- 경기 결과 -->
                <div class="text-center">
                    <div class="fw-bold mb-1 fs-5">${match.game_result.toUpperCase()}</div>
                    <div class="fs-4 fw-bold">${match.user_score} : ${match.guest_score}</div>
                    <small class="text-muted">${match.match_date}</small>
                </div>
                <!-- Player 2 정보 -->
                <div class="d-flex flex-column align-items-center">
                    <div class="rounded-circle bg-light" style="width: 48px; height: 48px;">
                        <img src="/static/profile.jpg" alt="Player 2" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">
                    </div>
                    <span class="fw-bold mt-1">${match.guestname}</span>
                </div>
    
              </div>
            </div>
          </div>
        `;
      }
    
    // 외부에서 loadMatchHistory 함수를 사용할 수 있도록 노출
    window.loadMatchHistory = loadMatchHistory;
    