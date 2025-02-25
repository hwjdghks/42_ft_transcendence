import datetime

from django.http import JsonResponse
from django.utils import timezone
from typing import Optional

from  authentication.models import UserOTP


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
                if user_otp.updated_at + datetime.timedelta(minutes=30) < timezone.now():
                    user.delete()
                else:
                    return JsonResponse({'error': f'{field} already in use'}, status=400)
            except UserOTP.DoesNotExist:
                user.delete()
    return None
