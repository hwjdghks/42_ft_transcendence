from django.urls import path

from .views import add, results, search

urlpatterns = [
    path('add/', add, name='add'),
    path('results/', results, name='results'),
    path('search/', search, name='search'),
]
