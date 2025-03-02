from django.conf import settings
from django.http import JsonResponse, HttpRequest
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST, require_GET
import urllib.parse
from django.shortcuts import redirect
from django.contrib.auth import get_user_model
from authentication.views import generate_jwt, jwt_required
from .utils import get_oauth_token, get_user_info, get_or_create_user
from friends.views import update_last_activate

#app -> 42intra login
@csrf_exempt
@require_GET
def oauth_signin(request: HttpRequest):
    
    auth_url = settings.OAUTH2_AUTHORIZATION_URL
    params = {
        'client_id': settings.OAUTH2_CLIENT_ID,
        'redirect_uri': settings.OAUTH2_REDIRECT_URI,
        'response_type': 'code',
        'scope': 'public',  
    }
    
	# redirect to 42intra login page
    url = f"{auth_url}?{urllib.parse.urlencode(params)}"
    return JsonResponse({
        "redirect_url" : url
    })

import json

# 42intra -> app
@require_POST
@csrf_exempt
def oauth_callback(request):
    data = json.loads(request.body)
    code = data.get('code')

    if not code:
        return JsonResponse({'error': 'No code provided'}, status=400)

    # get access token from oauth server
    access_token = get_oauth_token(code)
    if not access_token:
        return JsonResponse({'error': 'Failed to get token'}, status=400)

    user_info = get_user_info(access_token)
    if not user_info:
        return JsonResponse({'error': 'Failed to fetch user info'}, status=400)

    email = user_info.get('email')
    username = user_info.get('login')

    user = get_or_create_user(email, username)
    token = generate_jwt(user, 2)
    
    return JsonResponse({'message': 'User created successfully', 'token': token}, status=201)
