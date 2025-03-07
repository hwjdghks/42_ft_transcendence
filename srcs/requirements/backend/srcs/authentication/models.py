import datetime
import pyotp

from django.contrib.auth import get_user_model
from django.db import models
from django.utils import timezone

User = get_user_model()

class UserOTP(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='otp')
    
    login_secret = models.CharField(max_length=32, default=pyotp.random_base32, editable=False)
    login_updated_at = models.DateTimeField(default=timezone.now)

    withdraw_secret = models.CharField(max_length=32, default=pyotp.random_base32, editable=False)
    withdraw_updated_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"OTP for {self.user}"

    @property
    def get_expires_at(self, otp_type):
        delta = datetime.timedelta(minutes=3)
        if otp_type == 'login':
            return self.login_updated_at + delta
        elif otp_type == 'withdraw':
            return self.withdraw_updated_at + delta
        else:
            raise ValueError("Invalid otp_type")
