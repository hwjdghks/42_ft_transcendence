async function fetchCookie() {
    try {
      const response = await fetch('https://localhost/api/auth/check_cookie/', {
        method: 'GET',
        credentials: 'include', // 쿠키 포함 요청
        headers: {
          'Content-Type': 'application/json', // JSON 형식 명시
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

export async function checkCookie() {
    try {
      const data = await fetchCookie();
      return data.cookieExists;  // 반환값에서 cookieExists 사용
    } catch (error) {
      console.error('쿠키 확인 중 오류 발생:', error);
      return false;
    }
  }

export async function checkTempCookie() {
    try {
      const data = await fetchCookie();
      return data.tempCookieExists;  // 반환값에서 tempCookieExists 사용
    } catch (error) {
      console.error('쿠키 확인 중 오류 발생:', error);
      return false;
    }
  }