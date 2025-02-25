import json
from functools import wraps
from datetime import timedelta

from django.http import HttpRequest, JsonResponse
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET, require_POST

from .models import Friend, OnlineList
from authentication.views import jwt_required
from .views import update_last_activate

User = get_user_model()

@require_GET
@jwt_required
@update_last_activate
def friend_list(request: HttpRequest) -> JsonResponse:
    user = request.user
    list = Friend.objects.filter(follower=user)
    result = []
    for friend in list:
        now = friend.following
        result.append({
            'username': now.username,
            'profile_image': now.profile_image.url if now.profile_image else None
        })
    return JsonResponse({'results': result}, status=200)

@require_GET
@jwt_required
@update_last_activate
def search_users(request: HttpRequest) -> JsonResponse:
    data = json.loads(request.body)
    query = data.get('search_query', '')

    users = User.objects.filter(username__icontains=query)

    result = []
    for user in users:
        result.append({
            'username': user.username,
            'profile_image': user.profile_image.url if user.profile_image else None
        })
    return JsonResponse({'results': result}, status=200)

@csrf_exempt
@require_POST
@jwt_required
@update_last_activate
def add_friend(request: HttpRequest) -> JsonResponse:
    user = request.user
    data = json.loads(request.body)
    friendname = data.get('friendname')

    if not friendname:
        return JsonResponse({'error': 'Friendname is required'}, status=400)

    try:
        friend = User.objects.get(username=friendname)
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)

    if Friend.objects.filter(follower=user, following=friend).exists():
        return JsonResponse({'error': '이미 친구입니다.'}, status=400)

    Friend.objects.create(follower=user, following=friend)
    return JsonResponse({'message': '친구 추가 성공'}, status=201)

@csrf_exempt
@require_POST
@jwt_required
@update_last_activate
def delete_friend(request: HttpRequest) -> JsonResponse:
    user = request.user
    data = json.loads(request.body)
    friendname = data.get('friendname')
    if not friendname:
        return JsonResponse({'error': 'Friendname is required'}, status=400)

    try:
        friend = User.objects.get(username=friendname)
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)

    friend = Friend.objects.filter(follower=user, following=friend).first()
    if not friend:
        return JsonResponse({'error': '친구 관계가 존재하지 않습니다.'}, status=400)

    friend.delete()
    return JsonResponse({'message': '친구 삭제 성공'}, status=200)

@require_GET
@jwt_required(expected_factor_level=2)
@update_last_activate
def get_online(request: HttpRequest) -> JsonResponse:
    user = request.user
    following = Friend.objects.filter(follower=user)

    now = timezone.now()
    cutoff_time = now - timedelta(minutes=30)

    following_users = [f.following for f in following]
    online_users = set(
        OnlineList.objects.filter(
            user__in=following_users,
            last_activate__gte=cutoff_time
            ).values_list('user_id', flat=True))

    result = []
    for u in following_users:
        is_online = u.id in online_users
        result.append({"username": u.username, "is_online": is_online})
    return JsonResponse({'results': result}, status=200)

def update_last_activate(func):
    @wraps(func)
    def wrapper(request, *args, **kwargs):
        response = func(request, *args, **kwargs)
        if isinstance(response, JsonResponse) and 200 <= response.status_code < 300:
            user_id = request.user.id
            OnlineList.objects.update_or_create(user_id=user_id)

        return response
    return wrapper
