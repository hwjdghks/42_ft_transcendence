async function handleSignupSubmit(event) {
    event.preventDefault(); 

    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm_password').value;

    if (password !== confirmPassword) {
        showMessage('Passwords do not match. Please try again.', 'error');
        return; 
    }

    try {
        const response = await fetchSignup({ username, email, password });
        showMessage(response.message, 'success');
    } catch (error) {
        showMessage('An error occurred. Please try again later.', 'error');
        console.error(error);
    }
}

// Fetch 함수
async function fetchSignup(data) {
    const response = await fetch('https://localhost/api/users/signup/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error('Failed to sign up');
    }

    return await response.json();
}

// 메시지 표시 함수
function showMessage(message, type) {
    const messageDiv = document.getElementById('signup-message');
    if (!messageDiv) return;

    messageDiv.textContent = message;
    messageDiv.className = `alert ${type === 'success' ? 'alert-success' : 'alert-danger'}`;
}

export function SignupPage() {
    setTimeout(() => {
        const signupForm = document.getElementById('signup-form');
        if (signupForm) {
            signupForm.addEventListener('submit', handleSignupSubmit);
        }
    }, 0);

    return `
        <div class="signup-page">
            <div class="signup-container">
                <h1 class="signup-heading">Sign Up</h1>
                <form class="mt-3" id="signup-form">
                    <div class="mb-3">
                        <label for="username" class="form-label">Username</label>
                        <input type="text" class="form-control" id="username" placeholder="Enter your username">
                    </div>
                    <div class="mb-3">
                        <label for="email" class="form-label">Email address</label>
                        <input type="email" class="form-control" id="email" placeholder="Enter your email">
                    </div>
                    <div class="mb-3">
                        <label for="password" class="form-label">Password</label>
                        <input type="password" class="form-control" id="password" placeholder="Enter your password">
                    </div>
                    <div class="mb-3">
                        <label for="confirm_password" class="form-label">Confirm Password</label>
                        <input type="password" class="form-control" id="confirm_password" placeholder="Confirm your password">
                    </div>
                    <button type="submit" class="btn signup-btn">Send Code</button>
                </form>
                <div id="signup-message" class="mt-3"></div>
            </div>
        </div>
    `;
}