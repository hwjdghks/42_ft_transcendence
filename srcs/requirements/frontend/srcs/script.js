document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('signupEmail').value;
    const username = document.getElementById('signupUsername').value;
    const password = document.getElementById('signupPassword').value;

    console.log('📌 Signup Request:', { email, username, password });

    const response = await fetch('/api/users/signup/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password })
    });

    console.log('📌 Signup Response:', response);

    const data = await response.json();
    console.log('📌 Signup Response Data:', data);

    if (response.ok) {
        alert('Signed up successfully');
    } else {
        alert(`Error signing up: ${data.error}`);
    }
});

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    console.log('📌 Login Request:', { email, password });

    const response = await fetch('/api/users/signin/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });

    console.log('📌 Login Response:', response);

    const data = await response.json();
    console.log('📌 Login Response Data:', data);

    if (response.ok) {
        alert('Logged in successfully');
        document.getElementById('authSection').style.display = 'none';
        document.getElementById('userSection').style.display = 'block';
    } else {
        alert(`Error logging in: ${data.error}`);
    }
});

document.getElementById('viewProfileBtn').addEventListener('click', async () => {
    console.log('📌 Fetching profile...');

    const response = await fetch('/api/users/profile/', {
        method: 'GET',
        credentials: 'include' // 세션 유지
    });

    console.log('📌 Profile Response:', response);

    const data = await response.json();
    console.log('📌 Profile Data:', data);

    if (response.ok) {
        document.getElementById('userEmail').textContent = data.email;
        document.getElementById('userUsername').textContent = data.username;

        if (data.profile_image) {
            document.getElementById('userProfileImage').src = data.profile_image;
            document.getElementById('userProfileImage').style.display = 'block';
        }

        document.getElementById('profileDetails').style.display = 'block';
    } else {
        alert(`Error fetching profile: ${data.error}`);
    }
});

document.getElementById('uploadProfileImageBtn').addEventListener('click', async () => {
    const formData = new FormData();
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';

    fileInput.onchange = async (e) => {
        formData.append('profile_image', e.target.files[0]);
        console.log('📌 Uploading image:', e.target.files[0]);

        const response = await fetch('/api/users/upload/', {
            method: 'POST',
            body: formData,
            credentials: 'include'
        });

        console.log('📌 Upload Response:', response);

        const data = await response.json();
        console.log('📌 Upload Response Data:', data);

        if (response.ok) {
            alert('Profile image uploaded');
            location.reload();
        } else {
            alert(`Error uploading profile image: ${data.error}`);
        }
    };

    fileInput.click();
});

document.getElementById('logoutBtn').addEventListener('click', async () => {
    console.log('📌 Logging out...');

    const response = await fetch('/api/users/signout/', {
        method: 'POST',
        credentials: 'include'
    });

    console.log('📌 Logout Response:', response);

    const data = await response.json();
    console.log('📌 Logout Response Data:', data);

    if (response.ok) {
        alert('Logged out successfully');
        document.getElementById('authSection').style.display = 'block';
        document.getElementById('userSection').style.display = 'none';
    } else {
        alert(`Error logging out: ${data.error}`);
    }
});

document.getElementById('withdrawBtn').addEventListener('click', async () => {
    console.log('📌 Withdrawing account...');

    const response = await fetch('/api/users/withdraw/', {
        method: 'POST',
        credentials: 'include'
    });

    console.log('📌 Withdraw Response:', response);

    const data = await response.json();
    console.log('📌 Withdraw Response Data:', data);

    if (response.ok) {
        alert('Account withdrawn');
        document.getElementById('authSection').style.display = 'block';
        document.getElementById('userSection').style.display = 'none';
    } else {
        alert(`Error withdrawing account: ${data.error}`);
    }
});
