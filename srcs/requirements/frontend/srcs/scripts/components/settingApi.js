/**
 * 유저 이름 업데이트를 위한 fetch 호출 함수
 */
async function fetchUpdateUsername(newUsername) {
    const token = sessionStorage.getItem('fa_token');

    const response = await fetch('https://localhost/api/users/update/username/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ new_username: newUsername })
    });

    let responseData;
    try {
        responseData = await response.json(); // JSON 파싱
    } catch (jsonError) {
        throw new Error('server response error');
    }

    if (!response.ok) {
        throw new Error(responseData.error || 'Failed to update username');
    }

    return responseData.message || 'Username updated successfully';
}


/**
 * 개인정보 업데이트를 위한 fetch 호출 함수
 */
async function fetchUpdatePrivacySettings(showInSearch, shareProfileImage, shareOnlineStatus) {
	const token = sessionStorage.getItem('fa_token');
	try {
		const response = await fetch('https://localhost/api/users/update/settings/', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${token}`
			},
			body: JSON.stringify({
				show_in_search: showInSearch,
				share_profile_image: shareProfileImage,
				share_online_status: shareOnlineStatus
			})
		});
		const result = await response.json();
		if (response.ok) {
			return { success: true, message: result.message || 'Settings updated successfully' };
		} else {
			return { success: false, message: result.error || 'Failed to update settings' };
		}
	} catch (error) {
		return { success: false, message: error.message || 'Error updating settings' };
	}
}

/**
 * 패스워드 업데이트를 위한 fetch 호출 함수
 */
async function fetchUpdatePassword(currentPassword, newPassword) {
	const token = sessionStorage.getItem('fa_token');
	try {
	  const response = await fetch('https://localhost/api/users/update/password/', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${token}`
			},
			body: JSON.stringify({ 
				current_password: currentPassword,
				new_password: newPassword 
			})
	  });
	  const result = await response.json();
	  if (!response.ok) {
			throw new Error(result.error || 'Failed to update password');
	  }
	  	return result.message || 'Password updated successfully';
		} catch (error) {
	  throw error;
	}
}

export { fetchUpdateUsername, fetchUpdatePrivacySettings, fetchUpdatePassword };
