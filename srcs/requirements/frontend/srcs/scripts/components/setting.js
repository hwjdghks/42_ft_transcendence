// setting.js

function renderSettings() {
    const container = document.createElement('div');
    container.className = 'container py-5';
  
    container.innerHTML = `
      <div class="bg-white rounded shadow p-4 max-width-800 mx-auto text-center">
          <!-- Setting Form -->
          <h2 class="fs-2 fw-bold mb-4">Setting</h2>
  
          <!-- Username Section -->
          <div class="mb-3">
              <label for="username" class="form-label">Username</label>
              <input type="text" class="form-control" id="username" placeholder="Enter your username">
          </div>
  
          <!-- Password Section -->
          <div class="mb-3">
              <label for="password" class="form-label">Password</label>
              <input type="password" class="form-control" id="password" placeholder="Enter your password">
          </div>
  
          <!-- Language Section -->
          <div class="mb-3">
              <label for="language" class="form-label">Language</label>
              <select class="form-select" id="language">
                  <option value="korean">Korean</option>
                  <option value="english">English</option>
                  <!-- Add more languages as needed -->
              </select>
          </div>
  
          <!-- Buttons Section -->
          <button class="btn btn-purple w-100 mb-2">Change data</button>
          <button class="btn btn-outline-primary w-100 mb-2">Log out</button>
          <button class="btn btn-danger w-100">Delete account</button>
      </div>
    `;
  
    return container;
  }
  
  window.renderSettings = renderSettings;
  