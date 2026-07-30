"""
WSGI config for server project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/howto/deployment/wsgi/
"""  # Module docstring explaining WSGI (Web Server Gateway Interface) configuration

import os  # Import os module for interacting with operating system environment

from django.core.wsgi import get_wsgi_application  # Import Django helper function to retrieve WSGI application callable

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'server.settings')  # Set DJANGO_SETTINGS_MODULE environment variable to server.settings

application = get_wsgi_application()  # Initialize and return WSGI application instance for web server processing

