import { validateTournamentSession } from '../validation/sessionData.js';

async function postMatchResult(matchResultData) {
  const token = sessionStorage.getItem('fa_token');
  try {
    const valid = await validateTournamentSession();
    if (!valid) throw new Error('세션 데이터가 유효하지 않아 게임 결과를 전송할 수 없습니다.');

    const response = await fetch('https://localhost/api/match/add/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(matchResultData)
    });
    if (!response.ok) {
      const errorData = await response.json();
      console.error("매치 결과 전송 실패", errorData);
    } else {
      const data = await response.json();
      console.log("매치 결과 전송 성공", data);
    }
  } catch (err) {
    console.error("매치 결과 전송 중 에러 발생", err);
  }
}

export { postMatchResult };
