"""
URL configuration for server project.
"""  # Root URL configuration docstring for the main server application

from django.contrib import admin  # Import Django admin module for admin panel routing
from django.urls import path, include  # Import path generator and include helper for modular routing
from django.conf import settings  # Import application settings for environment-specific configs
from django.conf.urls.static import static  # Import static/media file routing helper

<<<<<<< HEAD
urlpatterns = [
    path('django-admin/', admin.site.urls),
    path('api/v1/', include('restaurant.urls')),
]
=======
urlpatterns = [  # Define list of top-level URL patterns matched by Django
    path('admin/', admin.site.urls),  # Map /admin/ path to the built-in Django administration site
    path('api/v1/', include('restaurant.urls')),  # Map /api/v1/ prefix to the restaurant app's URL routing module
]  # End of URL patterns list
>>>>>>> b7ce8a3aaab13c0af968bde073b6b78f5ae8efd3

# Serve media files in development
if settings.DEBUG:  # Check if Django is running in DEBUG mode (local development)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)  # Append static route to serve media uploaded files from MEDIA_ROOT

