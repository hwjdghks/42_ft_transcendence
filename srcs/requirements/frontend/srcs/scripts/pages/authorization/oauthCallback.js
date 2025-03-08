import { checkCookie } from '../../validation/cookie.js';
import { postOauthToken } from '../../api/scriptApi.js';

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
    alert('There is no authentication code.Please login again.');
    window.location.hash = "#login";
    return;
  }

  try {
    const token = await postOauthToken(code);
    setTimeout(() => {
      fetchFriends();
      window.location.hash = "#profile";
    }, 1000);

    window.location.hash = "#profile";
  } catch (error) {
    alert('Error: ' + error.message);
    window.location.hash = "#login";
  }
}
