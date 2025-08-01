from django.contrib import admin
from django.utils.html import format_html
from organizational_structure.models import Chart, Nodes

@admin.register(Chart)
class ChartAdmin(admin.ModelAdmin):
    list_display = ('nama', 'updated_at', 'has_nodes')
    search_fields = ('nama',)
    ordering = ('-updated_at',)
    
    def has_nodes(self, obj):
        if obj.nodes:
            return format_html('<span style="color:green;">✓</span>')
        return format_html('<span style="color:red;">✗</span>')
    
    has_nodes.short_description = 'Memiliki Nodes'

@admin.register(Nodes)
class NodesAdmin(admin.ModelAdmin):
    list_display = ('id', 'personnel_name', 'offset', 'child_count', 'child_offsets_count')
    list_filter = ('offset',)
    search_fields = ('personnel__nama',)
    
    def personnel_name(self, obj):
        if obj.personnel:
            return obj.personnel.nama
        return '-'
    
    def child_count(self, obj):
        return obj.child.count()
    
    def child_offsets_count(self, obj):
        return obj.child_offsets.count()
    
    personnel_name.short_description = 'Personil'
    child_count.short_description = 'Jumlah Anak'
    child_offsets_count.short_description = 'Jumlah Offset Anak'
