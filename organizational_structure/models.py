# organizational_structure/models.py
from django.db import models
from django.contrib.postgres.fields import ArrayField

from authentication.models.base import BaseModel

from personnel_database.models.users import UserPersonil

class Nodes(BaseModel) :
    personnel = models.ForeignKey(UserPersonil, on_delete=models.CASCADE, null=True)
    offset = models.BooleanField(default=False)
    child = models.ManyToManyField("self", symmetrical=False, related_name="child_list", blank=True)
    child_offsets = models.ManyToManyField("self", symmetrical=False, related_name="child_offsets_list", blank=True)

    def delete(self, *args, **kwargs):
        for child_node in self.child.all():
            child_node.delete()
        for child_offset_node in self.child_offsets.all():
            child_offset_node.delete()
        
        super(Nodes, self).delete(*args, **kwargs)

class Chart(BaseModel) :
    nama = models.CharField(max_length=120)
    nodes = models.ForeignKey(Nodes, on_delete=models.SET_NULL, null=True)

    def delete(self, *args, **kwargs):
        if self.nodes:
            self.nodes.delete()
        
        super(Chart, self).delete(*args, **kwargs)
