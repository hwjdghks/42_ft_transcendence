const accordions = document.querySelectorAll('.accordion-button');
accordions.forEach(button => {
  button.addEventListener('click', () => {
    const target = document.querySelector(button.dataset.bsTarget);
    const collapse = new bootstrap.Collapse(target);
    collapse.toggle();
  });
});

function initializeDropdowns() {
    document.querySelectorAll('.dropdown').forEach(dropdown => {
        const toggle = dropdown.querySelector('.dropdown-toggle');
        const menu = dropdown.querySelector('.dropdown-menu');
        const chevron = toggle.querySelector('.chevron');

        toggle.addEventListener('click', (e) => {
            e.stopPropagation(); // 클릭 이벤트 전파 방지
            menu.classList.toggle('show');
            chevron.classList.toggle('rotated');
        });

        // 드롭다운 외부 클릭 시 닫기
        document.addEventListener('click', () => {
            menu.classList.remove('show');
            chevron.classList.remove('rotated');
        });
    });
}

async function buildProfilePage() {
	console.log("✅ buildProfilePage 함수 실행됨!");  // 로그 추가
    const container = document.createElement('div');
    container.className = 'container py-5';

	// 예시: 사용자의 이메일을 알아야 하는데, 로그인 등으로부터 받아온 값이 있다고 가정합니다.
    const userEmail = 'test@example.com';

    // Django API 엔드포인트 호출: 비동기(fetch) 방식으로 데이터 받아오기
    return fetch(`/api/profile/${userEmail}/`)
    	.then(response => {
          if (!response.ok) {
              throw new Error('네트워크 응답이 올바르지 않습니다.');
          }
          return response.json();
    	})
		.then(data => {
			// 받아온 데이터로 프로필 페이지 내용을 업데이트합니다.
			console.log("📊 API 데이터:", data);  // 데이터 확인
			// 데이터가 없으면 기본 콘텐츠만 표시
		container.innerHTML = `
			<div class="container py-5">
				<div class="bg-white rounded shadow p-4 max-width-800 mx-auto text-center">
					<!-- Profile Section -->
					<div class="mb-4">
						<img src="/static/profile.jpg" alt="Profile" class="profile-img mb-3">
						<h2 class="h4 mb-3">
							<span class="fs-2 fw-bold">${data.username}</span>
						</h2>
						<button class="btn btn-secondary">
							<span class="fs-5 fw-bold">Profile Upload</span>
						</button>
					</div>

					<!-- Stats Section -->
					<div class="row g-3 mb-4">
						<div class="col-3">
							<div class="stat-card bg-purple text-white p-3 rounded">
								<span class="fs-3 fw-bold">Totals</span>
							</div>
							<div class="text-center mt-2 fw-bold">
								<span class="fs-1 fw-bold">
									${data.match_results.length}
								</span>
							</div>
						</div>
					<div class="col-3">
						<div class="stat-card bg-primary text-white p-3 rounded">
							<span class="fs-3 fw-bold">Wins</span>
						</div>
						<div class="text-center mt-2 fw-bold">
							<span class="fs-1 fw-bold">
								${data.match_results.filter(result => result.game_result === 'win').length}
							</span>
						</div>
					</div>
					<div class="col-3">
						<div class="stat-card bg-danger text-white p-3 rounded">
							<span class="fs-3 fw-bold">Losses</span>
						</div>
						<div class="text-center mt-2 fw-bold">
							<span class="fs-1 fw-bold">
								${data.match_results.filter(result => result.game_result === 'lose').length}
							</span>
						</div>
					</div>
					<div class="col-3">
						<div class="stat-card bg-secondary text-white p-3 rounded">
							<span class="fs-3 fw-bold">Draws</span>
						</div>
						<div class="text-center mt-2 fw-bold">
							<span class="fs-1 fw-bold">
								${data.match_results.filter(result => result.game_result === 'draw').length}
							</span>
						</div>
					</div>
				</div>
				<!-- Accordion Sections -->
				<div class="accordion mt-4">
					<div class="accordion-item mb-3 border-0">
						<button class="w-100 p-3 text-start bg-white rounded-3 shadow-sm d-flex justify-content-between align-items-center" 
							data-content="matchHistory">
							<span class="fs-4 fw-bold">Match history</span>
							<i class="bi bi-chevron-down"></i>
						</button>
						<div id="matchHistory" class="content p-3 bg-white rounded-3 mt-2 shadow-sm" style="display: none;">
						</div>
					</div>
					<div class="accordion-item mb-3 border-0">
						<div class="accordion mt-4">
							<div class="accordion-item mb-3 border-0">
								<button class="w-100 p-3 text-start bg-white rounded-3 shadow-sm d-flex justify-content-between align-items-center" 
									data-content="friends">
									<span class="fs-4 fw-bold">Friends</span>
									<i class="bi bi-chevron-down"></i>
								</button>
								<div id="friends" class="content p-3 bg-white rounded-3 mt-2" style="display: none;">
									<!-- Friends list will be rendered here -->
								</div>
					</div>

					<div class="accordion-item mb-3 border-0">
						<button class="w-100 p-3 text-start bg-white rounded-3 shadow-sm d-flex justify-content-between align-items-center" 
							data-content="setting">
							<span class="fs-4 fw-bold">Setting</span>
							<i class="bi bi-chevron-down"></i>
						</button>
						<div id="setting" class="content p-3 bg-white rounded-3 mt-2" style="display: none;">
							<div>Setting 1</div>
							<div>Setting 2</div>
							<div>Setting 3</div>
						</div>
					</div>
				</div>
			</div>
		</div>
		`;
		const buttons = container.querySelectorAll('.accordion-item button');
		buttons.forEach(button => {
			button.addEventListener('click', () => {
				console.log("toggleContent before data.match_results.length");
				// console.log(data.match_results.length);
				const contentId = button.getAttribute('data-content');
				data.contentId = contentId;
				toggleContent(data);
			});
		});
		console.log("🔹 반환된 HTML:", container.innerHTML);  // 로그 추가
		return container;
		})
		.catch(error => {
			console.error('프로필 데이터를 가져오는데 실패했습니다:', error);
			container.innerHTML = '<p>프로필 정보를 불러오는데 문제가 발생했습니다.</p>';
			return container;
		});
}

function toggleContent(data) {
	console.log("✅ toggleContent 실행됨");
    const content = document.getElementById(data.contentId);
    const button = content.previousElementSibling;
    const icon = button.querySelector('.bi-chevron-down');
    
    document.querySelectorAll('.content').forEach(el => {
        if (el.id !== data.contentId) {
            el.style.display = 'none';
            el.previousElementSibling.querySelector('.bi-chevron-down').style.transform = 'rotate(0deg)';
        }
    });

    if (content.style.display === 'none' || content.style.display === '') {
		console.log("✅ toggleContent if문 실행됨");
        content.style.display = 'block';
        icon.style.transform = 'rotate(180deg)';
        
        if (data.contentId === 'matchHistory') {
			console.log("✅ matchHistory if문 실행됨");
            content.innerHTML = loadMatchHistory(data);
			console.log("test")
			console.log(content.innerHTML)
        }
        
        else if (data.contentId === 'friends') {
            renderFriends();
        }
    } else {
        content.style.display = 'none';
        icon.style.transform = 'rotate(0deg)';
    }
}

window.toggleContent = toggleContent;
window.createProfilePage = async function() {
    console.log("✅ window.createProfilePage 실행됨");
    const page = await buildProfilePage();  // ✅ 자기 자신이 아닌 `createProfilePage()` 호출
    console.log("✅ createProfilePage 반환됨:", page);
    return page;
};
