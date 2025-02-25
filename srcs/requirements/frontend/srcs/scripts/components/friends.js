function getToken() {
    return sessionStorage.getItem("token");
  }
  
  let friends = [];
  
  function fetchFriends() {
    fetch("https://localhost/api/friends/list/", {
      headers: {
        "Authorization": `Bearer ${getToken()}`
      }
    })
      .then(response => response.json())
      .then(data => {
        friends = data.data.results.map(friend => ({
          username: friend.username,
          avatar: friend.profile_image
        }));
        renderFriends();
      })
      .catch(error => console.error('Error fetching friends:', error));
  }
  
  function renderFriends() {
    const friendsContainer = document.getElementById('friends');
    friendsContainer.innerHTML = '';
  
    friendsContainer.style.display = 'grid';
    friendsContainer.style.gridTemplateColumns = 'repeat(auto-fill, minmax(150px, 1fr))';
    friendsContainer.style.gap = '16px';
  
    friends.forEach(friend => {
      const friendElement = document.createElement('div');
      friendElement.classList.add(
        'd-flex',
        'align-items-center',
        'mb-2',
        'justify-content-between',
        'border',
        'p-2',
        'rounded'
      );
      friendElement.style.flexDirection = 'column';
      friendElement.style.alignItems = 'center';
  
      friendElement.innerHTML = `
        <div class="d-flex flex-column align-items-center">
            <img src="${friend.avatar}" alt="${friend.username}" class="rounded-circle me-2" style="width: 40px; height: 40px;">
            <div class="d-flex align-items-center">
                <span>${friend.username}</span>
                <button class="btn btn-danger btn-sm ms-2" onclick="removeFriend('${friend.username}')" style="font-size: 12px; padding: 2px 5px;">X</button>
            </div>
        </div>
        `;
      friendsContainer.appendChild(friendElement);
    });
  
    const addButton = document.createElement('button');
    addButton.classList.add('btn', 'btn-success', 'mt-2');
    addButton.style.gridColumn = 'span 2';
    addButton.textContent = 'Add Friend';
    addButton.onclick = openAddFriendPopup;
    friendsContainer.appendChild(addButton);
  }
  
  function openAddFriendPopup() {
    const popup = document.createElement('div');
    popup.classList.add('popup');
    popup.style.position = 'fixed';
    popup.style.top = '0';
    popup.style.left = '0';
    popup.style.width = '100vw';
    popup.style.height = '100vh';
    popup.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    popup.style.display = 'flex';
    popup.style.justifyContent = 'center';
    popup.style.alignItems = 'center';
  
    const popupContent = document.createElement('div');
    popupContent.classList.add('popup-content');
    popupContent.style.backgroundColor = 'white';
    popupContent.style.padding = '20px';
    popupContent.style.borderRadius = '8px';
    popupContent.style.width = '400px';
  
    // 제목
    const title = document.createElement('h3');
    title.textContent = 'Add Friend';
    title.classList.add('add-friend-title');
    popupContent.appendChild(title);
  
    // 검색 입력란
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search for friends...';
    searchInput.classList.add('form-control', 'mb-3');
    searchInput.addEventListener('keydown', function(event) {
      if (event.key === "Enter") {
        performFriendSearch(event.target.value);
      }
    });
    popupContent.appendChild(searchInput);
  
    // 검색 결과 영역
    const searchResults = document.createElement('div');
    searchResults.id = 'searchResults';
    popupContent.appendChild(searchResults);
  
    // 팝업 닫기 버튼
    const closeButton = document.createElement('button');
    closeButton.classList.add('btn', 'btn-secondary');
    closeButton.textContent = 'Close';
    closeButton.onclick = () => popup.remove();
    popupContent.appendChild(closeButton);
  
    popup.appendChild(popupContent);
    document.body.appendChild(popup);
  }
  
  function performFriendSearch(query) {
    const searchResults = document.getElementById('searchResults');
    searchResults.innerHTML = '';
  
    fetch(`https://localhost/api/friends/search/?search_query=${encodeURIComponent(query)}`, {
      headers: {
        "Authorization": `Bearer ${getToken()}`
      }
    })
      .then(response => response.json())
      .then(data => {
        const results = data.data.results;
        results.forEach(user => {
          const userElement = document.createElement('div');
          userElement.classList.add('d-flex', 'align-items-center', 'mb-2', 'justify-content-between');
          userElement.innerHTML = `
            <div class="d-flex align-items-center">
                <img src="${user.profile_image}" alt="${user.username}" class="rounded-circle me-2" style="width: 40px; height: 40px;">
                <span>${user.username}</span>
            </div>
            <button class="btn btn-success btn-sm ms-2" onclick="addFriendFromSearch('${user.username}')">+</button>
          `;
          searchResults.appendChild(userElement);
        });
      })
      .catch(error => console.error("Error searching friends:", error));
  }

  /** -> body안에 쿼리를 넣는 방식. 위 처럼 URL 쿼리를 사용 할 시 삭제.
   * function performFriendSearch(query) {
  const searchResults = document.getElementById('searchResults');
  searchResults.innerHTML = '';

  fetch("https://localhost/api/friends/search/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${getToken()}`
    },
    body: JSON.stringify({
      search_query: query
    })
  })
    .then(response => response.json())
    .then(data => {
      const results = data.data.results;
      results.forEach(user => {
        const userElement = document.createElement('div');
        userElement.classList.add('d-flex', 'align-items-center', 'mb-2', 'justify-content-between');
        userElement.innerHTML = `
          <div class="d-flex align-items-center">
              <img src="${user.profile_image}" alt="${user.username}" class="rounded-circle me-2" style="width: 40px; height: 40px;">
              <span>${user.username}</span>
          </div>
          <button class="btn btn-success btn-sm ms-2" onclick="addFriendFromSearch('${user.username}')">+</button>
        `;
        searchResults.appendChild(userElement);
      });
    })
    .catch(error => console.error("Error searching friends:", error));
}

   * 
  */
  
  function addFriendFromSearch(friendname) {
    fetch("https://localhost/api/friends/add/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getToken()}`
      },
      body: JSON.stringify({
        friendname: friendname
      })
    })
      .then(response => response.json())
      .then(data => {
        fetchFriends();
      })
      .catch(error => console.error("Error adding friend:", error));
  
    const popup = document.querySelector('.popup');
    if (popup) popup.remove();
  }
  
  function removeFriend(friendname) {
    fetch("https://localhost/api/friends/delete/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getToken()}`
      },
      body: JSON.stringify({
        friendname: friendname
      })
    })
      .then(response => response.json())
      .then(data => {
        fetchFriends();
      })
      .catch(error => console.error("Error deleting friend:", error));
  }
  
  window.renderFriends = renderFriends;
  document.addEventListener('DOMContentLoaded', fetchFriends);
  
