from django.db import models

# Create your models here.
import uuid
import os
from django.core.exceptions import ValidationError
from authentication.models import AuthUser
from commons.models import BaseModel

def validate_file_extension(value):
    if not value:
        return
    ext = os.path.splitext(value.name)[1]
    valid_extensions = ['.pdf']
    max_file_size = 5 * 1024 * 1024

    if not ext.lower() in valid_extensions:
        raise ValidationError('File harus berformat PDF.')
    
    if value.size > max_file_size:
        raise ValidationError('File PDF tidak boleh lebih dari 5MB.')

class Information(BaseModel):
    information_id = models.UUIDField(primary_key=True, default=uuid.uuid4, unique=True)
    penulis = models.ForeignKey(AuthUser, on_delete=models.CASCADE, related_name='Information')
    information_title = models.CharField(max_length=50)
    information_context = models.TextField()
    file_pendukung = models.FileField(
        upload_to='Information/', 
        validators=[validate_file_extension],
        null=True, 
        blank=True,
        help_text="Anda dapat mengunggah file PDF sebagai lampiran pendukung"
    )

    date_created = models.DateTimeField(auto_now_add=True)
    date_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.penulis.username} - {self.information_title} - {self.date_created}"

    class Meta:
        ordering = ['-date_created']
        verbose_name = "Information"
        verbose_name_plural = "Information"

class InformationLog(BaseModel):
    ACTION_CHOICES = [
        ('update', 'Update'),
        ('delete', 'Delete'),
    ]

    log_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    information = models.ForeignKey(Information, on_delete=models.CASCADE)
    user = models.ForeignKey(AuthUser, on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=10, choices=ACTION_CHOICES)
    timestamp = models.DateTimeField(auto_now_add=True)
    detail = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.user} melakukan {self.action} pada {self.information.information_title}"