// matchHistory.js

function createMatchHistoryItem(match) {
    const statusColorClass = {
        'win': 'border-primary bg-primary bg-opacity-10',
        'draw': 'border-secondary bg-secondary bg-opacity-10',
        'loss': 'border-danger bg-danger bg-opacity-10'
    }[match.status.toLowerCase()];

    return `
        <div class="card mb-3 ${statusColorClass} border-2">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-center">
                    <!-- Player 1 -->
                    <div class="d-flex align-items-center gap-3">
                        <div class="rounded-circle bg-light p-2" style="width: 48px; height: 48px;">
                            <img src="${match.player1.avatar || '/static/profile.jpg'}" 
                                 alt="Player 1" 
                                 class="rounded-circle w-100 h-100 object-fit-cover">
                        </div>
                        <span class="fw-bold">${match.player1.username}</span>
                    </div>

                    <!-- Match Result -->
                    <div class="text-center">
                        <div class="fw-bold mb-1 fs-5">
                            ${match.status.toUpperCase()}
                        </div>
                        <div class="fs-4 fw-bold">
                            ${match.score.player1} : ${match.score.player2}
                        </div>
                        <small class="text-muted">${match.date}</small>
                    </div>

                    <!-- Player 2 -->
                    <div class="d-flex align-items-center gap-3">
                        <span class="fw-bold">${match.player2.username}</span>
                        <div class="rounded-circle bg-light p-2" style="width: 48px; height: 48px;">
                            <img src="${match.player2.avatar || '/static/profile.jpg'}" 
                                 alt="Player 2" 
                                 class="rounded-circle w-100 h-100 object-fit-cover">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

  

function formatDate(isoString) {
    const date = new Date(isoString);

    // YYYY-MM-DD HH:MM AM/PM 형식으로 변환
    const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true, // 12시간제 (AM/PM 표시)
    };

    return date.toLocaleString('en-US', options); // 미국 형식으로 변환 (필요하면 'ko-KR' 사용 가능)
}



function createMatchHistoryItem(match, username) {
	// 현재 사이트의 기본 URL 가져오기 (http://localhost:8000)
    const staticBaseUrl = window.location.origin + "/static/user_image/";


    return `
      <li class="match-history-item">
        <div class="match-item" style="display: flex; align-items: center; gap: 10px;">
          <img src="${staticBaseUrl}Ryan.png" alt="${username}" class="match-avatar" style="width: 40px; height: 40px; border-radius: 50%;">
          <div class="match-details">
            <span class="player-name" style="font-weight: bold;">${username}</span>
            <span class="vs" style="margin: 0 5px;">vs</span>
            <span class="player-name" style="font-weight: bold;">${match.guestname}</span>
            <img src="${staticBaseUrl}Conn.png" alt="${match.guestname}" class="match-avatar" style="width: 40px; height: 40px; border-radius: 50%;">
            <div class="score-details">
              <span class="score">${match.user_score} - ${match.guest_score}</span>
              <span class="status" style="text-transform: capitalize; margin-left: 10px;">(${match.game_result})</span>
              <span class="date" style="margin-left: 10px;">${formatDate(match.match_date)}</span>
            </div>
          </div>
        </div>
      </li>
    `;
}

function loadMatchHistory(data) {
	console.log("✅ loadMatchHistory 실행됨");
	console.log("🔍 API 응답 데이터:", data);  // 전체 데이터 확인

	// 데이터가 없을 경우 안내 문구 출력
	if (!data || !data.match_results || data.match_results.length === 0) {
		document.getElementById('matchHistory').innerHTML = '<p>No match history available.</p>';
		return;
	}

	console.log("🎯 match_results 데이터:", data.match_results);

	// `data.match_results`를 그대로 사용하여 리스트 생성
	const matchHistoryHTML = data.match_results
		.map(match => createMatchHistoryItem(match, data.username))
		.join('');

	console.log("🖌 생성된 HTML:", matchHistoryHTML);

	document.getElementById('matchHistory').innerHTML = matchHistoryHTML;
	return matchHistoryHTML;  // ✅ return 추가
	// return matches.map(match => createMatchHistoryItem(match)).join('');
}


// function loadMatchHistory(data) {
// 	console.log("✅ loadMatchHistory 실행됨");
// 	// data.match_results가 없거나 비어 있다면 안내 문구 출력
// 	if (!data || !data.match_results || data.match_results.length === 0) {
// 		return '<p>No match history available.</p>';
// 	}

// 	const transformedMatches = transformMatchResults(data);
// 	console.log("변환된 매치 데이터:", transformedMatches);

// 	return document.getElementById('matchHistory').innerHTML = transformedMatches
// 		.map(match => createMatchHistoryItem(match))
// 		.join('');
// }
	// match_results 배열의 각 항목을 createMatchHistoryItem()을 통해 HTML 문자열로 변환한 후 모두 합침
	// return data.match_results.map(match => createMatchHistoryItem(match)).join('');


    // // 임시 데이터
    // const matches = [
    //     {
    //         id: 1,
    //         status: 'win',
    //         player1: { 
    //             username: 'Ryan', 
    //             avatar: '/static/user_image/Ryan.png' 
    //         },
    //         player2: { 
    //             username: 'Muji', 
    //             avatar: '/static/user_image/Muji.jpg'
    //         },
    //         score: { player1: 3, player2: 1 },
    //         date: '2025/03/15'
    //     },
    //     {
    //         id: 2,
    //         status: 'draw',
    //         player1: { 
    //             username: 'Ryan', 
    //             avatar: '/static/user_image/Ryan.png'
    //         },
    //         player2: { 
    //             username: 'Conn', 
    //             avatar: '/static/user_image/Conn.png'
    //         },
    //         score: { player1: 2, player2: 2 },
    //         date: '2025/03/15'
    //     },
    //     {
    //         id: 3,
    //         status: 'loss',
    //         player1: { 
    //             username: 'Ryan', 
    //             avatar: '/static/user_image/Ryan.png'
    //         },
    //         player2: { 
    //             username: 'Conn', 
    //             avatar: '/static/user_image/Conn.png'
    //         },
    //         score: { player1: 1, player2: 3 },
    //         date: '2025/03/15'
    //     }
    // ];

    // return matches.map(match => createMatchHistoryItem(match)).join('');
// }

window.loadMatchHistory = loadMatchHistory;