import datetime
import jwt
import pyotp
import json
import pytz

from functools import wraps
from django.conf import settings
from django.http import JsonResponse, HttpRequest
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from users.models import User
from .models import UserOTP
from django.core.mail import send_mail
from django.utils import timezone
from friends.views import update_last_activate

def generate_jwt(user: User, factor_levela):
    payload = {
        'id': user.email,
        'exp': datetime.datetime.now() + settings.JWT_EXPIRATION_DELTA,  # 만료 시간
        'iat': datetime.datetime.now(),  # 발급 시간
        'fa' : factor_levela
    }
    token = jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return token

def jwt_required(*, expected_factor_level: int):
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request: HttpRequest, *args, **kwargs):
            auth_header = request.headers.get('Authorization')
            if not auth_header or not auth_header.startswith('Bearer '):
                return JsonResponse({'error': '토큰이 필요합니다.'}, status=401)

            token = auth_header.split(' ')[1]
            try:
                payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
                request.user = User.objects.get(email=payload['id'])

                if payload.get('fa') != expected_factor_level:
                    return JsonResponse({'error': '인증 단계가 올바르지 않습니다.'}, status=401)
            except jwt.ExpiredSignatureError:
                return JsonResponse({'error': '토큰이 만료되었습니다.'}, status=401)
            except jwt.DecodeError:
                return JsonResponse({'error': '토큰을 디코딩할 수 없습니다.'}, status=401)
            except jwt.InvalidTokenError:
                return JsonResponse({'error': '유효하지 않은 토큰입니다.'}, status=401)
            except User.DoesNotExist:
                return JsonResponse({'error': '사용자를 찾을 수 없습니다.'}, status=401)
            except Exception as e:
                return JsonResponse({'error': '서버 에러 발생', 'detail': e}, status=500)

            return view_func(request, *args, **kwargs)
        return wrapper
    return decorator


def refresh_otp(user_otp):
	user_otp.secret = pyotp.random_base32()
	user_otp.save()

def generate_otp(user_otp, interval=180):
	totp = pyotp.TOTP(user_otp.secret, interval=interval)
	return totp.now()

def verify_otp(user_otp, otp_code, interval=180):
	totp = pyotp.TOTP(user_otp.secret, interval=interval)
	if totp.verify(otp_code):
		refresh_otp(user_otp)
		return True
	else:
		return False

def send_otp_email(user):
    user_otp, created = UserOTP.objects.get_or_create(user=user)
    refresh_otp(user_otp)
    otp = generate_otp(user_otp)
    seoul_tz = pytz.timezone('Asia/Seoul') # 메일에 알려줄 otp 만료시간 타임존 설정정
    expires_at = timezone.localtime(user_otp.expires_at, seoul_tz)
    send_mail(
        "Your 2FA Code", # 메일제목
        f"Your One-Time Password (OTP) is: {otp}\nThis code will expire at {expires_at.strftime('%Y-%m-%d %H:%M:%S')}.", # 메일 본문
        settings.EMAIL_HOST_USER,
        [user.email],
        fail_silently=False,
    )

@csrf_exempt
@require_POST
@jwt_required(expected_factor_level=1)
def send_signup_2fa(request: HttpRequest) -> JsonResponse:
    user: User = request.user
    if User.objects.filter(email=user.email, is_active=True).exists():
        return JsonResponse({'error': 'Email already in signup'}, status=400)
    
    try:
        send_otp_email(user)
    except Exception as e:
        return JsonResponse({'error': 'Failed to send OTP email'}, status=500)
    return JsonResponse({'message': 'OTP email sent successfully'}, status=200)
      
@csrf_exempt
@require_POST
@jwt_required(expected_factor_level=1)
def send_signin_2fa(request: HttpRequest) -> JsonResponse:
	user: User = request.user
    
	if User.objects.filter(email=user.email, is_active=False).exists():
		return JsonResponse({'error': 'Users who are not two-factor authentication'}, status=400)
	try:
		send_otp_email(user)
	except Exception as e:
		return JsonResponse({'error': 'Failed to send OTP email'}, status=500)
	return JsonResponse({'message': 'email send your email in successfully'}, status=200)

@csrf_exempt
@require_POST
@jwt_required(expected_factor_level=1)
@update_last_activate
def check_signup_2fa(request: HttpRequest) -> JsonResponse:
	user: User = request.user
	data = json.loads(request.body)
	otp_code = data.get('otp')

	if User.objects.filter(email=user.email, is_active=True).exists():
		return JsonResponse({'error': 'Email already in signup'}, status=400)
	try:
		user_otp = user.otp
	except UserOTP.DoesNotExist:
		return JsonResponse({'error': 'otp 생성이 이루어지지 않았습니다.'}, status=401)

	if (verify_otp(user_otp, otp_code) == False):
		return JsonResponse({'error': '유효하지 않거나 만료된 OTP입니다.'}, status=401)
	user.is_active = True
	user.save()
	token = generate_jwt(user, 2)
	return JsonResponse({'message': 'User created successfully', 'token': token}, status=201)

@csrf_exempt
@require_POST
@jwt_required(expected_factor_level=1)
@update_last_activate
def check_signin_2fa(request: HttpRequest) -> JsonResponse:
    user: User = request.user
    data = json.loads(request.body)
    otp_code = data.get('otp')

    if User.objects.filter(email=user.email, is_active=False).exists():
        return JsonResponse({'error': 'Users who are not two-factor authentication'}, status=400)
    try:
        user_otp = user.otp
    except UserOTP.DoesNotExist:
        return JsonResponse({'error': 'otp 생성이 이루어지지 않았습니다.'}, status=401)
    if (verify_otp(user_otp, otp_code) == False):
        return JsonResponse({'error': '유효하지 않거나 만료된 OTP입니다.'}, status=401)
    token = generate_jwt(user, 2)
    return JsonResponse({'message': 'Signed in successfully', 'token': token}, status=200)
