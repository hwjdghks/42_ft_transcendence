const navbar = document.getElementById('navbar');

navbar.innerHTML = `
  <nav>
    <div>
      <div>
        <img src="../static/logo.png" alt="Logo">
        <a href="#profile" class="nav-link">Profile</a>
        <a href="#gameplay" class="nav-link">GamePlay</a>
      </div>
    </div>
  </nav>
`;

function updateActiveLink() {
  const currentHash = window.location.hash;
  document.querySelectorAll('.nav-link').forEach(link => {
    if (link.getAttribute('href') === currentHash) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

updateActiveLink();
window.addEventListener('hashchange', updateActiveLink);



// const nextButton = document.getElementById('next-button');
// nextButton.addEventListener('click', () => {
//   window.location.hash = '#gameplay'; // 특정 해시로 이동
// });
