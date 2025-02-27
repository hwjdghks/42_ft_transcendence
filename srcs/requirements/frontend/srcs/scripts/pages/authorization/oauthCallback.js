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
    const response = await fetch(`https://localhost/api/oauth/42intra/oauth-callback/?code=${code}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("백엔드 에러:", errorData);
      alert("로그인 처리 중 에러가 발생했습니다.");
      window.location.hash = "#login";
      return;
    }

    // 백엔드가 반환한 JSON에서 JWT 토큰 추출
    const data = await response.json();
    const token = data.token;
    if (!token) {
      throw new Error("토큰이 없습니다.");
    }

    // JWT 토큰을 sessionStorage에 저장
    sessionStorage.setItem("fa_token", token);

    // 토큰 저장 후 원하는 페이지(예: 프로필 페이지)로 이동
    window.location.hash = "#profile";
  } catch (error) {
    console.error("OAuth 코드 교환 에러:", error);
    alert("로그인 처리 중 오류가 발생했습니다.");
    window.location.hash = "#login";
  }
}

