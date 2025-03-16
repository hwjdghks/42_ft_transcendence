import json
import re

from django.contrib.auth import authenticate
from django.http import HttpRequest, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET, require_POST

from authentication.views import generate_jwt, jwt_required, verify_otp, set_jwt_cookie
from friends.views import update_last_activate, set_offline
from matchresult.models import MatchResult
from .models import User
from .utils import check_existing_user, is_valid_password, handle_invalid_password

@csrf_exempt
@require_POST
def signup(request: HttpRequest) -> JsonResponse:
    data = json.loads(request.body)
    email = data.get('email')
    username = data.get('username')
    password = data.get('password')

    if not email or not password:
        return JsonResponse({'error': 'Email and password are required'}, status=400)
    
    if not is_valid_password(password):
        return JsonResponse({
            'error': 'The password must be between 8 and 50 characters long, and it must include at least one uppercase letter, one lowercase letter, one number, and one special character.'
        }, status=400)

    # 이메일 중복 검사 단 유저가 is_active가 false이고 otp를 발송한지 30분이 지난상태면 삭제
    response = check_existing_user(User.objects.filter(email=email).first(), "Email")
    if response:
        return response

    # 사용자명 중복 검사 단 유저가 is_active가 false이고 otp를 발송한지 30분이 지난상태면 삭제
    response = check_existing_user(User.objects.filter(username=username).first(), "Username")
    if response:
        return response
    
    if len(username) > 10:
        return JsonResponse({'error': '유저 이름은 10글자 이하여야합니다.'}, status=400)

    if not re.fullmatch(r'[0-9a-zA-Z]+', username):
        return JsonResponse({'error': '유저 이름은 알파벳과 숫자로만 이루어져야 합니다.'}, status=400)

    is_friend_enabled = data.get('is_friend_enabled', False)
    share_profile_image = data.get('share_profile_image', False)
    share_online_status = data.get('share_online_status', False)

    user = User.objects.create_user(username=username, email=email, password=password)
    user.is_active = False
    user.is_friend_enabled = is_friend_enabled
    user.share_profile_image = share_profile_image
    user.share_online_status = share_online_status
    user.save()
    token = generate_jwt(user, 1)
    response = JsonResponse({'message': 'User created successfully'}, status=201)
    set_jwt_cookie(response, token, 'temp')
    return response

@csrf_exempt
@require_POST
def signin(request: HttpRequest) -> JsonResponse:
    data = json.loads(request.body)
    email = data.get('email')
    password = data.get('password')

    is_old_user = User.objects.filter(email=email).first()
    if is_old_user and is_old_user.has_usable_password() == False:
        return JsonResponse({
            'error': '42 계정 이메일로 회원 가입된 사용자 입니다. 42 intra 계정으로 로그인 하세요.'
        }, status=400)

    user = authenticate(email=email, password=password)
    if user is not None:
        token = generate_jwt(user, 1)
        response = JsonResponse({'message': 'Signed in successfully'}, status=200)
        set_jwt_cookie(response, token, 'temp')
        return response

    return JsonResponse({'error': 'Invalid credentials'}, status=400)

@csrf_exempt
@require_POST
@jwt_required(expected_factor_level=2) # jwt (2fa) 필요
def signout(request: HttpRequest) -> JsonResponse:
    user = request.user
    set_offline(user)
    return JsonResponse({'message': 'Signed out successfully'}, status=200)

@csrf_exempt
@require_POST
@jwt_required(expected_factor_level=2)
def withdraw(request: HttpRequest) -> JsonResponse:
    user: User = request.user
    if not user.is_authenticated:
        return JsonResponse({'error': 'User not authenticated'}, status=401)
    data = json.loads(request.body)
    otp_code = data.get('otp')
    if not verify_otp(user.otp, otp_code, otp_type='withdraw'):
        return JsonResponse({'error': '유효하지 않거나 만료된 OTP입니다.'}, status=401)
    request.user.delete()
    return JsonResponse({'message': 'User deleted successfully'}, status=200)

@csrf_exempt
@require_POST
@jwt_required(expected_factor_level=2)
@update_last_activate
def upload_profile_image(request: HttpRequest) -> JsonResponse:
    user: User = request.user
    image = request.FILES.get('profile_image')
    if image:
        user.profile_image = image
        user.save()
        return JsonResponse({'message': 'Profile image uploaded successfully',
                             'profile_image_url': user.profile_image.url}, status=200)
    return JsonResponse({'error': 'No profile image provided'}, status=400)

@require_GET
@jwt_required(expected_factor_level=2)
@update_last_activate
def get_profile(request: HttpRequest) -> JsonResponse:
    user: User = request.user

    user_matches = MatchResult.objects.filter(email=user)
    total_games = user_matches.count()
    win = user_matches.filter(game_result='win').count()
    lose = user_matches.filter(game_result='lose').count()

    profile = {
        'email': user.email,
        'username': user.username,
        'profile_image': user.profile_image.url if user.profile_image else None,
        'total': total_games,
        'win': win,
        'lose': lose,
        'is_friend_enabled': user.is_friend_enabled,
        'share_online_status': user.share_online_status,
        'share_profile_image': user.share_profile_image
    }
    return JsonResponse(profile, status=200)

@csrf_exempt
@jwt_required(expected_factor_level=2)
def get_name(request: HttpRequest) -> JsonResponse:
    user: User = request.user

    username = {
        'username': user.username,
    }
    return JsonResponse(username, status=200)

@csrf_exempt
@require_POST
@jwt_required(expected_factor_level=2)
def update_username(request: HttpRequest) -> JsonResponse:
    user: User = request.user
    new_username = json.loads(request.body).get('new_username')

    if not new_username or not new_username.strip():
        return JsonResponse({
            'error': '유저 이름은 공백일 수 없습니다.'
        }, status=400)

    if len(new_username) > 10:
        return JsonResponse({'error': '유저 이름은 10글자 이하여야합니다.'}, status=400)

    if not re.fullmatch(r'[0-9a-zA-Z]+', new_username):
        return JsonResponse({'error': '유저 이름은 알파벳과 숫자로만 이루어져야 합니다.'}, status=400)

    old_username = user.username
    if old_username == new_username:
        return JsonResponse({
            'error': '기존 이름과 같은 이름으로 변경할 수 없습니다.'
        }, status=400)

    if User.objects.filter(username=new_username).exists():
        return JsonResponse({
            'error': '이미 존재하는 이름 입니다.'
        }, status=400)

    user.username = new_username
    user.save()

    return JsonResponse({'message': 'Usrename updated successfully'}, status=200)

@csrf_exempt
@require_POST
@jwt_required(expected_factor_level=2)
def update_password(request: HttpRequest) -> JsonResponse:
    user: User = request.user
    new_password = json.loads(request.body).get('new_password')
    current_password = json.loads(request.body).get('current_password')

    error_response = handle_invalid_password(user, current_password, new_password)
    if error_response:
        return error_response

    user.set_password(new_password)
    user.save()

    return JsonResponse({'message': 'password updated successfully'}, status=200)

@csrf_exempt
@require_POST
@jwt_required(expected_factor_level=2)
@update_last_activate
def update_user_settings(request: HttpRequest) -> JsonResponse:
    user = request.user
    data = json.loads(request.body)
    is_friend_enabled = data.get('is_friend_enabled')
    share_profile_image = data.get('share_profile_image')
    share_online_status = data.get('share_online_status')

    if is_friend_enabled is not None:
        user.is_friend_enabled = bool(is_friend_enabled)
    if share_profile_image is not None:
        user.share_profile_image = bool(share_profile_image)
    if share_online_status is not None:
        user.share_online_status = bool(share_online_status)
    user.save()
    return JsonResponse({'message': 'Settings updated successfully'}, status=200)
