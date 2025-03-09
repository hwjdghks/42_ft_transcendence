import { router } from './router.js'
import { updateModals } from './components/setting.js'

const trans = {
  en: {
    // Navbar
    navProfile: "Profile",
    navGamePlay: "Gameplay",

    // Login
    loginHeader: "ft_transcendence",
    loginEmail: "Email",
    loginEmailHolder: "Enter your e-mail",
    loginPassword: "Password",
    loginPasswordHolder: "Enter your password",
    loginBtn: "Submit",
    loginOauthBtn: "42 account",
    loginSingupBtn: "Sing up",

    // Verify
    verifyHeader: "Verify Code",
    verifyCode: "Verification Code",
    verifyCodeHolder: "Enter OTP code",
    verifyBtn : "Verify",

    // Signup
    signupHeader: "Sign Up",
    signupUsername: "Username",
    signupUsernameHolder: "Enter your username",
    signupEmail: "Email",
    signupEmailHolder: "Enter your e-mail",
    signupPassword: "Password",
    signupPasswordHolder: "Enter your password",
    signupConfirmPassword: "Confirm Password",
    signupConfirmPasswordHolder: "Confirm your password",
    signupSendBtn: "Send Code",
    signupLoginBtn: "Login",

    // Profile
    profileUpload: "Profile Upload",
    total: "Total",
    wins: "Wins",
    losses: "Losses",
    draws: "Draws",
    matchHistory: "Match History",
    friends: "Friends",
    setting: "Settings",
    logout: "Logout",

    // Profile Settings
    settingUsername: "Username",
    settingUsernameHolder: "Change Username",
    settingPassword: "Password",
    settingPasswordHolder: "Change Password",
    settingPrivacy: "Privacy",
    settingPrivacyHolder: "Set privacy options",
    settingLanguage: "Language",
    settingDeleteAccount: "Delete Account",
    settingMatchHistoryHolder: "Empty...",

    // Profile Settings Modal - Username
    settingModalUsername: "Change Username",
    settingModalNewUsername: "New Username",
    settingModalNewUsernameHolder: "Enter new username",
    settingModalUsernameSmall: "English and numbers only. (Maximum 10 characters)",

    // Profile Settings Modal - Privacy
    settingModalPrivacy: "Privacy Settings",
    settingModalPrivacy1: "Show in friend search",
    settingModalPrivacy2: "Share profile image",
    settingModalPrivacy3: "Share online status",

    // Profile Settings Modal - Password
    settingModalPassword: "Change Password",
    settingModalCurPassword: "Current Password",
    settingModalCurPasswordHolder: "Enter current password",
    settingModalNewPassword: "New Password",
    settingModalNewPasswordHolder: "Enter new password",
    settingModalConPassword: "Confirm New Password",
    settingModalConPasswordHolder: "Enter confirm password",
    settingModalPasswordSmall:
      "Must contain at least one number, one letter, and one special character (8-50 characters)",

    // Profile Settings Modal - Delete Account
    settingModalDelete: "Warning",
    settingModalDeleteBody: "OTP has been emailed to proceed with account withdrawal. Please enter the OTP code.",
    settingModalDeleteHolder: "Enter OTP code",
    settingModalBtn: "Delete Account",

    // Modal Buttons
    Cancel: "Cancel",
    Save: "Save",
    Next: "Next",

    // Alerts - Success
    successLogout: "You have been logged out successfully.",
    successChangePassword: "Password changed successfully.",

    // Alerts - Error
    errorUpdateProfile: "Failed to load profile information. Please try again later.",
    errorinitProfileUpload: "Failed to load profile information. Please try again later.",
    errorLogout: "Failed to log out. Please try again later.",
    errorChangePasswordDif: "Passwords do not match.",
    errorChangePassword: "Failed to update password",

    // Option
    optionHeader: "Game Options",
    optionRule: "Game Rule",
    optionRuleBody: "First to 7 points wins.<br>- Player 1: Press 'W' to move up, 'S' to move down.<br>- Player 2: Press 'I' to move up, 'K' to move down.",
    optionHeaderSmall:
      "English letters and numbers only, no duplicates. (Maximum 10 characters)",
    optionPlayers: "Player List",
    optionUserInputHeader: "Me",
    optionPlayersInputHeader: "Player",
    optionPlayersInputHolder: "Enter player name",
    optionPaddleSize: "Paddle Size",
    optionBallSpeed: "Ball Speed",
    optionObstacle: "Obstacle Number",

    errorDuplicateName: "Duplicate name.",
    errorEmptyName: "Please enter a name.",

    // Tournament
    tournamentHeader: "Tournament Bracket",
    tournamentMatch: "Match",
    tournamentTBD: "TBD",
    tournamentScore: "Score",
    tournamentWinner: "Winner",
    tournamentNextMatch: "Next Match",
    tournamentLastAlert: "🏆 The final winner:",

    // Game
    gameWin: "win!",
    gameBackBtn: "Back to tournament",
  },

  ko: {
    // Navbar
    navProfile: "프로필",
    navGamePlay: "게임 플레이",

    // Login
    loginHeader: "ft_transcendence",
    loginEmail: "이메일",
    loginEmailHolder: "이메일을 입력하세요",
    loginPassword: "비밀번호",
    loginPasswordHolder: "비밀번호를 입력하세요",
    loginBtn: "로그인",
    loginOauthBtn: "42 계정",
    loginSingupBtn: "회원가입",

    // Verify
    verifyHeader: "인증 코드",
    verifyCode: "인증 코드",
    verifyCodeHolder: "OTP 코드를 입력하세요",
    verifyBtn : "인증",

    // Signup
    signupHeader: "회원가입",
    signupUsername: "사용자명",
    signupUsernameHolder: "사용자명을 입력하세요",
    signupEmail: "이메일",
    signupEmailHolder: "이메일을 입력하세요",
    signupPassword: "비밀번호",
    signupPasswordHolder: "비밀번호를 입력하세요",
    signupConfirmPassword: "비밀번호 확인",
    signupConfirmPasswordHolder: "비밀번호를 확인하세요",
    signupSendBtn: "코드 전송",
    signupLoginBtn: "로그인",

    // Profile
    profileUpload: "프로필 업로드",
    total: "전체",
    wins: "승리",
    losses: "패배",
    draws: "무승부",
    matchHistory: "매치 기록",
    friends: "친구",
    setting: "설정",
    logout: "로그아웃",

    // Profile Settings
    settingUsername: "사용자 이름",
    settingUsernameHolder: "사용자 이름 변경",
    settingPassword: "비밀번호",
    settingPasswordHolder: "비밀번호 변경",
    settingPrivacy: "개인정보",
    settingPrivacyHolder: "개인정보 설정",
    settingLanguage: "언어",
    settingDeleteAccount: "계정 삭제",
    settingMatchHistoryHolder: "아직 전적이 없습니다...",

    // Profile Settings Modal - Username
    settingModalUsername: "사용자 이름 변경",
    settingModalNewUsername: "새 사용자 이름",
    settingModalNewUsernameHolder: "새 사용자 이름 입력",
    settingModalUsernameSmall: "영문 및 숫자만 사용 가능합니다. (최대 10자)",

    // Profile Settings Modal - Privacy
    settingModalPrivacy: "개인정보 설정",
    settingModalPrivacy1: "친구 검색에 표시",
    settingModalPrivacy2: "프로필 이미지 공유",
    settingModalPrivacy3: "온라인 상태 표시",

    // Profile Settings Modal - Password
    settingModalPassword: "비밀번호 변경",
    settingModalCurPassword: "현재 비밀번호",
    settingModalCurPasswordHolder: "현재 비밀번호 입력",
    settingModalNewPassword: "새 비밀번호",
    settingModalNewPasswordHolder: "새 비밀번호 입력",
    settingModalConPassword: "새 비밀번호 확인",
    settingModalConPasswordHolder: "새 비밀번호 확인 입력",
    settingModalPasswordSmall: "숫자, 영문, 특수문자 중 최소 하나씩 포함 (8~50자)",

    // Profile Settings Modal - Delete Account
    settingModalDelete: "경고",
    settingModalDeleteBody: "계정 탈퇴를 진행하기 위해 이메일로 OTP가 전송되었습니다. OTP 코드를 입력해주세요.",
    settingModalDeleteHolder: "OTP 코드 입력",
    settingModalBtn: "계정 삭제",

    // Modal Buttons
    Cancel: "취소",
    Save: "저장",
    Next: "다음",

    // Alerts - Success
    successLogout: "성공적으로 로그아웃되었습니다.",
    successChangePassword: "비밀번호가 성공적으로 변경되었습니다.",

    // Alerts - Error
    errorUpdateProfile: "프로필 정보를 불러오지 못했습니다. 나중에 다시 시도해주세요.",
    errorinitProfileUpload: "프로필 정보를 불러오지 못했습니다. 나중에 다시 시도해주세요.",
    errorLogout: "로그아웃에 실패했습니다. 나중에 다시 시도해주세요.",
    errorChangePasswordDif: "입력한 비밀번호가 일치하지 않습니다.",
    errorChangePassword: "비밀번호 업데이트에 실패했습니다.",

    // Option
    optionHeader: "게임 옵션",
    optionRule: "게임 규칙",
    optionRuleBody: "먼저 7점을 얻는 사람이 승리합니다.<br>- 플레이어 1: 'W' 키를 누르면 위로 이동, 'S' 키를 누르면 아래로 이동<br>- 플레이어 2: 'I' 키를 누르면 위로 이동, 'K' 키를 누르면 아래로 이동",
    optionHeaderSmall: "영문 및 숫자만 사용 가능, 중복 불가. (최대 10자)",
    optionPlayers: "플레이어 리스트",
    optionUserInputHeader: "나",
    optionPlayersInputHeader: "플레이어",
    optionPlayersInputHolder: "플레이어 이름 입력",
    optionPaddleSize: "패들 크기",
    optionBallSpeed: "공 속도",
    optionObstacle: "장애물 수",

    errorDuplicateName: "중복된 이름입니다.",
    errorEmptyName: "이름을 입력해주세요.",

    // Tournament
    tournamentHeader: "토너먼트 브래킷",
    tournamentMatch: "경기",
    tournamentTBD: "미정",
    tournamentScore: "점수",
    tournamentWinner: "우승자",
    tournamentNextMatch: "다음 경기",
    tournamentLastAlert: "🏆 최종 우승자:",

    // Game
    gameWin: "승리!",
    gameBackBtn: "토너먼트로 돌아가기",
  }
};

function changeLanguage(lang) {
  if (!trans[lang]) {
    console.warn("지정된 언어에 대한 번역이 없습니다:", lang);
    return;
  }
  localStorage.setItem("lang", lang);
  window.curLang = lang;

  router();
  updateNavbar();
  updateModals();
}

export { trans, changeLanguage };
