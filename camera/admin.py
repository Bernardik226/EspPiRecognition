from django.contrib import admin
from .models import Photo

@admin.register(Photo)
class PhotoAdmin(admin.ModelAdmin):
    list_display = ('id', 'device_id', 'created_at')
    list_filter = ('device_id', 'created_at')
    search_fields = ('device_id',)