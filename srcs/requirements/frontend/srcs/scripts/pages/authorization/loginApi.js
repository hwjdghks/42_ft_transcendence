
export async function fetchLogin(data) {
  const response = await fetch('https://localhost/api/users/signin/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Login failed');
  return await response.json();
}
 
export async function fetchLoginOTPRequest(token) {
  const response = await fetch('https://localhost/api/auth/2fa/signin/request/', {
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

export async function fetchLoginOTPVerify(token, otp) {
  const response = await fetch('https://localhost/api/auth/2fa/signin/verify/', {
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

export function showMessage(message, type) {
  const messageDiv = document.getElementById('login-message');
  if (!messageDiv) return;
  messageDiv.textContent = message;
  messageDiv.className = `alert ${type === 'success' ? 'alert-success' : 'alert-danger'}`;
}
