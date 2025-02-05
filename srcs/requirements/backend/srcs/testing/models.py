from django.db import models
from django.core.validators import MinValueValidator
import os

# Create your models here.
class TestModel(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()

    def __str__(self):
        return self.name
    

from django.db import models
from django.contrib.auth.hashers import make_password, check_password
    
class User(models.Model):
    email = models.CharField(max_length=30, primary_key=True)
    username = models.CharField(max_length=20, unique=True)
    password = models.CharField(max_length=20)
    profileImage = models.ImageField(upload_to='profile_images/', null=True, blank=True)
    language = models.CharField(max_length=20)

    class Meta:
        db_table = 'user'  # 실제 테이블 이름을 'user'로 명시적 지정

class MatchResult(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='match_results')
    guestname = models.CharField(max_length=20)
    user_score = models.IntegerField(default=0, validators=[MinValueValidator(0)]) # 기본값을 0으로 지정 및 최소값을 0으로 지정
    guest_score = models.IntegerField(default=0, validators=[MinValueValidator(0)])# 기본값을 0으로 지정 및 최소값을 0으로 지정
    match_date = models.DateTimeField(auto_now_add=True)
    game_result = models.CharField(max_length=5, choices=[('win', 'Win'), ('lose', 'Lose'), ('draw', 'Draw')])
    auto_index = models.AutoField(primary_key=True)  # 자동 인덱스
    
    class Meta:
        db_table = 'matchresult'  # 실제 테이블 이름을 'matchresult'로 명시적 지정
        ordering = ['-auto_index']  # 기본 내림차순 정렬 (최신 데이터 우선)
        
# user.match_results.all()을 호출하면 해당 사용자의 모든 MatchResult 데이터를 가져올 수 있음.

# from django.db import models