const navbar = document.getElementById('navbar');

navbar.innerHTML = `
  <nav>
    <div>
      <div>
        <img src="../static/logo.png" alt="Logo">
        <a href="#profile" class="nav-link protected-link">Profile</a>
        <a href="#gameplay/option" class="nav-link protected-link">GamePlay</a>
      </div>
    </div>
  </nav>
`;

function isLoggedIn() {
  return sessionStorage.getItem('jwtToken') !== null;
}

function updateActiveLink() {
  const currentHash = window.location.hash;
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === currentHash);
  });
}

document.querySelectorAll('.protected-link').forEach(link => {
  link.addEventListener('click', (event) => {
    if (!isLoggedIn()) {
      event.preventDefault();
      alert("로그인이 필요합니다.");
      window.location.hash = "#login";
    }
  });
});

updateActiveLink();
window.addEventListener('hashchange', updateActiveLink);
