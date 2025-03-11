import requests

from django.conf import settings
from django.contrib.auth import get_user_model

def get_oauth_token(code):
    token_data = {
        'grant_type': 'authorization_code',
        'code': code,
        'client_id': settings.OAUTH2_CLIENT_ID,
        'client_secret': settings.OAUTH2_CLIENT_SECRET,
        'redirect_uri': settings.OAUTH2_REDIRECT_URI,
    }

    # app (post) -> 42intra -> oauth server (to get access token)
    # oauth server -> 42intra -> app (access token)
    response = requests.post(settings.OAUTH2_TOKEN_URL, data=token_data)

    if response.status_code != 200:
        return None

    return response.json().get('access_token')

def get_user_info(access_token):
    user_info_response = requests.get(settings.OAUTH2_API_URL, headers={
        'Authorization': f'Bearer {access_token}'
    })

    if user_info_response.status_code != 200:
        return None

    return user_info_response.json()

def get_or_create_user(email, username):
    user = get_user_model().objects.filter(email=email).first()
    
    # 42 email을 사용하는 계정 없을때 (새로운 42 회원 생성)
    if user is None:
        # 1. username 이미 존재
        if get_user_model().objects.filter(username=username).exists():
            return None
        
        user = get_user_model().objects.create(username=username, email=email)
        user.set_unusable_password()
        user.is_active = True
        user.save()
    else:
        if user.has_usable_password() == True:     # 42intra 계정이 아닌 경우
            return None

    return user
