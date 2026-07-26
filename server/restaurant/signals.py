"""
Django signals for the Restaurant Management System.

- Auto-generate QR codes for new tables.
"""  # Module docstring describing model signal receivers

from django.db.models.signals import post_save  # Import post_save signal triggered after a model saves
from django.dispatch import receiver  # Import receiver decorator to register signal handler functions
from django.conf import settings  # Import Django settings module to access project environment configurations

from restaurant.models import Table  # Import Table model to attach post_save listener
from restaurant.utils import generate_qr_code  # Import generate_qr_code helper function for creating QR images


@receiver(post_save, sender=Table)  # Attach signal receiver function to Table model post_save events
def generate_table_qr_code(sender, instance, created, **kwargs):  # Handler function triggered after Table save
    """
    Generate a QR code image for a table when it is created or when
    its qr_code field is empty. The QR encodes a URL pointing to the
    customer menu for the table's restaurant.
    """  # Function docstring explaining QR generation logic
    if not instance.qr_code:  # Check if table does not currently have a QR code image saved
        # Build the customer-facing menu URL
        base_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')  # Retrieve FRONTEND_URL setting with default fallback
        menu_url = f"{base_url}/{instance.restaurant.slug}/menu?table={instance.number}"  # Format customer menu URL string with restaurant slug and table number

        qr_file = generate_qr_code(menu_url, filename_prefix=f'table_{instance.number}')  # Call utility function to render QR code image file

        # Use save with update_fields to avoid infinite loop
        instance.qr_code.save(qr_file.name, qr_file, save=False)  # Associate generated image file with Table.qr_code field without triggering model save
        Table.objects.filter(pk=instance.pk).update(qr_code=instance.qr_code)  # Directly update database record for qr_code field to prevent recursive signal loop

