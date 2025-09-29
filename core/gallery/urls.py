from django.urls import path
from . import views

urlpatterns = [
    path('', views.gallery, name='gallery'),                    # Página principal da galeria
    path('upload/', views.upload_photo, name='upload_photo'),   # Endpoint para ESP32-CAM enviar fotos
    path('api/photos/', views.photos_api, name='photos_api'),   # API para buscar fotos paginadas
]