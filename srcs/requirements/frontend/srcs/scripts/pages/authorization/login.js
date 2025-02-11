async function login(email, password) {
    try {
        const response = await fetch('http://localhost/api/users/signin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            throw new Error('Login failed');
        }

        const data = await response.json();
        const token = data.token;

        // JWT를 SessionStorage에 저장
        if (token) {
            sessionStorage.setItem('jwtToken', token);
        }

        // 로그인 성공 시 다른 페이지로 이동
        window.location.hash = '#profile';
    } catch (error) {
        console.error('Login error:', error);
    }
}

/*
function logout() {
    sessionStorage.removeItem('jwtToken'); 
    window.location.hash = '#login';
}
*/



export function LoginPage() {
    return `
        <div class="login-page">
            <div class="login-container">
                <h1 class="login-heading">Login</h1>
                <form class="mt-3">
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
                <a href="/#signup" class="btn btn-link mt-3">Sign up</a>
            </div>
        </div>
    `;
}
