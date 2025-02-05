from django.urls import path
from . import views
from .views import profile_data

from django.conf.urls.static import static
from django.conf import settings

urlpatterns = [
    path('get-test-data/', views.get_test_data, name='get-test-data'),
    path('add-test-data/', views.add_test_data, name='add-test-data'),
	path('profile/<str:email>/', profile_data, name='profile-data'),

	path('users/', views.UserListCreateAPIView.as_view(), name='user-list-create'), # db추가용
    path('matchresults/', views.MatchResultListCreateAPIView.as_view(), name='matchresult-list-create'),# db 추가용
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
