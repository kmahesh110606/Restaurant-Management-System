"""Run the API suite without touching application databases or uploaded files."""
import os
import sys
import tempfile
from pathlib import Path

os.environ['DJANGO_SETTINGS_MODULE'] = 'server.test_settings'
from django.conf import settings
settings.DATABASES = {'default': {'ENGINE': 'django.db.backends.sqlite3', 'NAME': ':memory:'}}
settings.ALLOWED_HOSTS = ['testserver', 'localhost', '127.0.0.1']
with tempfile.TemporaryDirectory(prefix='rms-test-media-') as media:
    settings.MEDIA_ROOT = media
    import django
    django.setup()
    from django.test.utils import get_runner
    labels = sys.argv[1:] or ['restaurant']
    failures = get_runner(settings)(verbosity=1, interactive=False).run_tests(labels)
    sys.exit(bool(failures))
