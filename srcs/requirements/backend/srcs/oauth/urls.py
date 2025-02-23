from django.urls import path
from .views import oauth_signin, oauth_callback, test

urlpatterns = [
    path('oauth/signin/', oauth_signin, name='oauth_signin'),
    path('oauth/oauth-callback/', oauth_callback, name='oauth_callback'),
    path('test/', test, name='test'),
]