// ./scripts/router.js

// 예: 다른 페이지들도 각 js 파일에서 비슷하게 "HTML 문자열을 리턴"하는 함수를
// 전역(window) 혹은 export로 꺼내온 뒤, 아래 객체에 매핑해주면 됩니다.
const pages = {
  login: () => `
    <h1>Login Page</h1>
    <p>Welcome to the login page.</p>
  `,

  signup: () => `
    <h1>Signup Page</h1>
    <p>Sign up to create an account.</p>
  `,

  // gameOption.js에서 전역으로 등록한 함수
  gameplay: window.getGameOptionPage, 
  // 혹은 ESModule 방식이라면 import 해서: gameplay: getGameOptionPage,

//   profile: () => {
//     return window.createProfilePage().outerHTML;
//   },
	profile: async () => {
		console.log("🔍 profile() 실행 시작");
		const page = await window.createProfilePage();
		console.log("🔍 createProfilePage() 반환 값:", page);

		if (!page) {
			console.error("❌ createProfilePage()가 올바른 HTML 요소를 반환하지 않았습니다.");
			return "<p>프로필 데이터를 불러오지 못했습니다.</p>";
		}

		console.log("✅ profile() 정상적으로 실행됨, HTML 반환 준비 완료.");
		// return page.outerHTML;
		// outerHTML 대신 실제 page 요소를 반환합니다.
		return page;
	},

  // 기본(해당 해시가 없을 경우)
  default: () => `
    <h1>Welcome</h1>
    <p>Select a page from the menu.</p>
  `
};

// 라우터 함수
async function router() {
  
  console.log("🚀 [router] 함수 실행됨!");  // ✅ 여기가 출력되지 않으면 router()가 실행되지 않은 것

  const hash = window.location.hash.replace('#', '') || 'default';
  console.log('Current hash:', hash);

  console.log('🔍 [router] Current hash:', hash);

  const app = document.getElementById('app');
  const renderPage = pages[hash] || pages.default;
  console.log('Current hash:', hash);
  console.log('Rendered page:', renderPage);

  console.log('📝 [router] Rendered page function:', renderPage);
  
  // HTML 문자열을 받아서 app.innerHTML에 주입
  const pageContent = await renderPage()
  if (typeof pageContent === 'string') {
    app.innerHTML = pageContent;
	console.log("📝 [router] pageContent는 문자열이므로 innerHTML로 삽입");
  } else {
    // app.replaceChildren(pageContent);
	console.log("🔄 DOM 요소 직접 삽입 시도");
	app.innerHTML = "";  // 기존 내용 초기화
	app.appendChild(pageContent);
  }

  console.log('App innerHTML updated:', app.innerHTML);
}

// 첫 로딩 시 실행
window.addEventListener('load', router);
// 해시 변경 시마다 실행
// window.addEventListener('hashchange', router);
window.addEventListener('hashchange', async () => {
    console.log("🔄 Hash 변경 감지됨");
    await router();
});
