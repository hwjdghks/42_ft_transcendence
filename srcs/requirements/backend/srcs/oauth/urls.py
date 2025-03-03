from django.urls import path

from .views import oauth_callback, oauth_signin

urlpatterns = [
    path('42intra/signin/', oauth_signin, name='oauth_signin'),
    path('42intra/oauth-callback/', oauth_callback, name='oauth_callback'),
]
