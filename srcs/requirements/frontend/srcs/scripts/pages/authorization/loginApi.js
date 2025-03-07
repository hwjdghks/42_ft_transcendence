
export async function fetchLogin(data) {
  const response = await fetch('https://localhost/api/users/signin/', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Login failed');
  return await response.json();
}
 
export async function fetchLoginOTPRequest() {
  const response = await fetch('https://localhost/api/auth/2fa/signin/request/', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({})
  });
  const responseData = await response.json();
  if (!response.ok) throw new Error(responseData.error || "OTP request failed");
  return responseData;
}

export async function fetchLoginOTPVerify(otp) {
  const response = await fetch('https://localhost/api/auth/2fa/signin/verify/', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ otp })
  });
  const responseData = await response.json();
  if (!response.ok) throw new Error(responseData.error || "OTP verification failed");
  return responseData;
}

export function showMessage(message, type) {
  const messageDiv = document.getElementById('login-message');
  if (!messageDiv) return;
  messageDiv.textContent = message;
  messageDiv.className = `alert ${type === 'success' ? 'alert-success' : 'alert-danger'}`;
}
