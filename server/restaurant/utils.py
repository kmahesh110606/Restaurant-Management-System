"""
Utility functions for the Restaurant Management System.
"""  # Module docstring for helper and utility functions

import io  # Import standard I/O library for handling byte streams in memory
import qrcode  # Import qrcode library for rendering QR code matrix images
from django.core.files.base import ContentFile  # Import Django ContentFile wrapper for file creation from bytes
from django.utils import timezone  # Import Django timezone utilities for timezone-aware datetimes


def generate_qr_code(data: str, filename_prefix: str = 'qr') -> ContentFile:  # Function to generate QR code PNG as ContentFile
    """
    Generate a QR code image and return it as a Django ContentFile
    suitable for saving to an ImageField.

    Args:
        data: The data to encode (typically a URL).
        filename_prefix: Prefix for the generated filename.

    Returns:
        ContentFile containing the PNG image.
    """  # Function docstring explaining QR generation params and return type
    qr = qrcode.QRCode(  # Instantiate QRCode object with configuration options
        version=1,  # Set QR code version (grid size layout matrix)
        error_correction=qrcode.constants.ERROR_CORRECT_H,  # Set high error correction level (up to 30% restoration capacity)
        box_size=10,  # Set pixel dimensions for each individual QR module box
        border=4,  # Set quiet zone border thickness in module blocks
    )  # Finish QRCode builder config
    qr.add_data(data)  # Add data string to QR matrix payload
    qr.make(fit=True)  # Calculate optimal matrix dimensions and generate layout

    img = qr.make_image(fill_color='black', back_color='white')  # Render PIL Image object with black code and white background
    buffer = io.BytesIO()  # Create in-memory binary byte stream buffer
    img.save(buffer, format='PNG')  # Save rendered image into bytes buffer in PNG format
    buffer.seek(0)  # Reset buffer read cursor pointer back to start

    timestamp = timezone.now().strftime('%Y%m%d%H%M%S')  # Format current timestamp into string prefix
    filename = f'{filename_prefix}_{timestamp}.png'  # Construct file name with prefix and timestamp string
    return ContentFile(buffer.getvalue(), name=filename)  # Return Django ContentFile object initialized with PNG bytes


def get_next_token_number(restaurant):  # Function to calculate next sequential customer token number for today
    """
    Get the next token number for today for a given restaurant.
    Tokens reset daily.
    """  # Function docstring explaining daily token counter reset logic
    from restaurant.models import Token  # Lazy import Token model to avoid circular import issues

    today = timezone.now().date()  # Get current calendar date in active timezone
    last_token = (  # Begin query expression to retrieve latest token record
        Token.objects  # Access Token model queryset manager
        .filter(restaurant=restaurant, created_at__date=today)  # Filter tokens matching restaurant and created today
        .order_by('-number')  # Sort tokens in descending order by token number
        .first()  # Fetch the top token record with maximum token number
    )  # Close query expression tuple
    return (last_token.number + 1) if last_token else 1  # Increment highest token number or start at 1 if none created today

