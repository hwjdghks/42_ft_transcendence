import { renderMatchHistory } from "../../components/matchHistory.js";

/**
 * 프로필 데이터(이미지, 매치 결과, 친구 목록 등)를 가져오는 함수
 * 
 * @async
 * @function fetchProfileData
 * @throws {Error} 요청이 실패하면 오류를 발생시킵니다.
 * 
 */
async function fetchProfileData() {
	try {
			const token = sessionStorage.getItem('fa_token');
			const response = await fetch('https://localhost/api/users/profile/', {
					method: 'GET',
					headers: {
							'Content-Type': 'application/json',
							'Authorization': `Bearer ${token}`
					}
			});
			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || 'Failed fetchProfileData');
			}
			const result = await response.json();
			return result;
	} catch (error) {
			console.error(error);
			throw error
	}
}

/**
 * 프로필 이미지를 업로드하는 함수
 * 
 * @async
 * @function uploadProfileImage
 * @param {File} file 업로드할 프로필 이미지 파일
 * @throws {Error} 업로드 요청이 실패하면 오류를 발생
 * 
 */
async function uploadProfileImage(file) {
	const token = sessionStorage.getItem('fa_token');
	const formData = new FormData();
	formData.append('profile_image', file);
	try {
		const response = await fetch('https://localhost/api/users/upload/', {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${token}`
			},
			body: formData
		});
		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.error || 'Failed uploadProfileImage');
		}
		const result = await response.json();
		if (result.profile_image_url) {
			const profileImg = document.querySelector('.profile-img');
			if (profileImg) {
				profileImg.src = result.profile_image_url;
			}
		}
		renderMatchHistory();
		alert('Success to upload profile image');
	} catch (error) {
		console.error('Error:', error.message);
		alert(error.message);
	}
}

async function fetchLogout() {
	const token = sessionStorage.getItem('fa_token');
	const response = await fetch('https://localhost/api/users/signout/', {
	  method: 'POST',
	  headers: {
		'Content-Type': 'application/json',
		'Authorization': `Bearer ${token}`
	  }
	});
  
	if (!response.ok) {
		const error = await response.json();
	  throw new Error(error.error);
	}
	const result = await response.json();
	return result.message;
}

export { fetchProfileData, uploadProfileImage, fetchLogout };