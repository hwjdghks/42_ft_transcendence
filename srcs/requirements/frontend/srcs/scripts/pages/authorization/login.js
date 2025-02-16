async function handleLoginSubmit(event) {
    event.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    try {
        const response = await fetchLogin({ email, password });
        //sessionStorage.setItem('jwtToken', response.token);
        sessionStorage.setItem('username', response.username);
        showMessage(response.message, 'success');

        setTimeout(() => {
            window.location.href = '#profile';
        }, 1000);

        
    } catch (error) {
        showMessage('An error occurred. Please try again later.', 'error');
        console.error('Login error:', error);
    }
}

async function fetchLogin(data) {
    const response = await fetch('https://localhost/api/users/signin/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error('Login failed');
    }

    return await response.json();
}

function showMessage(message, type) {
    const messageDiv = document.getElementById('login-message');
    if (!messageDiv) return;

    messageDiv.textContent = message;
    messageDiv.className = `alert ${type === 'success' ? 'alert-success' : 'alert-danger'}`;
}

export function LoginPage() {
    setTimeout(() => {
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', handleLoginSubmit);
        }
    }, 0);

    return `
        <div class="login-page">
            <div class="login-container">
                <h1 class="login-heading">Login</h1>
                <form class="mt-3" id="login-form">
                    <div class="mb-3">
                        <label for="email" class="form-label">Email address</label>
                        <input type="email" class="form-control" id="email" placeholder="Enter your email">
                    </div>
                    <div class="mb-3">
                        <label for="password" class="form-label">Password</label>
                        <input type="password" class="form-control" id="password" placeholder="Enter your password">
                    </div>
                    <button type="submit" class="btn login-btn">Submit</button>
                </form>
                <div id="login-message" class="mt-3"></div>
                <a href="/#signup" class="btn btn-link mt-3">Sign up</a>
            </div>
        </div>
    `;
}
