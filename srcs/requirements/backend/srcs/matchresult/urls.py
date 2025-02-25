from django.urls import path
from .views import add, search, results

urlpatterns = [
    path('results/', results, name='results'),
	path('add/', add, name='add'),
	path('search/', search, name='search'),
]