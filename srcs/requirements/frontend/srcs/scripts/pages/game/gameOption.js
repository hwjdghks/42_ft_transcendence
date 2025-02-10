function getGameOptionPage() {
  return `
    <div class="container py-5">
      <!-- Header Section -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="fw-bold">Game Option</h2>
        <button class="btn btn-outline-secondary">
          <i class="bi bi-arrow-left"></i> Back
        </button>
      </div>

      <!-- Players Section -->
      <div class="card mb-4">
        <div class="card-body">
          <h5 class="card-title">Players</h5>
          <div class="btn-group w-100" role="group">
            <button type="button" class="btn btn-primary active">2</button>
            <button type="button" class="btn btn-outline-primary">4</button>
            <button type="button" class="btn btn-outline-primary">8</button>
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

      <!-- Background Theme Section -->
      <div class="card mb-4">
        <div class="card-body">
          <h5 class="card-title">Background Theme</h5>
          <div class="row">
            ${[...Array(5)].map(
              (_, i) => `
              <div class="col-6 col-md-2 mb-3">
                <div class="card bg-light">
                  <img src="../static/placeholder.png" class="card-img-top rounded" alt="Theme ${i + 1}">
                  <div class="card-body text-center">
                    <small class="text-muted">Placeholder ${i + 1}</small>
                  </div>
                </div>
              </div>
            `
            ).join("")}
          </div>
        </div>
      </div>

      <!-- Next Button -->
      <div class="text-center">
        <button class="btn btn-success w-50">Next</button>
      </div>
    </div>
  `;
}

window.getGameOptionPage = getGameOptionPage;