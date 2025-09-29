from django.contrib import admin
from .models import Photo

@admin.register(Photo)
class PhotoAdmin(admin.ModelAdmin):
    list_display = ['id', 'device_id', 'created_at', 'image_preview']
    list_filter = ['device_id', 'created_at']
    search_fields = ['device_id']
    readonly_fields = ['created_at', 'image_preview']
    ordering = ['-created_at']
    
    def image_preview(self, obj):
        if obj.image:
            return f'<img src="{obj.image.url}" style="max-height: 100px; max-width: 100px;" />'
        return "Sem imagem"
    image_preview.allow_tags = True
    image_preview.short_description = "Preview"
