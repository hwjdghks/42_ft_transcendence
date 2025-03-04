function getToken() {
  return sessionStorage.getItem('fa_token');
}

let friends = [];

export function fetchFriends() {
  const friendListPromise = fetch("https://localhost/api/friends/list/", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${getToken()}`
    }
  }).then(response => {
    if (!response.ok) {
      throw new Error("Friend list fetch error: " + response.status);
    }
    return response.json();
  });

  const onlineListPromise = fetch("https://localhost/api/friends/online/", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${getToken()}`
    }
  }).then(response => {
    if (!response.ok) {
      console.error("Online status fetch error, using fallback. Status:", response.status);
      return { results: [] };
    }
    return response.json();
  });

  Promise.all([friendListPromise, onlineListPromise])
    .then(([friendData, onlineData]) => {
      const onlineStatusMap = {};
      if (onlineData.results) {
        onlineData.results.forEach(status => {
          onlineStatusMap[status.username] = status.is_online;
        });
      }

      friends = friendData.results.map(friend => ({
        username: friend.username,
        avatar: friend.profile_image || '/static/profile.jpg',
        is_online: onlineStatusMap[friend.username] || false
      }));
      console.log("[fetchFriends] merged friends data:", friends);
      renderFriends();
    })
    .catch(error => console.error('Error fetching friends:', error));
}

export function renderFriends() {
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
        <div class="d-flex align-items-center" style="margin-top: 8px;">
          <span>${friend.username}</span>
          <span class="status-indicator" style="
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background-color: ${friend.is_online ? 'green' : 'red'};
            margin-left: 5px;
          "></span>
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

export function openAddFriendPopup() {
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

  const title = document.createElement('h3');
  title.textContent = 'Add Friend';
  title.classList.add('add-friend-title');
  popupContent.appendChild(title);

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

  const searchResults = document.createElement('div');
  searchResults.id = 'searchResults';
  popupContent.appendChild(searchResults);

  const closeButton = document.createElement('button');
  closeButton.classList.add('btn', 'btn-secondary');
  closeButton.textContent = 'Close';
  closeButton.onclick = () => popup.remove();
  popupContent.appendChild(closeButton);

  popup.appendChild(popupContent);
  document.body.appendChild(popup);
}

export function performFriendSearch(query) {
  const searchResults = document.getElementById('searchResults');
  searchResults.innerHTML = '';

  fetch(`https://localhost/api/friends/search/?search_query=${encodeURIComponent(query)}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${getToken()}`
    }
  })
    .then(response => response.json())
    .then(data => {
      data.results.forEach(user => {
        const userElement = document.createElement('div');
        userElement.classList.add('d-flex', 'align-items-center', 'mb-2', 'justify-content-between');
        userElement.innerHTML = `
          <div class="d-flex align-items-center">
            <img src="${user.profile_image || '/static/profile.jpg'}" alt="${user.username}" class="rounded-circle me-2" style="width: 40px; height: 40px;">
            <span>${user.username}</span>
          </div>
          <button class="btn btn-success btn-sm ms-2" onclick="addFriendFromSearch('${user.username}')">+</button>
        `;
        searchResults.appendChild(userElement);
      });
    })
    .catch(error => console.error("Error searching friends:", error));
}

export function addFriendFromSearch(friendname) {
  console.log("Attempting to add friend:", friendname);

  fetch("https://localhost/api/friends/add/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${getToken()}`
    },
    body: JSON.stringify({ friendname: friendname })
  })
  .then(response => {
    console.log(`HTTP Status Code: ${response.status}`);
    return response.json().then(data => ({ status: response.status, data }));
  })
  .then(result => {
    console.log("Response data:", result.data);
    if (result.status >= 400) {
      console.error("Error occurred while adding friend:", JSON.stringify(result.data, null, 2));
    } else {
      fetchFriends();
    }
  })
  .catch(error => console.error("Error adding friend:", error));

  const popup = document.querySelector('.popup');
  if (popup) popup.remove();
}



export function removeFriend(friendname) {
  fetch("https://localhost/api/friends/delete/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${getToken()}`
    },
    body: JSON.stringify({ friendname: friendname })
  })
    .then(response => response.json())
    .then(data => {
      fetchFriends();
    })
    .catch(error => console.error("Error deleting friend:", error));
}

document.addEventListener('DOMContentLoaded', () => {
  fetchFriends();
});

window.removeFriend = removeFriend;
window.fetchFriends= fetchFriends;
window.addFriendFromSearch = addFriendFromSearch;
