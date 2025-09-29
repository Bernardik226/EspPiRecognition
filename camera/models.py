from django.db import models

class Photo(models.Model):
    device_id = models.CharField(max_length=100, blank=True)
    image = models.ImageField(upload_to='photos/%Y/%m/%d')
    created_at = models.DateTimeField(auto_now_add=True)
