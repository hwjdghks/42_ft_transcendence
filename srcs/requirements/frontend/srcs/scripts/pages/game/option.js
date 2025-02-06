function getGameOptionPage() {
  const container = document.createElement('div');
  container.className = 'container py-5';

  container.innerHTML = `
      <!-- Header Section -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="fw-bold">Game Option</h2>
      </div>

      <!-- Players Section -->
      <div class="card mb-4">
        <div class="card-body">
          <h5 class="card-title">Players</h5>
          <div class="btn-group w-100" role="group">
            <button type="button" class="btn btn-primary active" data-players="2">2</button>
            <button type="button" class="btn btn-outline-primary" data-players="4">4</button>
            <button type="button" class="btn btn-outline-primary" data-players="8">8</button>
          </div>

          <!-- Player Input Section (inside the card) -->
          <div id="playerInputs" class="mt-3">
            <div class="mb-3">
              <label class="form-label">User 2</label>
              <input type="text" class="form-control" placeholder="Enter username">
            </div>
          </div>
        </div>
      </div>

      <!-- Paddle Size Section -->
      <div class="card mb-4">
        <div class="card-body">
          <h5 class="card-title">Paddle Size</h5>
          <div class="btn-group w-100" role="group">
            <button type="button" class="btn btn-primary active">x1</button>
            <button type="button" class="btn btn-outline-primary">x1.25</button>
            <button type="button" class="btn btn-outline-primary">x1.5</button>
            <button type="button" class="btn btn-outline-primary">x1.75</button>
            <button type="button" class="btn btn-outline-primary">x2.0</button>
          </div>
        </div>
      </div>

      <!-- Ball Speed Section -->
      <div class="card mb-4">
        <div class="card-body">
          <h5 class="card-title">Ball Speed</h5>
          <div class="btn-group w-100" role="group">
            <button type="button" class="btn btn-primary active">x1</button>
            <button type="button" class="btn btn-outline-primary">x1.25</button>
            <button type="button" class="btn btn-outline-primary">x1.5</button>
            <button type="button" class="btn btn-outline-primary">x1.75</button>
            <button type="button" class="btn btn-outline-primary">x2.0</button>
          </div>
        </div>
      </div>

      <!-- Obstacles Section -->
      <div class="card mb-4">
        <div class="card-body">
          <h5 class="card-title">Obstacles Number</h5>
          <div class="btn-group w-100" role="group">
            <button type="button" class="btn btn-primary active">1</button>
            <button type="button" class="btn btn-outline-primary">2</button>
            <button type="button" class="btn btn-outline-primary">3</button>
            <button type="button" class="btn btn-outline-primary">4</button>
            <button type="button" class="btn btn-outline-primary">5</button>
          </div>
        </div>
      </div>

      <!-- Next Button -->
      <div class="text-center">
        <button class="btn btn-primary w-50" id="game-option-next">Next</button>
      </div>
  `;

  const btnGroups = container.querySelectorAll('.btn-group');
  btnGroups.forEach(btnGroup => {
    btnGroup.addEventListener('click', (event) => {
      if (event.target.tagName === 'BUTTON') {
        btnGroup.querySelectorAll('button').forEach(btn => {
          btn.classList.remove('active', 'btn-primary');
          btn.classList.add('btn-outline-primary');
        });
        event.target.classList.add('active', 'btn-primary');
        event.target.classList.remove('btn-outline-primary');

        const players = parseInt(event.target.getAttribute('data-players'));
        if (!isNaN(players)) {
          renderPlayerInputs(players);
        }

        // Save option to sessionStorage
        saveOptionsToSessionStorage();
      }
    });
  });

  function renderPlayerInputs(players) {
    const playerInputs = container.querySelector('#playerInputs');
    playerInputs.innerHTML = '';

    for (let i = 1; i < players; i++) {
      playerInputs.innerHTML += `
        <div class="mb-3">
          <label class="form-label">User ${i + 1}</label>
          <input type="text" class="form-control" placeholder="Enter username" oninput="saveOptionsToSessionStorage()">
        </div>
      `;
    }
  }

  const nextButton = container.querySelector('#game-option-next');
  nextButton.addEventListener('click', () => {
    saveOptionsToSessionStorage();
    window.location.hash = '#gameplay/tournamant';
  });

  function saveOptionsToSessionStorage() {
    const players = container.querySelector('.btn-group .active[data-players]')?.getAttribute('data-players');
    const usernames = [...container.querySelectorAll('#playerInputs input')].map(input => input.value);
    const paddleSize = container.querySelectorAll('.btn-group')[1].querySelector('.active')?.textContent;
    const ballSpeed = container.querySelectorAll('.btn-group')[2].querySelector('.active')?.textContent;
    const obstacles = container.querySelectorAll('.btn-group')[3].querySelector('.active')?.textContent;

    const options = {
      players: players,
      usernames: usernames,
      paddleSize: paddleSize,
      ballSpeed: ballSpeed,
      obstacles: obstacles
    };

    sessionStorage.setItem('game_option', JSON.stringify(options));
  }

  return container;
}

window.getGameOptionPage = getGameOptionPage;


// function getGameOptionPage() {
//   const container = document.createElement('div');
//   container.className ='container py-5';

//   container.innerHTML =  `
//       <!-- Header Section -->
//       <div class="d-flex justify-content-between align-items-center mb-4">
//         <h2 class="fw-bold">Game Option</h2>
//       </div>

//       <!-- Players Section -->
//       <div class="card mb-4">
//         <div class="card-body">
//           <h5 class="card-title">Players</h5>
//           <div class="btn-group w-100" role="group">
//             <button type="button" class="btn btn-primary active">2</button>
//             <button type="button" class="btn btn-outline-primary">4</button>
//             <button type="button" class="btn btn-outline-primary">8</button>
//           </div>
//         </div>
//       </div>

//       <!-- Paddle Size Section -->
//       <div class="card mb-4">
//         <div class="card-body">
//           <h5 class="card-title">Paddle Size</h5>
//           <div class="btn-group w-100" role="group">
//             <button type="button" class="btn btn-primary active">x1</button>
//             <button type="button" class="btn btn-outline-primary">x1.25</button>
//             <button type="button" class="btn btn-outline-primary">x1.5</button>
//             <button type="button" class="btn btn-outline-primary">x1.75</button>
//             <button type="button" class="btn btn-outline-primary">x2.0</button>
//           </div>
//         </div>
//       </div>

//       <!-- Ball Speed Section -->
//       <div class="card mb-4">
//         <div class="card-body">
//           <h5 class="card-title">Ball Speed</h5>
//           <div class="btn-group w-100" role="group">
//             <button type="button" class="btn btn-primary active">x1</button>
//             <button type="button" class="btn btn-outline-primary">x1.25</button>
//             <button type="button" class="btn btn-outline-primary">x1.5</button>
//             <button type="button" class="btn btn-outline-primary">x1.75</button>
//             <button type="button" class="btn btn-outline-primary">x2.0</button>
//           </div>
//         </div>
//       </div>

//       <!-- Obstacles Section -->
//       <div class="card mb-4">
//         <div class="card-body">
//           <h5 class="card-title">Obstacles Number</h5>
//           <div class="btn-group w-100" role="group">
//             <button type="button" class="btn btn-primary active">1</button>
//             <button type="button" class="btn btn-outline-primary">2</button>
//             <button type="button" class="btn btn-outline-primary">3</button>
//             <button type="button" class="btn btn-outline-primary">4</button>
//             <button type="button" class="btn btn-outline-primary">5</button>
//           </div>
//         </div>
//       </div>

//       <!-- Background Theme Section -->
//       <div class="card mb-4">
//         <div class="card-body">
//           <h5 class="card-title">Background Theme</h5>
//           <div class="btn-group w-100" role="group">
//             <button type="button" class="btn btn-primary active">R</button>
//             <button type="button" class="btn btn-outline-primary">G</button>
//             <button type="button" class="btn btn-outline-primary">B</button>
//             <button type="button" class="btn btn-outline-primary">W</button>
//             <button type="button" class="btn btn-outline-primary">Black</button>
//           </div>
//         </div>
//       </div>

//       <!-- Next Button -->
//       <div class="text-center">
//         <button class="btn btn-primary w-50" id="game-option-next">Next</button>
//       </div>
//   `;

//   // 3) 위에서 만든 container 내부의 요소를 찾아서 이벤트 리스너를 붙인다.
//   const btnGroups = container.querySelectorAll('.btn-group');
//   btnGroups.forEach(btnGroup => {
//     btnGroup.addEventListener('click', (event) => {
//       if (event.target.tagName === 'BUTTON') {
//         // 1) 모든 버튼 초기화
//         btnGroup.querySelectorAll('button').forEach(btn => {
//           btn.classList.remove('active', 'btn-primary');
//           btn.classList.add('btn-outline-primary');
//         });
//         // 2) 클릭된 버튼 활성화
//         event.target.classList.add('active', 'btn-primary');
//         event.target.classList.remove('btn-outline-primary');
//       }
//     });
//   });

//   // Next 버튼 이벤트
//   const nextButton = container.querySelector('#game-option-next');
//   if (nextButton) {
//     nextButton.addEventListener('click', () => {
//       // 선택된 옵션 수집
//       const groups = container.querySelectorAll('.btn-group');
//       const options = {
//         players: groups[0].querySelector('.active')?.textContent.trim(),
//         paddleSize: groups[1].querySelector('.active')?.textContent.trim(),
//         ballSpeed: groups[2].querySelector('.active')?.textContent.trim(),
//         obstacles: groups[3].querySelector('.active')?.textContent.trim(),
//         theme: groups[4].querySelector('.active')?.textContent.trim()
//       };
//       // 세션 스토리지에 옵션 저장
//       sessionStorage.setItem('game_option', JSON.stringify(options));

//       // 세션 스토리지에 list 페이지 접근 플래그 저장
//       sessionStorage.setItem('list_access_granted', 'true');

//       // 라우터 이동
//       window.location.hash = '#gameplay/list';
//     });
//   }
//   return container;
// }

// window.getGameOptionPage = getGameOptionPage;
