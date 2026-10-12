"""PostgreSQL integration tests against the disposable GitHub Actions service."""
import os
from .test_settings import *  # noqa: F403

if os.environ.get('CI') != 'true':
    raise RuntimeError('CI settings require CI=true and a disposable PostgreSQL service.')

DATABASES = {'default': {
    'ENGINE': 'django.db.backends.postgresql',
    'NAME': 'rms_ci',
    'USER': 'rms_ci',
    'PASSWORD': os.environ['RMS_CI_DB_PASSWORD'],
    'HOST': '127.0.0.1',
    'PORT': '5432',
    'TEST': {'NAME': 'test_rms_ci'},
}}
