from django.urls import path

from .views import add, results

urlpatterns = [
    path('add/', add, name='add'),
    path('results/', results, name='results'),
]
