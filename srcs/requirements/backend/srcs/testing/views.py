from django.shortcuts import render

from rest_framework import generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import ListCreateAPIView
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser

from rest_framework.generics import ListCreateAPIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404


from .serializers import UserSerializer

from .models import User, MatchResult
from .serializers import UserSerializer, MatchResultSerializer

# Create your views here.
from django.http import HttpResponse, JsonResponse
import json
from .models import TestModel
from django.views.decorators.csrf import csrf_exempt

from django.http import JsonResponse
from .models import User, MatchResult

# Create your views here.
from django.http import HttpResponse, JsonResponse
import json
from .models import TestModel
from django.views.decorators.csrf import csrf_exempt

def get_test_data(request):
    print('hello')
    data = TestModel.objects.all().values()
    return JsonResponse(list(data), safe=False)

@csrf_exempt # http용
def add_test_data(request):
    if request.method == "POST":
        data = json.loads(request.body)
        name = data.get("name")
        description = data.get("description")
        new_data = TestModel.objects.create(name=name, description=description)
        return JsonResponse({"message": "Data added successfully!", "id": new_data.id})
    
def profile_data(request, email): # 'test@example.com'현재 테스트 유저 이메일 하드코딩 되있음음
    try:
        # 이메일을 이용해 해당 사용자 찾기
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)

    # 해당 사용자의 매치 결과 데이터 가져오기
    match_results = list(
        MatchResult.objects.filter(user=user).values(
            'guestname', 'user_score', 'guest_score', 'game_result', 'match_date'
        )
    )

	# profileImage 필드를 URL로 변환 (없을 경우 None)
    profile_image_url = user.profileImage.url if user.profileImage else None

    data = {
        'email': user.email,
        'username': user.username,
        'profileImage': request.build_absolute_uri(profile_image_url),
        'language': user.language,
        'match_results': match_results,
    } # 데이터형식 frontend쪽에 필요한방향으로 수정 필요
    return JsonResponse(data)

class UserListCreateAPIView(ListCreateAPIView): # db에 유저 데이터 넣기위한 테스트 함수 drf사용된상태
    queryset = User.objects.all()  # 🔥 오류 해결: `queryset` 추가
    serializer_class = UserSerializer  # ✅ `serializer_class` 추가
    
	# 파일 업로드를 위한 parser 추가
    parser_classes = (MultiPartParser, FormParser)
    

    def post(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)  # 🔥 수정된 부분
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class MatchResultListCreateAPIView(ListCreateAPIView): # db에 대전전기록 데이터 넣기위한 테스트 함수 drf사용된상태
    serializer_class = MatchResultSerializer

    def get_queryset(self):
        """
        특정 유저의 대전 기록만 조회할 수 있도록 필터링
        예: /api/matchresults/?user=test@example.com
        """
        user_email = self.request.query_params.get('user')  # GET 요청에서 'user' 파라미터 가져오기
        if user_email:
            user = get_object_or_404(User, email=user_email)  # 유저가 존재하는지 확인
            return MatchResult.objects.filter(user=user)  # 해당 유저의 대전 기록만 반환
        return MatchResult.objects.all()  # 특정 유저를 지정하지 않으면 모든 매치 반환

    def post(self, request, *args, **kwargs):
        """
        새로운 MatchResult를 생성하는 POST 요청 처리
        """
        try:
            serializer = self.get_serializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)