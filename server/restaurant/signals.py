"""
Django signals for the Restaurant Management System.

- Auto-generate QR codes for new tables.
"""

from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings

from restaurant.models import Table
from restaurant.utils import generate_qr_code


@receiver(post_save, sender=Table)
def generate_table_qr_code(sender, instance, created, **kwargs):
    """
    Generate a QR code image for a table when it is created or when
    its qr_code field is empty.  The QR encodes a URL pointing to the
    customer menu for the table's restaurant.
    """
    if not instance.qr_code:
        # Build the customer-facing menu URL
        base_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
        menu_url = f"{base_url}/{instance.restaurant.slug}/menu?table={instance.number}"

        qr_file = generate_qr_code(menu_url, filename_prefix=f'table_{instance.number}')

        # Use save with update_fields to avoid infinite loop
        instance.qr_code.save(qr_file.name, qr_file, save=False)
        Table.objects.filter(pk=instance.pk).update(qr_code=instance.qr_code)
