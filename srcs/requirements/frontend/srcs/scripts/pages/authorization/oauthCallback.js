import { checkCookie } from '../../validation/cookie.js';

export function OauthCallbackPage() {
  const container = document.createElement("div");
  container.innerHTML = "<p>로그인 처리 중입니다. 잠시만 기다려주세요...</p>";

  setTimeout(handleOauthCallback, 100);

  return container;
}

async function handleOauthCallback() {
  const hash = window.location.hash;
  const queryIndex = hash.indexOf("?");
  let code;
  if (queryIndex !== -1) {
    const queryString = hash.substring(queryIndex + 1);
    const params = new URLSearchParams(queryString);
    code = params.get("code");
  }

  if (!code) {
    alert("인증 코드가 없습니다. 다시 로그인 해주세요.");
    window.location.hash = "#login";
    return;
  }

	console.log(code);

  try {
    const response = await fetch(`https://localhost/api/oauth/42intra/oauth-callback/`, {
      method: "POST",
      credentials: 'include',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ code })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("백엔드 에러:", errorData);
      alert("로그인 처리 중 에러가 발생했습니다.");
      window.location.hash = "#login";
      return;
    }

    const data = await response.json();
    if (!await checkCookie()) {
      throw new Error("토큰이 없습니다.");
    }

    setTimeout(async () => {
      fetchFriends();
      window.location.hash = "#profile"; 
    }, 1000);

    window.location.hash = "#profile";
  } catch (error) {
    console.error("OAuth 코드 교환 에러:", error);
    alert("로그인 처리 중 오류가 발생했습니다.");
    window.location.hash = "#login";
  }
}

