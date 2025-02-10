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

function loadMatchHistory() {
    // 임시 데이터
    const matches = [
        {
            id: 1,
            status: 'win',
            player1: { 
                username: 'Ryan', 
                avatar: '/static/user_image/Ryan.png' 
            },
            player2: { 
                username: 'Muji', 
                avatar: '/static/user_image/Muji.jpg'
            },
            score: { player1: 3, player2: 1 },
            date: '2025/03/15'
        },
        {
            id: 2,
            status: 'draw',
            player1: { 
                username: 'Ryan', 
                avatar: '/static/user_image/Ryan.png'
            },
            player2: { 
                username: 'Conn', 
                avatar: '/static/user_image/Conn.png'
            },
            score: { player1: 2, player2: 2 },
            date: '2025/03/15'
        },
        {
            id: 3,
            status: 'loss',
            player1: { 
                username: 'Ryan', 
                avatar: '/static/user_image/Ryan.png'
            },
            player2: { 
                username: 'Conn', 
                avatar: '/static/user_image/Conn.png'
            },
            score: { player1: 1, player2: 3 },
            date: '2025/03/15'
        }
    ];

    return matches.map(match => createMatchHistoryItem(match)).join('');
}

window.loadMatchHistory = loadMatchHistory;