"""Create synthetic data in a runner-owned temporary database, then serve it."""
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'server'))
os.environ['DJANGO_SETTINGS_MODULE'] = 'server.test_settings'
from django.conf import settings

fixture = Path(os.environ['RMS_TEST_FIXTURE_DIR']).resolve()
settings.DATABASES['default']['NAME'] = str(fixture / 'browser.sqlite3')
settings.MEDIA_ROOT = str(fixture / 'media')

import django
django.setup()
from django.core.management import call_command
from django.contrib.auth.models import User
from restaurant.tests import TestDataMixin
from restaurant.models import StaffProfile

call_command('migrate', verbosity=0)
factory = TestDataMixin()
data = factory.setup_full_restaurant()
restaurant = data['restaurant']
restaurant.name = 'Browser Test Restaurant'
restaurant.tax_rate = '5.00'
restaurant.save()
for role in ['admin', 'waiter', 'kitchen', 'biller']:
    user = data[role + '_user']
    user.set_password('BrowserFixture-only-123!')
    user.save()
User.objects.create_superuser('browser_platform', 'platform@example.test', 'BrowserFixture-only-123!')
shop = factory.create_restaurant(slug='browser-shop', workflow_type='shop', name='Browser Counter')
user = User.objects.create_user('browser_cashier', password='BrowserFixture-only-123!')
StaffProfile.objects.create(user=user, restaurant=shop, role='biller')
category = factory.create_category(restaurant=shop)
factory.create_menu_item(category=category, name='Counter Coffee')
call_command('runserver', '127.0.0.1:' + os.environ['RMS_TEST_API_PORT'], use_reloader=False, verbosity=0)
