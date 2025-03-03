from django.urls import path

from .views import signup, signin, signout, withdraw, upload_profile_image, get_profile, update_username, update_password, get_name, update_user_settings

urlpatterns = [
    path('signup/', signup, name='signup'),
    path('signin/', signin, name='signin'),
    path('signout/', signout, name='signout'),
    path('withdraw/', withdraw, name='withdraw'),
    path('upload/', upload_profile_image, name='upload'),
    path('profile/', get_profile, name='profile'),
    path('name/', get_name, name='name'),
    path('update/username/', update_username, name='update_username'),
    path('update/password/', update_password, name='update_password'),
	path('update/settings/', update_user_settings, name='update_user_settings'),
]