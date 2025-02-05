# serializers.py
from rest_framework import serializers
from .models import User, MatchResult

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['email', 'username', 'password', 'profileImage', 'language']

class MatchResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = MatchResult
        fields = ['auto_index', 'user', 'guestname', 'user_score', 'guest_score', 'game_result', 'match_date']

