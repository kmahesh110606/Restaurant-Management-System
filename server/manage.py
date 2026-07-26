#!/usr/bin/env python
# Script execution directive specifying the Python environment interpreter
"""Django's command-line utility for administrative tasks."""
# Module docstring explaining the main purpose of manage.py

import os  # Import operating system interfaces for managing environment variables
import sys  # Import system-specific parameters and functions for command-line arguments


def main():  # Define the primary execution function for managing tasks
    """Run administrative tasks."""  # Function docstring explaining function behavior
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'server.settings')  # Set default Django settings module to server.settings
    try:  # Begin try block to attempt importing Django management utilities
        from django.core.management import execute_from_command_line  # Import the main Django CLI task executor
    except ImportError as exc:  # Catch import errors if Django is not installed or accessible
        raise ImportError(  # Raise a user-friendly error message if import fails
            "Couldn't import Django. Are you sure it's installed and "  # Part 1 of error message string
            "available on your PYTHONPATH environment variable? Did you "  # Part 2 of error message string
            "forget to activate a virtual environment?"  # Part 3 of error message string
        ) from exc  # Chain exception to preserve original traceback context
    execute_from_command_line(sys.argv)  # Pass command-line arguments to Django executor and run task


if __name__ == '__main__':  # Check if script is being executed directly as main program
    main()  # Call the main entry point function

