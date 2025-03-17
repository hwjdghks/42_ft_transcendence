import json
import pytz
import re

from django.http import HttpRequest, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET, require_POST

from authentication.views import jwt_required
from friends.views import update_last_activate
from users.models import User
from .models import MatchResult

@require_GET
@jwt_required(expected_factor_level=2)
@update_last_activate
def results(request: HttpRequest) -> JsonResponse:
    user: User = request.user

    match_results = list(
        MatchResult.objects.filter(email=user).values(
            'username', 'guestname', 'user_score', 'guest_score', 'game_result', 'match_date'
        )
    )

    seoul_tz = pytz.timezone('Asia/Seoul')

    profile_image_url = user.profile_image.url if user.profile_image else None

    # match_date를 한국 시간으로 변환하여 문자열로 포맷팅
    for result in match_results:
        if result['match_date']:
            local_dt = result['match_date'].astimezone(seoul_tz)
            result['match_date'] = local_dt.strftime("%Y-%m-%d %H:%M:%S")
        result['profile_image_url'] = profile_image_url

    return JsonResponse({'match_results': match_results}, status=200)

@csrf_exempt
@require_POST
@jwt_required(expected_factor_level=2)
@update_last_activate
def add(request: HttpRequest) -> JsonResponse:
    user: User = request.user

    try:
        data = json.loads(request.body)

        email = user.email
        username = user.username
        guestname = data.get('guestname')
        user_score = data.get('user_score')
        guest_score = data.get('guest_score')
        game_result = data.get('game_result')
        
        if len(username) > 10 or len(guestname) > 10:
            return JsonResponse({'error': '이름은 10글자 이하여야합니다.'}, status=400)

        if not re.fullmatch(r'[0-9a-zA-Z]+', username) or not re.fullmatch(r'[0-9a-zA-Z]+', guestname):
            return JsonResponse({'error': '이름은 알파벳과 숫자로만 이루어져야 합니다.'}, status=400)

        if not all([user_score is not None, guest_score is not None, guestname is not None, game_result]):
            return JsonResponse({'error': 'Missing required fields'}, status=400)

        match_result = MatchResult.objects.create(
            email=user,
            guestname=guestname,
            user_score=user_score,
            guest_score=guest_score,
            game_result=game_result,
            username = username
        )

        return JsonResponse({'message': 'Match result saved successfully'}, status=201)

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON format'}, status=400)

    except Exception as e:
        return JsonResponse({'error': f'Internal Server Error: {str(e)}'}, status=500)
