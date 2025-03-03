async function fetchAccountDeletion() {
    const token = sessionStorage.getItem('fa_token');
    
    const response = await fetch('https://localhost/api/users/withdraw/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error('Account deletion failed');
    }

    return await response.json();
}

export function createDeleteAccountModal() {
    const modal = document.createElement('div');
    modal.innerHTML = `
        <div id="deleteAccountModal" class="modal fade" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                   <div class="modal-header">
                        <h2 class="h4 mb-3">
                            <span class="fs-1 fw-bold text-purple">
                                Warning
                            </span>
                         </h2>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <p>Once you confirm, all game records and your account will be permanently deleted and cannot be recovered!</p>
                        <input type="text" id="confirmUsername" class="form-control is-invalid" placeholder="Enter username to confirm">
                        <small class="text-danger" id="confirmError">Wrong username</small>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-danger" id="confirmDelete" disabled>Delete Account</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    const bootstrapModal = new bootstrap.Modal(document.getElementById('deleteAccountModal'));

    const confirmUsernameInput = modal.querySelector('#confirmUsername');
    const confirmDeleteBtn = modal.querySelector('#confirmDelete');
    const confirmErrorText = modal.querySelector('#confirmError');

    let storedUsername = null;

    const token = sessionStorage.getItem('fa_token');

    fetch('https://localhost/api/users/name/', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch username');
        }
        return response.json();
    })
    .then(data => {
        storedUsername = data.username;
        console.log('Fetched username:', storedUsername);
    })
    .catch(error => {
        console.error('Error fetching username:', error);
    });
    
    confirmUsernameInput.addEventListener('input', () => {
      if (storedUsername === null) return;
    
      if (confirmUsernameInput.value === storedUsername) {
        confirmUsernameInput.classList.remove('is-invalid');
        confirmUsernameInput.classList.add('is-valid');
        confirmErrorText.style.display = 'none';
        confirmDeleteBtn.disabled = false;
      } else {
        confirmUsernameInput.classList.remove('is-valid');
        confirmUsernameInput.classList.add('is-invalid');
        confirmErrorText.style.display = 'block';
        confirmDeleteBtn.disabled = true;
      }
    })
    

    confirmDeleteBtn.addEventListener('click', async () => {
        try {
            const response = await fetchAccountDeletion();
            alert(response.message || 'Account deleted successfully.');
    
            sessionStorage.clear();
    
            const modalElement = document.getElementById('deleteAccountModal');
            const bootstrapModal = bootstrap.Modal.getInstance(modalElement);
    
            if (bootstrapModal) {
                bootstrapModal.hide();
                bootstrapModal.dispose();
            }
    
            setTimeout(() => {
                if (modalElement) {
                    modalElement.remove();
                }
                window.location.href = '#login';
            }, 500);
    
        } catch (error) {
            alert('Failed to delete account. Please try again.');
            console.error('Account deletion error:', error);
        }
    });
    

    return modal;
}
