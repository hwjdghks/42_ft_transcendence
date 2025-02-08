// API 기본 URL 설정
const API_BASE_URL = 'http://localhost/api';

// API 요청 기본 설정
const defaultHeaders = {
    'Content-Type': 'application/json'
};

// 프로필 관련 API 함수들
const profileAPI = {
    // 프로필 정보 가져오기
    async getProfileInfo() {
        try {
            const response = await fetch(`${API_BASE_URL}/profile/`);
            if (!response.ok) throw new Error('Failed to fetch profile');
            return await response.json();
        } catch (error) {
            console.error('Error fetching profile:', error);
            throw error;
        }
    },

    // 게임 기록 가져오기
    async getMatchHistory() {
        try {
            const response = await fetch(`${API_BASE_URL}/matches/history/`);
            if (!response.ok) throw new Error('Failed to fetch match history');
            return await response.json();
        } catch (error) {
            console.error('Error fetching match history:', error);
            throw error;
        }
    },

    // 프로필 이미지 업로드
    async uploadProfileImage(imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);

        try {
            const response = await fetch(`${API_BASE_URL}/profile/image/`, {
                method: 'POST',
                body: formData
            });
            if (!response.ok) throw new Error('Failed to upload image');
            return await response.json();
        } catch (error) {
            console.error('Error uploading profile image:', error);
            throw error;
        }
    }
};

// 게임 관련 API 함수들
const gameAPI = {
    // 게임 설정 저장
    async saveGameOptions(options) {
        try {
            const response = await fetch(`${API_BASE_URL}/game/options/`, {
                method: 'POST',
                headers: defaultHeaders,
                body: JSON.stringify(options)
            });
            if (!response.ok) throw new Error('Failed to save game options');
            return await response.json();
        } catch (error) {
            console.error('Error saving game options:', error);
            throw error;
        }
    },

    // 게임 매치메이킹 시작
    async startMatchmaking(gameMode) {
        try {
            const response = await fetch(`${API_BASE_URL}/game/matchmaking/`, {
                method: 'POST',
                headers: defaultHeaders,
                body: JSON.stringify({ gameMode })
            });
            if (!response.ok) throw new Error('Failed to start matchmaking');
            return await response.json();
        } catch (error) {
            console.error('Error starting matchmaking:', error);
            throw error;
        }
    }
};

// 이벤트 리스너 설정
document.addEventListener('DOMContentLoaded', () => {
    // 프로필 페이지 이벤트 리스너
    const setupProfileListeners = () => {
        // 프로필 이미지 업로드 버튼
        const uploadButton = document.querySelector('.profile-upload-btn');
        if (uploadButton) {
            uploadButton.addEventListener('click', () => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.onchange = async (e) => {
                    const file = e.target.files[0];
                    if (file) {
                        try {
                            await profileAPI.uploadProfileImage(file);
                            // 프로필 페이지 새로고침
                            window.location.reload();
                        } catch (error) {
                            console.error('Upload failed:', error);
                        }
                    }
                };
                input.click();
            });
        }
    };

    // 게임 옵션 페이지 이벤트 리스너
    const setupGameOptionListeners = () => {
        // Next 버튼 클릭 이벤트
        const nextButton = document.querySelector('.btn-success');
        if (nextButton) {
            nextButton.addEventListener('click', async () => {
                // 선택된 게임 옵션들 수집
                const options = {
                    players: document.querySelector('.btn-group .active').textContent,
                    paddleSize: document.querySelectorAll('.btn-group')[1].querySelector('.active').textContent,
                    ballSpeed: document.querySelectorAll('.btn-group')[2].querySelector('.active').textContent,
                    obstacles: document.querySelectorAll('.btn-group')[3].querySelector('.active').textContent
                };

                try {
                    await gameAPI.saveGameOptions(options);
                    // 게임 페이지로 이동
                    window.location.hash = '#gameplay';
                } catch (error) {
                    console.error('Failed to save game options:', error);
                }
            });
        }
    };

    // 라우터 이벤트에 따라 필요한 리스너 설정
    window.addEventListener('hashchange', () => {
        const hash = window.location.hash;
        if (hash === '#profile') {
            setupProfileListeners();
        } else if (hash === '#gameplay') {
            setupGameOptionListeners();
        }
    });

    // 초기 페이지 로드 시에도 리스너 설정
    setupProfileListeners();
    setupGameOptionListeners();
});