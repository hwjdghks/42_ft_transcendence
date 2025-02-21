export async function fetchSignup(data) {
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
  
  export async function fetchOTPRequest(token) {
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
  
  export async function fetchOTPVerify(token, otp) {
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
  
  // 공용 메시지 함수
  export function showMessage(message, type) {
    const messageDiv = document.getElementById('signup-message');
    if (!messageDiv) return;
  
    messageDiv.textContent = message;
    messageDiv.className = `alert ${type === 'success' ? 'alert-success' : 'alert-danger'}`;
  }
  