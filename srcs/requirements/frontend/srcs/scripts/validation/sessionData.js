import { isInputUsernameValid } from "./inputData.js"
import { getProfileData } from "../api/scriptApi.js"
import { resetTournamentSession } from '../pages/game/tournament.js'

// 플레이어리스트 검증 함수
async function isSessionPlayerListValid() {
  // console.log('Session storage: playerList 검증 시도');

  try {
    const playerList = getSessionData('playerList');
    if (!playerList) {
      console.warn('세션에 playerList 데이터가 없습니다.');
      return false;
    }

    // API에서 프로필 데이터 가져오기
    let profileData;
    try {
      profileData = await getProfileData();
    } catch (error) {
      // console.error('프로필 데이터를 가져오는 데 실패했습니다:', error.message);
      return false;
    }

    if (!profileData || !profileData.username) {
      // console.error('프로필 데이터가 비어 있거나 username이 없습니다.');
      return false;
    }

    // 첫 번째 플레이어 이름이 API에서 가져온 username과 일치하는지 확인
    if (playerList[0] !== profileData.username) {
      // console.warn(`playerList[0](${playerList[0]})와 프로필의 username(${profileData.username})이 일치하지 않습니다.`);
      return false;
    }

    // playerList의 각 이름이 유효한지 검사 (영어/숫자 1~10글자)
    for (const name of playerList) {
      if (!isInputUsernameValid(name)) {
        // console.warn(`플레이어 이름이 유효하지 않음: ${name}`);
        return false;
      }
    }
    return true;
  } catch (error) {
    return false;
  }
}


// 게임 옵션 객체를 검증하는 함수
function isSessionGameOptionsValid() {
  // console.log('Session storage: game_option 검증 시도');
  const gameOption = getSessionData('game_option');
  if (!gameOption) {
    return false;
  }

	const validPlayers = [2, 4, 8];
  const validPaddleSize = [1, 1.2, 1.5];
	const validBallSpeeds = [1, 1.5, 2.0];
	const validObstacles = [0, 1, 2];

  if (!gameOption || typeof gameOption !== 'object') {
    return false;
  }

	if (!validPlayers.includes(gameOption.players) ||
			!validPaddleSize.includes(gameOption.paddleSize) ||
			!validBallSpeeds.includes(gameOption.ballSpeed) ||
			!validObstacles.includes(gameOption.obstacles)) {
		return false;
	}
  return true;
}

// currentMatch 객체 검증 함수
function isSessionCurrentMatchValid() {
  // console.log('Session storage: currentMatch 검증 시도');
  const currentMatch = getSessionData('currentMatch');
  if (!currentMatch) return false;

  // 객체 존재 여부 확인
  if (typeof currentMatch !== 'object' || currentMatch === null) return false;

  // 필수 키 존재 여부 확인
  const requiredKeys = ["player1", "player2", "winner", "score", "id"];
  for (const key of requiredKeys) {
    if (!(key in currentMatch)) return false;
  }

  // player1, player2: isInputUsernameValid 함수로 검증 (빈값, 형식 검사)
  if (!isInputUsernameValid(currentMatch.player1) || !isInputUsernameValid(currentMatch.player2)) return false;

  // winner: null이거나 유효한 username이어야 함
  if (currentMatch.winner !== null && !isInputUsernameValid(currentMatch.winner)) return false;

  // score: null이거나 { player1: number, player2: number } 형태여야 함
  if (currentMatch.score !== null) {
    if (typeof currentMatch.score !== 'object') return false;
    if (!("player1" in currentMatch.score) || !("player2" in currentMatch.score)) return false;
    if (typeof currentMatch.score.player1 !== 'number' || typeof currentMatch.score.player2 !== 'number') return false;
  }

  return true;
}

// match 배열의 각 요소(매치 아이템) 검증 함수
function isSessionMatchItemValid(item) {
  if (typeof item !== 'object' || item === null) return false;

  const requiredKeys = ["player1", "player2", "winner", "score"];
  for (const key of requiredKeys) {
    if (!(key in item)) return false;
  }

  // player1, player2 값 검증
  if (!isInputUsernameValid(item.player1) || !isInputUsernameValid(item.player2)) return false;

  // winner: null이거나 유효한 username이어야 함
  if (item.winner !== null && !isInputUsernameValid(item.winner)) return false;
  
  // score: null이거나 { player1: number, player2: number } 형태여야 함
  if (item.score !== null) {
    if (typeof item.score !== 'object') return false;
    if (!("player1" in item.score) || !("player2" in item.score)) return false;
    if (typeof item.score.player1 !== 'number' || typeof item.score.player2 !== 'number') return false;
  }

  return true;
}
  
// match 배열 전체 검증 함수
function isSessionMatchArrayValid() {
  // console.log('Session storage: matchArray 검증 시도');
  const matchArray = getSessionData('matches');
  if (!matchArray) return false;

  if (!Array.isArray(matchArray)) return false;
  for (const item of matchArray) {
    if (!isSessionMatchItemValid(item)) return false;
  }
  return true;
}

function getSessionData(key) {
  const data = sessionStorage.getItem(key);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error parsing session data for ${key}:`, error);
    return null;
  }
}

export async function validateTournamentSession(isTournamentPage = false) {
  const validPlayerList = await isSessionPlayerListValid();
  const validGameOptions = isSessionGameOptionsValid();
  let validCurrentMatch = true;
  let validMatchArray = true;

  // 토너먼트 페이지이면 currentMatch와 matches는 아직 없을 수 있으므로 검사하지 않음
  if (!isTournamentPage) {
    validCurrentMatch = isSessionCurrentMatchValid();
    validMatchArray = isSessionMatchArrayValid();
  }

  if (!validPlayerList || !validGameOptions || !validCurrentMatch || !validMatchArray) {
    alert('There is a problem with the session data. Exit the tournament and go to the options page.');
    resetTournamentSession();
    window.location.hash = '#gameplay/option';
    return false;
  }
  return true;
}
