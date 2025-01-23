from django.shortcuts import render

# Create your views here.
from django.http import HttpResponse, JsonResponse
import json
from .models import TestModel
from django.views.decorators.csrf import csrf_exempt

def get_test_data(request):
    print('hello')
    data = TestModel.objects.all().values()
    return JsonResponse(list(data), safe=False)

@csrf_exempt # http용
def add_test_data(request):
    if request.method == "POST":
        data = json.loads(request.body)
        name = data.get("name")
        description = data.get("description")
        new_data = TestModel.objects.create(name=name, description=description)
        return JsonResponse({"message": "Data added successfully!", "id": new_data.id})