from django.conf import settings
from django.http import JsonResponse, HttpRequest
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST, require_GET
import urllib.parse
from django.shortcuts import redirect
import requests
from django.contrib.auth import get_user_model
from users.models import User
from authentication.views import generate_jwt, jwt_required

import logging
logger = logging.getLogger('django')

def test(request):
    return JsonResponse({'status': 'success'})

#app -> 42intra login
@csrf_exempt
# @require_GET
def oauth_signin(request: HttpRequest) -> JsonResponse:
    
    auth_url = settings.OAUTH2_AUTHORIZATION_URL
    params = {
        'client_id': settings.OAUTH2_CLIENT_ID,
        'redirect_uri': settings.OAUTH2_REDIRECT_URI,
        'response_type': 'code',
        'scope': 'public',  
    }
    
	# redirect to 42intra login page
    url = f"{auth_url}?{urllib.parse.urlencode(params)}"
    logger.info("this is oauth_signin end")
    return redirect(url)

# 42intra -> app
# @require_GET
def oauth_callback(request):
    logger.info("this is oauth_callback first")
    code = request.GET.get('code')

    if not code:
        return JsonResponse({'error': 'No code provided'}, status=400)

    token_data = {
        'grant_type': 'authorization_code',
        'code': code,
        'client_id': settings.OAUTH2_CLIENT_ID,
        'client_secret': settings.OAUTH2_CLIENT_SECRET,
        'redirect_uri': settings.OAUTH2_REDIRECT_URI,
    }

    logger.info("this is oauth_callback mid")
	# app (post) -> 42intra -> oauth server (to get access token)
    # oauth server -> 42intra -> app (access token)
    response = requests.post(settings.OAUTH2_TOKEN_URL, data=token_data)
    
    if response.status_code != 200:
        return JsonResponse({'error': 'Failed to get token'}, status=400)

    # get access token from oauth server
    access_token = response.json().get('access_token')

    if not access_token:
        return JsonResponse({'error': 'No access token'}, status=400)

    user_info_response = requests.get(settings.OAUTH2_API_URL, headers={
        'Authorization': f'Bearer {access_token}'
    })

    if user_info_response.status_code != 200:
        return JsonResponse({'error': 'Failed to fetch user info'}, status=400)

    user_info = user_info_response.json()

    email = user_info.get('email')
    username = user_info.get('login')
    password = 'temporary_password'
    # password 어떻게 처리할 지 고려해야 함

    user = get_user_model().objects.filter(email=email).first()

    if user is None:
        user = get_user_model().objects.create(username=username, email=email, password=password)
        # user.is_active = False
        user.is_active = True
        user.save()
    
    token = generate_jwt(user, 2)
    logger.info("this is oauth_callback end")
    
    return JsonResponse({'message': 'User created successfully', 'token': token}, status=201)