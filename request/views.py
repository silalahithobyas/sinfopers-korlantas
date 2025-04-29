from django.shortcuts import render, redirect
from django.conf import settings
from request.forms import CutiRequestForm, MutasiRequestForm
from request.models import CutiRequest, MutasiRequest
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
    cuti_requests = CutiRequest.objects.filter(user=request.user)
    mutasi_requests = MutasiRequest.objects.filter(user=request.user)


    combined_requests = []

    for cuti in cuti_requests:
        combined_requests.append({
            'jenis': 'Cuti',
            'tanggal': cuti.tanggalMulai,
            'status': cuti.status,
        })

    for mutasi in mutasi_requests:
        combined_requests.append({
            'jenis': 'Mutasi',
            'tanggal': mutasi.tanggalPengajuan,
            'status': mutasi.status,
        })

    # Urutkan berdasarkan tanggal pengajuan terbaru
    combined_requests.sort(key=lambda x: x['tanggal'], reverse=True)

    context = {
        'combined_requests': combined_requests,
    }

    return render(request, "request.html", context)

@login_required(login_url='/login')
def create_mutasi_request(request):
    form = MutasiRequestForm(request.POST or None)

    if form.is_valid() and request.method == "POST":
        form.save()
        return redirect('request:show_request_mutasi')

    context = {'form': form}
    return render(request, "create_mutasi_request.html", context)

@login_required(login_url='/login')
def create_cuti_request(request):
    form = CutiRequestForm(request.POST or None)

    if form.is_valid() and request.method == "POST":
        form.save()
        return redirect('request:show_request_cuti')

    context = {'form': form}
    return render(request, "create_cuti_request.html", context)

@login_required(login_url='/login')
def show_xml_cuti(request):
    data = CutiRequest.objects.all()
    return HttpResponse(serializers.serialize("xml", data), content_type="application/xml")

@login_required(login_url='/login')
def show_json_cuti(request):
    data = CutiRequest.objects.all()
    return HttpResponse(serializers.serialize("json", data), content_type="application/json")

@login_required(login_url='/login')
def show_xml_by_id_cuti(request, id):
    data = CutiRequest.objects.filter(pk=id)
    return HttpResponse(serializers.serialize("xml", data), content_type="application/xml")

@login_required(login_url='/login')
def show_json_by_id_cuti(request, id):
    data = CutiRequest.objects.filter(pk=id)
    return HttpResponse(serializers.serialize("json", data), content_type="application/json")

@login_required(login_url='/login')
def show_xml_mutasi(request):
    data = CutiRequest.objects.all()
    return HttpResponse(serializers.serialize("xml", data), content_type="application/xml")

@login_required(login_url='/login')
def show_json_mutasi(request):
    data = CutiRequest.objects.all()
    return HttpResponse(serializers.serialize("json", data), content_type="application/json")

@login_required(login_url='/login')
def show_xml_by_id_mutasi(request, id):
    data = CutiRequest.objects.filter(pk=id)
    return HttpResponse(serializers.serialize("xml", data), content_type="application/xml")

@login_required(login_url='/login')
def show_json_by_id_mutasi(request, id):
    data = CutiRequest.objects.filter(pk=id)
    return HttpResponse(serializers.serialize("json", data), content_type="application/json")