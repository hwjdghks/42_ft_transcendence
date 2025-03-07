import datetime
import json
import jwt
import pyotp
import pytz
from functools import wraps

from django.conf import settings
from django.core.mail import send_mail
from django.http import HttpRequest, JsonResponse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

from users.models import User
from .models import UserOTP

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

def refresh_otp(user_otp, otp_type):
    if otp_type == 'login':
        user_otp.login_secret = pyotp.random_base32()
        user_otp.login_updated_at = timezone.now()
    elif otp_type == 'withdraw':
        user_otp.withdraw_secret = pyotp.random_base32()
        user_otp.withdraw_updated_at = timezone.now()
    else:
        raise ValueError("Invalid otp_type")
    user_otp.save()
    
def generate_otp(user_otp, otp_type, interval=180):
    if otp_type == 'login':
        totp = pyotp.TOTP(user_otp.login_secret, interval=interval)
    elif otp_type == 'withdraw':
        totp = pyotp.TOTP(user_otp.withdraw_secret, interval=interval)
    else:
        raise ValueError("Invalid otp_type")
    return totp.now()

def verify_otp(user_otp, otp_code, otp_type, interval=180):
    if otp_type == 'login':
        totp = pyotp.TOTP(user_otp.login_secret, interval=interval)
        expires_at = user_otp.login_updated_at + datetime.timedelta(minutes=3)
    elif otp_type == 'withdraw':
        totp = pyotp.TOTP(user_otp.withdraw_secret, interval=interval)
        expires_at = user_otp.withdraw_updated_at + datetime.timedelta(minutes=3)
    else:
        raise ValueError("Invalid otp_type")
    
    if totp.verify(otp_code, valid_window=1) and timezone.now() < expires_at:
        refresh_otp(user_otp, otp_type)
        return True
    else:
        return False

def send_otp_email(user, otp_type):
    user_otp, created = UserOTP.objects.get_or_create(user=user)
    refresh_otp(user_otp, otp_type)
    otp = generate_otp(user_otp, otp_type)
    
    # otp 만료시간 계산
    if otp_type == 'login':
        expires_at = user_otp.login_updated_at + datetime.timedelta(minutes=3)
    elif otp_type == 'withdraw':
        expires_at = user_otp.withdraw_updated_at + datetime.timedelta(minutes=3)
    else:
        raise ValueError("otp_type은 'login' 또는 'withdraw'여야 합니다.")
    
    seoul_tz = pytz.timezone('Asia/Seoul')
    expires_at_local = timezone.localtime(expires_at, seoul_tz)
    
    subject = "Your 2FA Code"
    message = (
        f"Your One-Time Password (OTP) is: {otp}\n"
        f"This code will expire at {expires_at_local.strftime('%Y-%m-%d %H:%M:%S')}."
    )
    send_mail(
        subject,
        message,
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
        send_otp_email(user, otp_type='login')
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
		send_otp_email(user, otp_type='login')
	except Exception as e:
		return JsonResponse({'error': 'Failed to send OTP email'}, status=500)
	return JsonResponse({'message': 'email send your email in successfully'}, status=200)

@csrf_exempt
@require_POST
@jwt_required(expected_factor_level=2)
def send_withdraw_2fa(request: HttpRequest) -> JsonResponse:
	user: User = request.user

	try:
		send_otp_email(user, otp_type='withdraw')
	except Exception as e:
		return JsonResponse({'error': 'Failed to send OTP email'}, status=500)
	return JsonResponse({'message': 'email send your email in successfully'}, status=200)

@csrf_exempt
@require_POST
@jwt_required(expected_factor_level=1)
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

	if (verify_otp(user_otp, otp_code, otp_type='login') == False):
		return JsonResponse({'error': '유효하지 않거나 만료된 OTP입니다.'}, status=401)
	user.is_active = True
	user.save()
	token = generate_jwt(user, 2)
	return JsonResponse({'message': 'User created successfully', 'token': token}, status=201)

@csrf_exempt
@require_POST
@jwt_required(expected_factor_level=1)
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
    if (verify_otp(user_otp, otp_code, otp_type='login') == False):
        return JsonResponse({'error': '유효하지 않거나 만료된 OTP입니다.'}, status=401)
    token = generate_jwt(user, 2)
    return JsonResponse({'message': 'Signed in successfully', 'token': token}, status=200)
