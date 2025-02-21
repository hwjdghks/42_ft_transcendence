let cachedUserData = {};

async function handleSignupSubmit(event) {
    event.preventDefault();

    const existingToken = sessionStorage.getItem("signup_fa");

    if (!existingToken) {
        const username = document.getElementById('username').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm_password').value;

        if (password !== confirmPassword) {
            showMessage('Passwords do not match. Please try again.', 'error');
            return;
        }

        try {
            const signupResponse = await fetchSignup({ username, email, password });
            console.log("Signup Response:", signupResponse);
            sessionStorage.setItem('signup_fa', signupResponse.token); // 1차 토큰 저장
            cachedUserData = { username, email, password };

            console.log("OTP request...");
            const otpResponse = await fetchOTPRequest(signupResponse.token);
            console.log("OTP Response:", otpResponse); 
            showMessage(otpResponse.message || 'OTP has been sent. Check your email.', 'success');

            /*
            setTimeout(() => {
                const otpContainer = document.getElementById('otp-container');
                const signupBtn = document.getElementById('signup-btn');
            
                if (!otpContainer) {
                    console.error("OTP container not found!");
                    return;
                }
            
                console.log("Before change:", getComputedStyle(otpContainer).display);
            
                // 기존 `!important` 스타일 적용 방지
                otpContainer.classList.remove("hidden");
                otpContainer.classList.add("active");

            
                // 직접 스타일 변경
                otpContainer.style.display = "block"; 
                otpContainer.style.visibility = "visible";
                otpContainer.style.opacity = "1";
            
                console.log("After change:", getComputedStyle(otpContainer).display);
            
                if (signupBtn) signupBtn.textContent = 'Verify';
            }, 100);*/
            
            

        } catch (error) {
            console.error(error);
            showMessage(error.message || 'Signup failed. Please try again.', 'error');
        }
    } else {
        const otp = document.getElementById('otp').value.trim();
        if (!otp) {
            showMessage('Please enter your OTP code.', 'error');
            return;
        }

        try {
            const verifyResponse = await fetchOTPVerify(existingToken, otp);
            sessionStorage.setItem('signup_fa', verifyResponse.token);
            showMessage(verifyResponse.message || 'Signup successful!', 'success');
            setTimeout(() => {
                window.location.hash = '#login';
            }, 500);
        } catch (error) {
            console.error(error);
            showMessage(error.message || 'OTP verification failed. Please try again.', 'error');
        }
    }
}


async function fetchSignup(data) {
    console.log("Signup Request Data:", JSON.stringify(data, null, 2));
    const response = await fetch('https://localhost/api/users/signup/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    const responseData = await response.json();
    console.log("Signup API Response:", responseData);

    if (!response.ok) {
        throw new Error(responseData.error || "Signup failed"); 
    }

    return responseData;
}


async function fetchOTPRequest(token) {
    const response = await fetch('https://localhost/api/auth/2fa/signup/request/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({})
    });

    const responseData = await response.json();

    if (!response.ok) throw new Error(responseData.error || "OTP request failed");
    return responseData;
}


async function fetchOTPVerify(token, otp) {
    const response = await fetch('https://localhost/api/auth/2fa/signup/verify/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ otp })
    });

    const responseData = await response.json();

    if (!response.ok) throw new Error(responseData.error || "OTP verification failed");
    return responseData;
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
                    <div class="mb-3" id="otp-container">
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
