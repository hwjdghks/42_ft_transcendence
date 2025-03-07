function isInputUsernameValid(input) {
	return (validateAlphaNumeric(input, 1, 10));
}

function isInputPasswordValid(input) {
	return (validateAlphaNumericSpecial(input, 8, 50));
}

function validateAlphaNumeric(str, minLength, maxLength) {
  if (typeof str !== 'string') {
		return false;
	}

  if (str.length < minLength || str.length > maxLength) {
		return false; // 길이 검증
	}

  return (/^[A-Za-z0-9]+$/.test(str));
}

function validateAlphaNumericSpecial(str, minLength, maxLength) {
	if (typeof str !== 'string') {
	  return false;
	}
  
	if (str.length < minLength || str.length > maxLength) {
	  return false; // 길이 검증
	}
  
	// 영어, 숫자, 특수문자가 각각 최소 한 개 이상 있는지 검사
	if (!/[A-Za-z]/.test(str)) {
	  return false; // 영어 문자가 없음
	}
	
	if (!/[0-9]/.test(str)) {
	  return false; // 숫자가 없음
	}
	
	if (!/[^A-Za-z0-9]/.test(str)) {
	  return false; // 특수문자가 없음
	}
  
	return true;
}

export { isInputUsernameValid, isInputPasswordValid };