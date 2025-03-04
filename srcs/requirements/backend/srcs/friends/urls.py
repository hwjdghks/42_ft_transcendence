from django.urls import path

from .views import add_friend, delete_friend, friend_list, get_online, search_users

urlpatterns = [
    path('list/', friend_list, name='list'),
    path('search/', search_users, name='search_user'),
    path('add/', add_friend, name='add_friend'),
    path('delete/', delete_friend, name='delete_friend'),
    path('online/', get_online, name='online'),
]
