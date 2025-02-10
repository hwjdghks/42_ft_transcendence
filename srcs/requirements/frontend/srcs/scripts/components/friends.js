let allUsers = [
    { id: 1, username: 'Ryan', avatar: '/static/user_image/Ryan.png' },
    { id: 2, username: 'Muji', avatar: '/static/user_image/Muji.jpg' },
    { id: 3, username: 'Conn', avatar: '/static/user_image/Conn.png' },
  ];
  
  let friends = [

  ];
  
  function renderFriends() {
      const friendsContainer = document.getElementById('friends');
      friendsContainer.innerHTML = '';
      
      friendsContainer.style.display = 'grid';
      friendsContainer.style.gridTemplateColumns = 'repeat(auto-fill, minmax(150px, 1fr))';
      friendsContainer.style.gap = '16px';
      
      friends.forEach(friend => {
        const friendElement = document.createElement('div');
        friendElement.classList.add('d-flex', 'align-items-center', 'mb-2', 'justify-content-between', 'border', 'p-2', 'rounded');
        
        friendElement.style.flexDirection = 'column';
        friendElement.style.alignItems = 'center';
    
        friendElement.innerHTML = `
          <div class="d-flex flex-column align-items-center">
              <img src="${friend.avatar}" alt="${friend.username}" class="rounded-circle me-2" style="width: 40px; height: 40px;">
              <div class="d-flex align-items-center">
              <span>${friend.username}</span>
              <button class="btn btn-danger btn-sm ms-2" onclick="removeFriend(${friend.id})" style="font-size: 12px; padding: 2px 5px;">X</button>
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
      title.classList.add('add-friend-title'); // 여기에 클래스 추가
      popupContent.appendChild(title);

  
      // 검색 입력란
      const searchInput = document.createElement('input');
      searchInput.type = 'text';
      searchInput.placeholder = 'Search for friends...';
      searchInput.classList.add('form-control', 'mb-3');
      searchInput.addEventListener('input', filterFriends);
      popupContent.appendChild(searchInput);
  
      // 친구 목록
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
  
  function filterFriends(event) {
      const query = event.target.value.toLowerCase();
      const searchResults = document.getElementById('searchResults');
      searchResults.innerHTML = '';
  
      const filteredUsers = allUsers.filter(user =>
          user.username.toLowerCase().includes(query)
      );
  
      filteredUsers.forEach(user => {
          const userElement = document.createElement('div');
          userElement.classList.add('d-flex', 'align-items-center', 'mb-2', 'justify-content-between');
  
          userElement.innerHTML = `
              <div class="d-flex align-items-center">
                  <img src="${user.avatar}" alt="${user.username}" class="rounded-circle me-2" style="width: 40px; height: 40px;">
                  <span>${user.username}</span>
              </div>
              <button class="btn btn-success btn-sm ms-2" onclick="addFriendFromSearch(${user.id})">+</button>
          `;
          searchResults.appendChild(userElement);
      });
  }
  
  function addFriendFromSearch(userId) {
      const userToAdd = allUsers.find(user => user.id === userId);
      
      // 이미 친구 목록에 추가된 유저인지 확인
      if (!friends.some(friend => friend.id === userToAdd.id)) {
          friends.push(userToAdd);
          renderFriends(); // 친구 목록 갱신
      }
      
      const popup = document.querySelector('.popup');
      popup.remove(); // 팝업 닫기
  }
  
  function removeFriend(friendId) {
      friends = friends.filter(friend => friend.id !== friendId);
      renderFriends(); 
  }
  
  window.renderFriends = renderFriends;
  