from django.shortcuts import render

def streaming(request):
    return render(request, 'streaming/streaming.html')
