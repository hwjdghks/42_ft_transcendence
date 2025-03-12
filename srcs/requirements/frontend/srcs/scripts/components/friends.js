import { trans } from '../language.js';

let friends = [];

export function fetchFriends() {
  const friendListPromise = fetch("https://localhost/api/friends/list/", {
    method: "GET",
    credentials: 'include',
    headers: { "Content-Type": "application/json" }
  }).then(response => {
    if (!response.ok) {
      throw new Error(trans[window.curLang].errorFetchingFriends + " " + response.status);
    }
    return response.json();
  });

  const onlineListPromise = fetch("https://localhost/api/friends/online/", {
    method: "GET",
    credentials: 'include',
    headers: { "Content-Type": "application/json" }
  }).then(response => {
    if (!response.ok) {
      console.error(trans[window.curLang].errorFetchingFriends, response.status);
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
    .catch(error => console.error(trans[window.curLang].errorFetchingFriends, error));
}

export function renderFriends() {
  const friendsContainer = document.getElementById('friends');
  if (!friendsContainer) return;
  
  friendsContainer.innerHTML = '';

  friends.forEach(friend => {
    const friendElement = document.createElement('div');
    friendElement.classList.add('d-flex', 'align-items-center', 'mb-2', 'justify-content-between', 'border', 'p-2', 'rounded');
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
  addButton.textContent = trans[window.curLang].friendsAddFriend;
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
  title.textContent = trans[window.curLang].friendsModalTitle;
  title.classList.add('add-friend-title');
  popupContent.appendChild(title);

  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.placeholder = trans[window.curLang].friendsSearchPlaceholder;
  searchInput.classList.add('form-control', 'mb-3');
  searchInput.addEventListener('keydown', function(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      performFriendSearch(event.target.value);
    }
  });
  popupContent.appendChild(searchInput);
  
  setTimeout(() => {
    searchInput.focus();
  }, 0);


  const searchResults = document.createElement('div');
  searchResults.id = 'searchResults';
  popupContent.appendChild(searchResults);

  const closeButton = document.createElement('button');
  closeButton.classList.add('btn', 'btn-secondary');
  closeButton.textContent = trans[window.curLang].friendsClose;
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
    credentials: 'include',
    headers: { "Content-Type": "application/json" }
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
    .catch(error => console.error(trans[window.curLang].errorSearchingFriends, error));
}

export function addFriendFromSearch(friendname) {
  console.log(trans[window.curLang].attemptingToAddFriend, friendname);

  fetch("https://localhost/api/friends/add/", {
    method: "POST",
    credentials: 'include',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ friendname: friendname })
  })
  .then(response => {
    console.log(trans[window.curLang].httpStatusCode, response.status);
    return response.json().then(data => ({ status: response.status, data }));
  })
  .then(result => {
    console.log(trans[window.curLang].responseData, result.data);
    if (result.status >= 400) {
      console.error(trans[window.curLang].errorAddingFriend, JSON.stringify(result.data, null, 2));
    } else {
      fetchFriends();
      alert(trans[window.curLang].friendAddedSuccessfully);
    }
  })
  .catch(error => console.error(trans[window.curLang].errorAddingFriend, error));

  const popup = document.querySelector('.popup');
  if (popup) popup.remove();
}

export function removeFriend(friendname) {
  fetch("https://localhost/api/friends/delete/", {
    method: "POST",
    credentials: 'include',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ friendname: friendname })
  })
    .then(response => response.json())
    .then(data => {
      fetchFriends();
      alert(trans[window.curLang].friendRemovedSuccessfully);
    })
    .catch(error => console.error(trans[window.curLang].errorDeletingFriend, error));
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('friends')) {
    fetchFriends();
  } else {
    const observer = new MutationObserver((mutations, obs) => {
      if (document.getElementById('friends')) {
        fetchFriends();
        obs.disconnect();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }
});

window.removeFriend = removeFriend;
window.fetchFriends = fetchFriends;
window.addFriendFromSearch = addFriendFromSearch;
