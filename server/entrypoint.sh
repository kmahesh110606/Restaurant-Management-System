#!/bin/bash
# Shebang line to execute the script using the bash shell interpreter
set -e  # Instruct bash to immediately exit if any command returns a non-zero error exit status

echo "Waiting for database..."  # Print status message indicating database connection check starting
while ! python -c "  # Begin retry loop executing inline python snippet to test PostgreSQL connection
import os, psycopg2  # Import os module for reading environment variables and psycopg2 for PostgreSQL connections
try:  # Start try block to attempt database connection
    psycopg2.connect(  # Establish connection using environment variables or fallback defaults
        dbname=os.environ.get('DB_NAME', 'rms_db'),  # Get database name (default: rms_db)
        user=os.environ.get('DB_USER', 'rms_user'),  # Get database user (default: rms_user)
        password=os.environ.get('DB_PASSWORD', 'rms_password'),  # Get database password (default: rms_password)
        host=os.environ.get('DB_HOST', 'db'),  # Get database host name (default: db service host)
        port=os.environ.get('DB_PORT', '5432'),  # Get database connection port (default: 5432)
    )  # Close psycopg2.connect parameter list
    print('Database ready!')  # Print success message when connection succeeds
except Exception as e:  # Catch connection error exceptions
    print(f'Waiting... {e}')  # Print waiting status message with exception string
    exit(1)  # Exit python with non-zero exit code 1 to trigger while loop retry
" 2>/dev/null; do  # Suppress standard error output from python command and continue while loop
    sleep 1  # Pause script execution for 1 second before retrying database connection
done  # End database readiness check while loop

echo "Running migrations..."
python manage.py makemigrations --no-input
python manage.py migrate --no-input

echo "Collecting static files..."  # Print status message indicating static file collection
python manage.py collectstatic --no-input  # Gather all static assets into STATIC_ROOT directory without prompt

echo "Starting Gunicorn..."  # Print status message indicating Gunicorn server startup
exec gunicorn server.wsgi:application \  # Replace shell process with Gunicorn WSGI server running application instance
    --bind 0.0.0.0:8000 \  # Bind Gunicorn HTTP listener to port 8000 on all network interfaces
    --workers 3 \  # Spawn 3 worker processes for handling concurrent web requests
    --timeout 120 \  # Set request timeout limit to 120 seconds
    --access-logfile - \  # Route access log output to stdout stream
    --error-logfile -  # Route error log output to stderr stream

