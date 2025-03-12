export async function fetchSignup(data) {
    const response = await fetch('https://localhost/api/users/signup/', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  
    const responseData = await response.json();
    // console.log("Signup API Response:", responseData);
  
    if (!response.ok) {
      throw new Error(responseData.error || "Signup failed");
    }
    return responseData;
  }
  
  export async function fetchOTPRequest() {
    const response = await fetch('https://localhost/api/auth/2fa/signup/request/', {
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
  
  export async function fetchOTPVerify(otp) {
    const response = await fetch('https://localhost/api/auth/2fa/signup/verify/', {
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
    const messageDiv = document.getElementById('signup-message');
    if (!messageDiv) return;
  
    messageDiv.textContent = message;
    messageDiv.className = `alert ${type === 'success' ? 'alert-success' : 'alert-danger'}`;
  }
  