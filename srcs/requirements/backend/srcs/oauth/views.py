import json
import urllib.parse

from django.conf import settings
from django.http import HttpRequest, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET, require_POST

from authentication.views import generate_jwt, set_jwt_cookie
from .utils import get_oauth_token, get_user_info, get_or_create_user

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
    return JsonResponse({"redirect_url" : url})

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
    if not user:
        return JsonResponse({'error': 'User already exists'}, status=400)
    
    token = generate_jwt(user, 2)
    response = JsonResponse({'message': 'User created successfully'}, status=201)
    set_jwt_cookie(response, token, 'jwt')
    return response