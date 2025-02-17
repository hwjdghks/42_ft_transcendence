import json

from django.http import JsonResponse
from django.http import HttpRequest
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET, require_POST
from django.contrib.auth import authenticate

from authentication.views import generate_jwt, jwt_required
from .models import User

@csrf_exempt
@require_POST
def signup(request: HttpRequest) -> JsonResponse:
    data = json.loads(request.body)
    email = data.get('email')
    username = data.get('username')
    password = data.get('password')

    if not email or not password:
        return JsonResponse({'error': 'Email and password are required'}, status=400)

    if User.objects.filter(email=email).exists():
        return JsonResponse({'error': 'Email already in use'}, status=400)

    user = User.objects.create_user(username=username, email=email, password=password)
    user.save()
    return JsonResponse({'message': 'User created successfully'}, status=201)

@csrf_exempt
@require_POST
def signin(request: HttpRequest) -> JsonResponse:
    data = json.loads(request.body)
    email = data.get('email')
    password = data.get('password')

    user = authenticate(email=email, password=password)
    if user is not None:
        login(request, user)
        return JsonResponse({'message': 'Signed in successfully', 'username': user.username}, status=200)
    return JsonResponse({'error': 'Invalid credentials'}, status=400)

@csrf_exempt
@require_POST
@jwt_required
def signout(request: HttpRequest) -> JsonResponse:
    return JsonResponse({'message': 'Signed out successfully'}, status=200)

@csrf_exempt
@require_POST
@jwt_required
def withdraw(request: HttpRequest) -> JsonResponse:
    if request.user.is_authenticated:
        request.user.delete()
        return JsonResponse({'message': 'User deleted successfully'}, status=200)
    return JsonResponse({'error': 'User not authenticated'}, status=401)

@csrf_exempt
@require_POST
@jwt_required
def upload_profile_image(request: HttpRequest) -> JsonResponse:
    user: User = request.user
    image = request.FILES.get('profile_image')
    if image:
        user.profile_image = image
        user.save()
        return JsonResponse({'message': 'Profile image uploaded successfully'}, status=200)
    return JsonResponse({'error': 'No profile image provided'}, status=400)

@require_GET
@jwt_required
def get_profile(request: HttpRequest) -> JsonResponse:
    user: User = request.user
    profile = {
        'email': user.email,
        'username': user.username,
        'profile_image': user.profile_image.url if user.profile_image else None
    }
    return JsonResponse(profile, status=200)
