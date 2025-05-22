from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets, status, permissions, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Information, InformationLog
from .serializers import InformationSerializer
from authentication.models import AuthUser
from django.utils import timezone
import logging
import traceback
from authentication.permissions import IsHRorReadOnly, IsHROwnerOrReadOnly

# Tambahkan logger untuk mempermudah debugging
logger = logging.getLogger(__name__)

class InformationListCreateView(generics.ListCreateAPIView):
    queryset = Information.objects.all()
    serializer_class = InformationSerializer
    permission_classes = [IsHRorReadOnly]

    def perform_create(self, serializer):
        serializer.save(penulis=self.request.user)

class InformationDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Information.objects.all()
    serializer_class = InformationSerializer
    permission_classes = [IsHROwnerOrReadOnly]

    def perform_update(self, serializer):
        instance = serializer.save()
        InformationLog.objects.create(
            information=instance,
            user=self.request.user,
            action='update',
            detail=f"Informed updated to: {instance.information_title}"
        )

    def perform_destroy(self, instance):
        InformationLog.objects.create(
            information=instance,
            user=self.request.user,
            action='delete',
            detail=f"Information deleted: {instance.information_title}"
        )
        instance.delete()
