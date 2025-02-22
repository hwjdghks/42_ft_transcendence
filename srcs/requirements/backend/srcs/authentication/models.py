import datetime
import pyotp

from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class UserOTP(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='otp')
    secret = models.CharField(max_length=32, default=pyotp.random_base32, editable=False)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"OTP for {self.user}"
    
    @property
    def expires_at(self):
        return self.updated_at + datetime.timedelta(minutes=3)