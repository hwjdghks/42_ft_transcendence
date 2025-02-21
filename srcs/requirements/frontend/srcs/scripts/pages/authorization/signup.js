let cachedUserData = {};

async function handleSignupSubmit(event) {
    event.preventDefault();

    const existingToken = sessionStorage.getItem("signup_fa");

    if (!existingToken) {
        // Step 1: Send Code
        const username = document.getElementById('username').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm_password').value;

        if (password !== confirmPassword) {
            showMessage('Passwords do not match. Please try again.', 'error');
            return;
        }

        try {
            const requestData = { username, email, password };
            const response = await fetchOTPRequest(requestData);
            sessionStorage.setItem('signup_fa', response.token); //1FA 토큰 저장
            cachedUserData = { username, email, password };
            showMessage(response.message || 'OTP has been sent. Check your email.', 'success');

            document.getElementById('otp-container').style.display = 'block'; //Verify 입력칸 표시
            document.getElementById('signup-btn').textContent = 'Signup';
        } catch (error) {
            console.error(error);
            showMessage('Failed to send OTP code. Please try again.', 'error');
            return ;
        }
    } else {
        // Step 2: Verify Code + Final Signup
        const otp = document.getElementById('otp').value.trim();
        if (!otp) {
            showMessage('Please enter your OTP code.', 'error');
            return;
        }

        try {
            const verifyResponse = await fetchOTPVerify(existingToken, otp);
            sessionStorage.setItem('signup_fa', verifyResponse.token);

            const signupResponse = await fetchSignup(cachedUserData);
            showMessage(signupResponse.message || 'Sign up successful!', 'success');

            setTimeout(() => {
                window.location.hash = '#login';
            }, 500);
        } catch (error) {
            console.error(error);
            showMessage('OTP verification failed or signup failed. Please try again.', 'error');
        }
    }
}

async function fetchOTPRequest(data) {
    const token = sessionStorage.getItem("signup_fa") || "";
    const response = await fetch('https://localhost/api/auth/2fa/signup/request/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
            {
                username: data.username,
                email: data.email,
                password: data.password,
                token: token
            }
        )
    });

    if (!response.ok) throw new Error('Failed to request 2FA OTP');
    return await response.json();
}

async function fetchOTPVerify(token, otp) {
    const response = await fetch('https://localhost/api/auth/2fa/signup/verify/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            token,
            otp
        }),
    });
    if (!response.ok) throw new Error('Failed to verify OTP');
    return await response.json();
}

async function fetchSignup(data) {
    const token = sessionStorage.getItem("signup_fa") || "";
    const response = await fetch('https://localhost/api/users/signup/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            ...data,
            token: token
        }),
    });

    if (!response.ok) {
        throw new Error('Failed to sign up');
    }

    return await response.json();
}

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
                    <div class="mb-3" id="otp-container" style="display: none;">
                        <label for="otp" class="form-label">Verify Code</label>
                        <input type="text" class="form-control" id="otp" placeholder="Enter OTP code">
                    </div>
                    <button type="submit" class="btn signup-btn" id="signup-btn">Send Code</button>
                </form>
                <div id="signup-message" class="mt-3"></div>
            </div>
        </div>
    `;
}
