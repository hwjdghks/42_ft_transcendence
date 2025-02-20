import json
import datetime

from django.http import JsonResponse
from django.http import HttpRequest
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET, require_POST
from django.contrib.auth import authenticate

from authentication.views import generate_jwt, jwt_required
from .models import User
from .utils import check_existing_user

@csrf_exempt
@require_POST
def signup(request: HttpRequest) -> JsonResponse:
    data = json.loads(request.body)
    email = data.get('email')
    username = data.get('username')
    password = data.get('password')

    if not email or not password:
        return JsonResponse({'error': 'Email and password are required'}, status=400)

    # 이메일 중복 검사 단 유저가 is_active가 false이고 otp를 발송한지 30분이 지난상태면 삭제
    response = check_existing_user(User.objects.filter(email=email).first(), "Email")
    if response:
        return response

    # 사용자명 중복 검사 단 유저가 is_active가 false이고 otp를 발송한지 30분이 지난상태면 삭제
    response = check_existing_user(User.objects.filter(username=username).first(), "Username")
    if response:
        return response

    user = User.objects.create_user(username=username, email=email, password=password)
    # user.is_active = False 원래 False로 해야되나 frontend mail인증기능 아직 미구현으로 True로 메일인증없이 넘어가게 임시조치
    user.is_active = True
    user.save()
    token = generate_jwt(user, 1)
    return JsonResponse({'message': 'User created successfully', 'token': token}, status=201)

@csrf_exempt
@require_POST
def signin(request: HttpRequest) -> JsonResponse:
    data = json.loads(request.body)
    email = data.get('email')
    password = data.get('password')

    user = authenticate(email=email, password=password)
    if user is not None:
        # token = generate_jwt(user, 1) // 원래 1fa -> 2fa 해야되나 frontend mail인증창 미구현으로 바로 2fa발급되게 조치
        token = generate_jwt(user, 2)
        return JsonResponse({'message': 'Signed in successfully', 'token': token}, status=200)
    return JsonResponse({'error': 'Invalid credentials'}, status=400)

@csrf_exempt
@require_POST
@jwt_required(expected_factor_level=2) # jwt (2fa) 필요
def signout(request: HttpRequest) -> JsonResponse:
    return JsonResponse({'message': 'Signed out successfully'}, status=200)

@csrf_exempt
@require_POST
@jwt_required(expected_factor_level=2)
def withdraw(request: HttpRequest) -> JsonResponse:
    if request.user.is_authenticated:
        request.user.delete()
        return JsonResponse({'message': 'User deleted successfully'}, status=200)
    return JsonResponse({'error': 'User not authenticated'}, status=401)

@csrf_exempt
@require_POST
@jwt_required(expected_factor_level=2)
def upload_profile_image(request: HttpRequest) -> JsonResponse:
    user: User = request.user
    image = request.FILES.get('profile_image')
    if image:
        user.profile_image = image
        user.save()
        return JsonResponse({'message': 'Profile image uploaded successfully'}, status=200)
    return JsonResponse({'error': 'No profile image provided'}, status=400)

@require_GET
@jwt_required(expected_factor_level=2)
def get_profile(request: HttpRequest) -> JsonResponse:
    user: User = request.user
    profile = {
        'email': user.email,
        'username': user.username,
        'profile_image': user.profile_image.url if user.profile_image else None
    }
    return JsonResponse(profile, status=200)
