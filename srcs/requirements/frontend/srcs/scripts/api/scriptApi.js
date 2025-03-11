import { validateTournamentSession } from '../validation/sessionData.js';
import { checkCookie, removeCookie } from '../validation/cookie.js';

/**
 * 공통 응답 처리 함수
 * - 응답이 성공적이면 JSON 데이터를 그대로 반환
 * - 실패시, 백엔드가 던진 error 메시지를 담아 Error를 throw 함
 * @param {Response} response 
 * @returns {Promise<Object>} JSON 응답 데이터
 * @throws {Error} 에러 메시지 포함
 */
async function handleApiResponse(response) {
  const data = await response.json();
  if (response.ok) {
    return data;
  } else {
    throw new Error(data.error || 'error not defined.');
  }
}

/**
 * 게임 매치 결과 전송 함수
 * @param {Object} matchResultData - 매치 결과 데이터
 * @returns {Promise<Object>} 백엔드가 전달한 결과
 */
export async function postMatchResult(matchResultData) {
  const validSession = await validateTournamentSession();
  if (!validSession) {
    throw new Error('Session data is invalid.');
  }

  const response = await fetch('https://localhost/api/match/add/', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(matchResultData)
  });
  const data = await handleApiResponse(response);
  if (!await checkCookie()) {
    throw new Error('There are no tokens.');
  }
  return data;
}

/**
 * OAuth 토큰 요청 함수
 * @param {string} code - OAuth 인증 코드
 * @returns {Promise<string|null>} 토큰 문자열 또는 실패 시 null
 */
export async function postOauthToken(code) {
  const response = await fetch('https://localhost/api/oauth/42intra/oauth-callback/', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ code })
  });
    const data = await handleApiResponse(response);
    if (!await checkCookie()) {
      throw new Error('There are no tokens.');
    }
    return data.token;
}

/**
 * 사용자 프로필 데이터 조회 함수
 * @returns {Promise<Object>} 사용자 프로필 데이터
 */
export async function getProfileData() {
  const response = await fetch('https://localhost/api/users/profile/', {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    }
  });
  const data = await handleApiResponse(response);
  if (!await checkCookie()) {
    throw new Error('There are no tokens.');
  }
  return data;
}

/**
 * 프로필 이미지 업로드 함수
 * @param {File} file - 업로드할 이미지 파일
 * @returns {Promise<Object>} 백엔드가 전달한 결과
 */
export async function postProfileImage(file) {
  const formData = new FormData();
  formData.append('profile_image', file);
  const response = await fetch('https://localhost/api/users/upload/', {
    method: 'POST',
    credentials: 'include',
    headers: {
    },
    body: formData
  });
  if (response.status === 413) {
    throw new Error('File is too large.');
  }
  const data = await handleApiResponse(response);
  if (!await checkCookie()) {
    throw new Error('There are no tokens.');
  }
  if (data.profile_image_url) {
    const profileImg = document.querySelector('.profile-img');
    if (profileImg) {
      profileImg.src = data.profile_image_url;
    }
  }
  return data;
}

/**
 * 로그아웃 요청 함수
 * @returns {Promise<Object>} 백엔드가 전달한 결과
 */
export async function postLogout() {
  const response = await fetch('https://localhost/api/users/signout/', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    }
  });
  const data = await handleApiResponse(response);
  return data;
}

/**
 * 사용자 이름 업데이트 함수
 * @param {string} newUsername - 새 사용자 이름
 * @returns {Promise<Object>} 백엔드가 전달한 결과
 */
export async function postUpdateUsername(newUsername) {
  const response = await fetch('https://localhost/api/users/update/username/', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ new_username: newUsername })
  });
  const data = await handleApiResponse(response);
  if (!await checkCookie()) {
    throw new Error('There are no tokens.');
  }
  return data;
}

/**
 * 개인정보 설정 업데이트 함수
 * @param {boolean} showInSearch - 검색 노출 여부
 * @param {boolean} shareProfileImage - 프로필 이미지 공유 여부
 * @param {boolean} shareOnlineStatus - 온라인 상태 공유 여부
 * @returns {Promise<Object>} 백엔드가 전달한 결과
 */
export async function postUpdatePrivacySettings(showInSearch, shareProfileImage, shareOnlineStatus) {
  const response = await fetch('https://localhost/api/users/update/settings/', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      show_in_search: showInSearch,
      share_profile_image: shareProfileImage,
      share_online_status: shareOnlineStatus
    })
  });
  const data = await handleApiResponse(response);
  if (!await checkCookie()) {
    throw new Error('There are no tokens.');
  }
  return data;
}

/**
 * 패스워드 업데이트 함수
 * @param {string} currentPassword - 현재 비밀번호
 * @param {string} newPassword - 새 비밀번호
 * @returns {Promise<Object>} 백엔드가 전달한 결과
 */
export async function postUpdatePassword(currentPassword, newPassword) {
  
  const response = await fetch('https://localhost/api/users/update/password/', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      current_password: currentPassword,
      new_password: newPassword 
    })
  });
  const data = await handleApiResponse(response);
  if (!await checkCookie()) {
    throw new Error('There are no tokens.');
  }
  return data;
}

/**
 * OTP 전송 요청 함수
 */
export async function postRequestOTP() {
  const response = await fetch('https://localhost/api/auth/2fa/withdraw/request/', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({})
  });
  const data = await handleApiResponse(response);
  if (!await checkCookie()) {
    throw new Error('There are no tokens.');
  }
  return data;
}

/**
 * 계정 탈퇴 요청 함수
 * @param {string} otp - 사용자 입력 OTP 값
 */
export async function postWithdrawAccount(otp) {
  const response = await fetch('https://localhost/api/users/withdraw/', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ otp })
  });
  const data = await handleApiResponse(response);
  await removeCookie('jwt');
  return data;
}
