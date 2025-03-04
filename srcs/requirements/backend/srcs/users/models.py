from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    email = models.EmailField(unique=True)
    profile_image = models.ImageField(upload_to='profile_images/', blank=True, null=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    show_in_search = models.BooleanField(default=False)         # 친구 검색 시 노출 여부
    share_profile_image = models.BooleanField(default=False)      # 프로필 사진 공유 여부
    share_online_status = models.BooleanField(default=False)      # 온라인 상태 공유 여부

    def __str__(self):
        return self.email
