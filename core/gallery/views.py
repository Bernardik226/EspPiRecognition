from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse, HttpResponseBadRequest
from django.core.files.base import ContentFile
from django.shortcuts import render
from .models import Photo
import datetime

def gallery(request):
    """Página principal da galeria - renderiza o template gallery.html"""
    return render(request, 'gallery/gallery.html')

@csrf_exempt
def upload_photo(request):
    """Endpoint para receber fotos da ESP32-CAM via POST"""
    if request.method != 'POST':
        return HttpResponseBadRequest("Use POST")
    if not request.body:
        return HttpResponseBadRequest("Sem dados")

    device_id = request.META.get('HTTP_X_DEVICE_ID', 'esp32cam')
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{device_id}_{timestamp}.jpg"

    photo = Photo(device_id=device_id)
    photo.image.save(filename, ContentFile(request.body))
    photo.save()

    return JsonResponse({"status": "ok", "url": photo.image.url, "id": photo.id})

# API paginada (offset/limit) - retorna fotos mais recentes primeiro
def photos_api(request):
    """API para o template gallery.html buscar fotos paginadas"""
    try:
        offset = int(request.GET.get('offset', 0))
        limit = int(request.GET.get('limit', 20))
    except ValueError:
        offset, limit = 0, 20

    photos = Photo.objects.order_by('-created_at')[offset:offset+limit]
    data = [{
        'id': p.id,
        'url': p.image.url,
        'created_at': p.created_at.isoformat()
    } for p in photos]
    return JsonResponse(data, safe=False)