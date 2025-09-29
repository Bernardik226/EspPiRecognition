from django.urls import path
from . import views

urlpatterns = [
    path('api/upload/', views.upload_photo, name='upload'),
    path('photos/', views.photos_page, name='photos'),	
	path("api/photos/", views.photos_json, name="photos_json"),
	path("photos/", views.photos_page, name="photos_page"),  # sua página HTML
	path('api/photos/', views.photos_api, name='photos_api'),
]





    
    

