async function fetchCookie() {
  try {
    const response = await fetch('https://localhost/api/auth/check_cookie/', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
    const data = await response.json();
    return data;  // cookieExists와 tempCookieExists 모두 반환
  } catch (error) {
    console.error('쿠키 확인 중 오류 발생:', error);
    return { cookieExists: false, tempCookieExists: false }; // 기본값 설정
  }
}

export async function removeCookie(cookieName) {
  try {
    const response = await fetch(`https://localhost/api/auth/remove_cookie/?cookie_name=${encodeURIComponent(cookieName)}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
    return true;
  } catch (error) {
    console.error('쿠키 삭제 중 오류 발생:', error);
    return false;
  }
}

export async function checkCookie() {
    try {
      const data = await fetchCookie();
      return data.cookieExists;
    } catch (error) {
      console.error('쿠키 확인 중 오류 발생:', error);
      return false;
    }
  }

export async function checkTempCookie() {
    try {
      const data = await fetchCookie();
      return data.tempCookieExists;
    } catch (error) {
      console.error('쿠키 확인 중 오류 발생:', error);
      return false;
    }
  }