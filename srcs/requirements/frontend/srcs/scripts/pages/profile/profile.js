function toggleContent(id) {
    const content = document.getElementById(id);
    const button = content.previousElementSibling;
    const icon = button.querySelector('.bi-chevron-down');
    
    // 다른 모든 content를 닫습니다
    document.querySelectorAll('.content').forEach(el => {
        if (el.id !== id) {
            el.style.display = 'none';
            el.previousElementSibling.querySelector('.bi-chevron-down').style.transform = 'rotate(0deg)';
        }
    });

    // 선택된 content를 토글합니다
    if (content.style.display === 'none' || content.style.display === '') {
        content.style.display = 'block';
        icon.style.transform = 'rotate(180deg)';
    } else {
        content.style.display = 'none';
        icon.style.transform = 'rotate(0deg)';
    }
}

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

function createProfilePage() {
    const container = document.createElement('div');
    container.className = 'container py-5';

    container.innerHTML = `
        <div class="container py-5">
    <div class="bg-white rounded shadow p-4 max-width-800 mx-auto text-center">
        <!-- Profile Section -->
        <div class="mb-4">
             <img src="/static/profile.jpg" alt="Profile" class="profile-img mb-3">
            <h2 class="h4 mb-3">
                <span class="fs-2 fw-bold">
                    username
                </span>
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
                        0
                    </span>
                </div>
            </div>
            <div class="col-3">
                <div class="stat-card bg-primary text-white p-3 rounded">
                    <span class="fs-3 fw-bold">Wins</span>
                </div>
                <div class="text-center mt-2 fw-bold">
                    <span class="fs-1 fw-bold">
                        0
                    </span>
                </div>
            </div>
            <div class="col-3">
                <div class="stat-card bg-danger text-white p-3 rounded">
                    <span class="fs-3 fw-bold">Losses</span>
                </div>
                <div class="text-center mt-2 fw-bold">
                    <span class="fs-1 fw-bold">
                        0
                    </span>
                </div>
            </div>
            <div class="col-3">
                <div class="stat-card bg-secondary text-white p-3 rounded">
                    <span class="fs-3 fw-bold">Draws</span>
                </div>
                <div class="text-center mt-2 fw-bold">
                    <span class="fs-1 fw-bold">
                        0
                    </span>
                </div>
            </div>
        </div>

        <!-- Accordion Sections -->
        <div class="accordion mt-4">
            <div class="accordion-item mb-3 border-0">
                <button class="w-100 p-3 text-start bg-white rounded-3 shadow-sm d-flex justify-content-between align-items-center" 
                    data-content="matchHistory" onclick="toggleContent('matchHistory')">
                    <span class="fs-4 fw-bold">Match history</span>
                    <i class="bi bi-chevron-down"></i>
                </button>
                <div id="matchHistory" class="content p-3 bg-white rounded-3 mt-2" style="display: none;">
                    <div>Match 1</div>
                    <div>Match 2</div>
                    <div>Match 3</div>
                </div>
            </div>

            <div class="accordion-item mb-3 border-0">
                <button class="w-100 p-3 text-start bg-white rounded-3 shadow-sm d-flex justify-content-between align-items-center" 
                    data-content="friends" onclick="toggleContent('friends')">
                    <span class="fs-4 fw-bold">Friends</span>
                    <i class="bi bi-chevron-down"></i>
                </button>
                <div id="friends" class="content p-3 bg-white rounded-3 mt-2" style="display: none;">
                    <div>Friend 1</div>
                    <div>Friend 2</div>
                    <div>Friend 3</div>
                </div>
            </div>

            <div class="accordion-item mb-3 border-0">
                <button class="w-100 p-3 text-start bg-white rounded-3 shadow-sm d-flex justify-content-between align-items-center" 
                    data-content="setting" onclick="toggleContent('setting')">
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
            const contentId = button.getAttribute('data-content');
            toggleContent(contentId);
        });
    });

    return container;
}
window.toggleContent = toggleContent;
window.createProfilePage = createProfilePage;