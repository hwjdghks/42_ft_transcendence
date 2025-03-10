from django.urls import path

from .views import (
    check_cookie,
    check_signin_2fa,
    check_signup_2fa,
    send_signin_2fa,
    send_signup_2fa,
    send_withdraw_2fa,
    remove_cookie,
)

urlpatterns = [
    path('2fa/signup/request/', send_signup_2fa, name='send_signup_2fa'),
	path('2fa/signin/request/', send_signin_2fa, name='send_signin_2fa'),
	path('2fa/withdraw/request/', send_withdraw_2fa, name='send_withdraw_2fa'),
	path('2fa/signup/verify/', check_signup_2fa, name='check_signup_2fa'),
	path('2fa/signin/verify/', check_signin_2fa, name='check_signin_2fa'),
    path('check_cookie/', check_cookie, name='check_cookie'),
    path('remove_cookie/', remove_cookie, name='remove_cookie'),
]
