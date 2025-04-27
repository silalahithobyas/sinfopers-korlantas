from django.shortcuts import render, redirect
from django.conf import settings
from request.forms import CutiRequestForm
from request.models import CutiRequest
from django.http import HttpResponse
from django.core import serializers
from django.contrib.auth.forms import UserCreationForm
from django.contrib import messages
from django.contrib.auth.decorators import login_required
import datetime
from django.http import HttpResponseRedirect
from django.urls import reverse

User = settings.AUTH_USER_MODEL

# Create your views here.
@login_required(login_url='/login')
def show_request(request):
    cuti_requests = CutiRequest.objects.all()

    context = {
        'name': 'Pak Bepe',
        'class': 'PBP D',
        'npm': '2306123456',
        'cuti_requests': cuti_requests
    }

    return render(request, "main.html", context)

@login_required(login_url='/login')
def create_cuti_request(request):
    form = CutiRequestForm(request.POST or None)

    if form.is_valid() and request.method == "POST":
        form.save()
        return redirect('request:show_request_cuti')

    context = {'form': form}
    return render(request, "create_cuti_request.html", context)

@login_required(login_url='/login')
def show_xml(request):
    data = CutiRequest.objects.all()
    return HttpResponse(serializers.serialize("xml", data), content_type="application/xml")

@login_required(login_url='/login')
def show_json(request):
    data = CutiRequest.objects.all()
    return HttpResponse(serializers.serialize("json", data), content_type="application/json")

@login_required(login_url='/login')
def show_xml_by_id(request):
    data = CutiRequest.objects.filter(pk=id)
    return HttpResponse(serializers.serialize("xml", data), content_type="application/xml")

@login_required(login_url='/login')
def show_json_by_id(request):
    data = CutiRequest.objects.filter(pk=id)
    return HttpResponse(serializers.serialize("json", data), content_type="application/json")

@login_required(login_url='/login')
def register(request):
    form = UserCreationForm()

    if request.method == "POST":
        form = UserCreationForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'Your account has been successfully created!')
            return redirect('main:login')
    context = {'form':form}
    return render(request, 'register.html', context)