from django.urls import path
from . import views

urlpatterns = [
    path('get-test-data/', views.get_test_data, name='get-test-data'),
    path('add-test-data/', views.add_test_data, name='add-test-data'),
]
