import datetime
import re

from typing import Optional

from django.http import JsonResponse
from django.utils import timezone

from authentication.models import UserOTP

def check_existing_user(user, field: str) -> Optional[JsonResponse]:
    """
    기존사용자가 존재하면 에러반환
    단 사용자가 is_active가 false이고 otp가 발송된지 30분이 경과하였을 경우 삭제
    """
    if user:
        if user.is_active:
            return JsonResponse({'error': f'{field} already in use'}, status=400)
        else:
            try:
                user_otp = user.otp
                if user_otp.login_updated_at + datetime.timedelta(minutes=30) < timezone.now():
                    user.delete()
                else:
                    return JsonResponse({'error': f'{field} already in use'}, status=400)
            except UserOTP.DoesNotExist:
                user.delete()
    return None

# 비밀번호 조건: 8~50자, 영어 대소문자, 숫자, 특수문자 각각 최소 하나
def is_valid_password(password: str) -> bool:
    
    password_pattern = re.compile(r'^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,50}$')
    return bool(password_pattern.match(password))

def handle_invalid_password(user, current_password, new_password):
    
    if not user.has_usable_password():
        return JsonResponse({
            'error': '42계정의 비밀번호를 변경할 수 없습니다.'
        }, status=400)

    if not user.check_password(current_password):
        return JsonResponse({
            'error': '현재 비밀번호가 틀렸습니다.'
        }, status=400)
    
    if not new_password or not new_password.strip():
        return JsonResponse({
            'error': '비밀번호는 공백일 수 없습니다.'
        }, status=400)

    if user.check_password(new_password):
        return JsonResponse({
            'error': '기존 비밀번호와 같은 비밀번호로 변경할 수 없습니다.'
        }, status=400)

    if not is_valid_password(new_password):
        return JsonResponse({
            'error': 'The password must be between 8 and 50 characters long, and it must include at least one uppercase letter, one lowercase letter, one number, and one special character.'
        }, status=400)
    
    return None
