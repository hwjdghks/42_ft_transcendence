from django.contrib.auth import get_user_model
from django.db import models

User = get_user_model()

class Friend(models.Model):
    follower = models.ForeignKey(User, on_delete=models.CASCADE, related_name='followers')
    following = models.ForeignKey(User, on_delete=models.CASCADE, related_name='followings')
    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['follower', 'following'], name='unique_follow')
        ]

class OnlineList(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    last_activate = models.DateTimeField(auto_now=True)
