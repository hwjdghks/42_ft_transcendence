from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator
from django.db import models

User = get_user_model()

class MatchResult(models.Model):
    email = models.ForeignKey(User, on_delete=models.CASCADE, related_name='match_results')
    username = models.CharField(max_length=10)
    guestname = models.CharField(max_length=10)
    user_score = models.IntegerField(default=0, validators=[MinValueValidator(0)]) # 기본값을 0으로 지정 및 최소값을 0으로 지정
    guest_score = models.IntegerField(default=0, validators=[MinValueValidator(0)])# 기본값을 0으로 지정 및 최소값을 0으로 지정
    match_date = models.DateTimeField(auto_now_add=True)
    game_result = models.CharField(max_length=5, choices=[('win', 'Win'), ('lose', 'Lose')])

    class Meta:
        db_table = 'matchresult'  # 실제 테이블 이름을 'matchresult'로 명시적 지정
        ordering = ['-match_date']  # 기본 내림차순 정렬 (최신 데이터 우선)
