from django.apps import AppConfig  # Import base AppConfig class for configuring Django applications


class RestaurantConfig(AppConfig):  # Define configuration class for the restaurant Django app
    default_auto_field = 'django.db.models.BigAutoField'  # Set default primary key auto-increment field type to 64-bit BigAutoField
    name = 'restaurant'  # Define python package path for the application
    verbose_name = 'Restaurant Management'  # Set human-readable display name for admin site interface

    def ready(self):  # Define lifecycle hook executed when Django application startup completes
        import restaurant.signals  # noqa: F401 # Import signals module to connect model event listeners on app startup

