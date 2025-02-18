import datetime
import jwt

from functools import wraps

from django.conf import settings
from django.http import JsonResponse, HttpRequest

from users.models import User

def generate_jwt(user: User):
    payload = {
        'id': user.id,
        'exp': datetime.datetime.now() + settings.JWT_EXPIRATION_DELTA,  # 만료 시간
        'iat': datetime.datetime.now()  # 발급 시간
    }
    token = jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return token

def jwt_required(view_func):
    @wraps(view_func)
    def wrapper(request: HttpRequest, *args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': '토큰이 필요합니다.'}, status=401)

        token = auth_header.split(' ')[1]
        try:
            payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
            request.user = User.objects.get(id=payload['id'])
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
