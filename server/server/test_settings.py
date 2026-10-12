"""Isolated SQLite settings for local tests; never use for deployment."""
import os
import atexit
import tempfile

# Set these before importing settings so local deployment environment variables
# cannot point the tests at application data or enable HTTPS redirects.
os.environ['DJANGO_DEBUG'] = 'True'
os.environ.pop('DB_NAME', None)

from .settings import *  # noqa: F403, E402

DATABASES = {'default': {'ENGINE': 'django.db.backends.sqlite3', 'NAME': ':memory:'}}
ALLOWED_HOSTS = ['testserver', 'localhost', '127.0.0.1']
PASSWORD_HASHERS = ['django.contrib.auth.hashers.MD5PasswordHasher']
EMAIL_BACKEND = 'django.core.mail.backends.locmem.EmailBackend'
SECURE_SSL_REDIRECT = False
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False

_test_media = tempfile.TemporaryDirectory(prefix='rms-unit-media-')
MEDIA_ROOT = _test_media.name
atexit.register(_test_media.cleanup)
