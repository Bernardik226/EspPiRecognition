from django.db import models
from django.utils import timezone

class Photo(models.Model):
    image = models.ImageField(upload_to='photos/')
    device_id = models.CharField(max_length=50, default='esp32cam')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Foto {self.id} - {self.device_id} - {self.created_at}"
