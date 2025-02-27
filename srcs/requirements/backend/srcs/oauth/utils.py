import requests
from django.conf import settings

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

from django.contrib.auth import get_user_model

def get_or_create_user(email, username, password):
    user = get_user_model().objects.filter(email=email).first()

    if user is None:
        user = get_user_model().objects.create(username=username, email=email, password=password)
        user.is_active = True
        user.save()

    return user
