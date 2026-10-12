"""Explicit, one-time platform administrator provisioning."""
import os
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from restaurant.models import SafetyLog

class Command(BaseCommand):
    help = 'Create a platform administrator from RMS_ADMIN_USERNAME, RMS_ADMIN_EMAIL and RMS_ADMIN_PASSWORD. Existing users are never changed.'

    @transaction.atomic
    def handle(self, *args, **options):
        username = os.environ.get('RMS_ADMIN_USERNAME', '')
        password = os.environ.get('RMS_ADMIN_PASSWORD', '')
        email = os.environ.get('RMS_ADMIN_EMAIL', '')
        if not username or not password or not email:
            raise CommandError('Set RMS_ADMIN_USERNAME, RMS_ADMIN_EMAIL and RMS_ADMIN_PASSWORD for one-time provisioning.')
        if User.objects.filter(username=username).exists():
            raise CommandError('This username already exists. No account was changed.')
        user = User(username=username, email=email, is_staff=True, is_superuser=True)
        validate_password(password, user)
        user.set_password(password)
        user.save()
        SafetyLog.objects.create(event_type='credential_provision', severity='info', user=user,
                                 username=username, description='Platform administrator created by management command.')
        self.stdout.write(self.style.SUCCESS('Platform administrator created. No credentials were logged.'))
