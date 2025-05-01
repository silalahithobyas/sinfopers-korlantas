from django.db import models

class BaseModel(models.Model):
    """
    Base model untuk semua model dengan field date_created dan date_updated.
    """
    date_created = models.DateTimeField(auto_now_add=True)
    date_updated = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True 