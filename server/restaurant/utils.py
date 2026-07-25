"""
Utility functions for the Restaurant Management System.
"""

import io
import qrcode
from django.core.files.base import ContentFile
from django.utils import timezone


def generate_qr_code(data: str, filename_prefix: str = 'qr') -> ContentFile:
    """
    Generate a QR code image and return it as a Django ContentFile
    suitable for saving to an ImageField.

    Args:
        data: The data to encode (typically a URL).
        filename_prefix: Prefix for the generated filename.

    Returns:
        ContentFile containing the PNG image.
    """
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=4,
    )
    qr.add_data(data)
    qr.make(fit=True)

    img = qr.make_image(fill_color='black', back_color='white')
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    buffer.seek(0)

    timestamp = timezone.now().strftime('%Y%m%d%H%M%S')
    filename = f'{filename_prefix}_{timestamp}.png'
    return ContentFile(buffer.getvalue(), name=filename)


def get_next_token_number(restaurant):
    """
    Get the next token number for today for a given restaurant.
    Tokens reset daily.
    """
    from restaurant.models import Token

    today = timezone.now().date()
    last_token = (
        Token.objects
        .filter(restaurant=restaurant, created_at__date=today)
        .order_by('-number')
        .first()
    )
    return (last_token.number + 1) if last_token else 1
