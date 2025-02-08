export function SignupPage() {
    return `
        <div class="signup-page">
            <div class="signup-container">
                <h1 class="signup-heading">Sign Up</h1>
                <form class="mt-3">
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
                        <input type="confirm_password" class="form-control" id="password" placeholder="Confirm your password">
                    </div>
                    <button type="submit" class="btn signup-btn">Send Code</button>
                </form>
            </div>
        </div>
    `;
}
