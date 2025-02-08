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

/*
async function fetchProfile() {
    const token = sessionStorage.getItem('jwtToken'); // JWT 가져오기

    try {
        const response = await fetch('http://localhost/api/users/profile', { // 프로필 API URL
            method: 'GET', // HTTP 요청 메서드 (GET, POST 등)
            headers: {
                'Content-Type': 'application/json', // 요청 데이터 형식
                'Authorization': `Bearer ${token}` // JWT 포함
            }
        });

        if (!response.ok) { // 응답이 실패하면 오류 처리
            throw new Error('Unauthorized');
        }

        return await response.json(); // JSON 응답 데이터 반환
    } catch (error) {
        console.error('Error fetching profile:', error); // 오류 로그 출력
    }
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
