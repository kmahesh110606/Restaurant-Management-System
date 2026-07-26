"""
ASGI config for server project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/howto/deployment/asgi/
"""  # Module docstring explaining ASGI (Asynchronous Server Gateway Interface) configuration

import os  # Import os module for managing environment variables

from django.core.asgi import get_asgi_application  # Import helper function to construct the ASGI application instance

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'server.settings')  # Set DJANGO_SETTINGS_MODULE env variable to point to server settings module

application = get_asgi_application()  # Create the ASGI application callable used by async web servers

