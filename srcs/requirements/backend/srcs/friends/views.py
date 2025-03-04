import json
from datetime import timedelta
from functools import wraps

from django.contrib.auth import get_user_model
from django.http import HttpRequest, JsonResponse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET, require_POST

from authentication.views import jwt_required
from .models import Friend, OnlineList

User = get_user_model()

def update_last_activate(func):
    @wraps(func)
    def wrapper(request, *args, **kwargs):
        response = func(request, *args, **kwargs)
        if isinstance(response, JsonResponse) and 200 <= response.status_code < 300:
            user_id = request.user.id
            OnlineList.objects.update_or_create(user_id=user_id)

        return response
    return wrapper

@require_GET
@jwt_required(expected_factor_level=2)
@update_last_activate
def friend_list(request: HttpRequest) -> JsonResponse:
    user = request.user
    list = Friend.objects.filter(follower=user)
    result = []
    for friend in list:
        now = friend.following
        profile_image = (
            now.profile_image.url
            if now.profile_image and now.share_profile_image
            else None
        )
        result.append({
            'username': now.username,
            'profile_image': profile_image
        })
    return JsonResponse({'results': result}, status=200)

@require_GET
@jwt_required(expected_factor_level=2)
@update_last_activate
def search_users(request: HttpRequest) -> JsonResponse:
    query = request.GET.get('search_query', '')
    users = User.objects.filter(username__icontains=query).exclude(id=request.user.id)
    result = []
    for user in users:
        if user.show_in_search:
            profile_image = (
                user.profile_image.url
                if user.profile_image and user.share_profile_image
                else None
            )
            result.append({
                'username': user.username,
                'profile_image': profile_image
            })
    return JsonResponse({'results': result}, status=200)


@csrf_exempt
@require_POST
@jwt_required(expected_factor_level=2)
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
@jwt_required(expected_factor_level=2)
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
        is_online = u.id in online_users if u.share_online_status else False
        result.append({"username": u.username, "is_online": is_online})
    return JsonResponse({'results': result}, status=200)
