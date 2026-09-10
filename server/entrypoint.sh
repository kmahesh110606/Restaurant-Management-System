#!/bin/bash
set -e

echo "=== Starting Restaurant Management System Backend ==="

echo "Waiting for database..."
while ! python -c "
import os, psycopg2
try:
    psycopg2.connect(
        dbname=os.environ.get('DB_NAME', 'rms_db'),
        user=os.environ.get('DB_USER', 'rms_user'),
        password=os.environ.get('DB_PASSWORD', 'rms_password'),
        host=os.environ.get('DB_HOST', 'db'),
        port=os.environ.get('DB_PORT', '5432'),
    )
    print('Database connection established successfully!')
except Exception as e:
    exit(1)
" 2>/dev/null; do
    echo "Database not ready yet, retrying in 1s..."
    sleep 1
done

echo "Running migrations..."
python manage.py makemigrations --no-input
python manage.py migrate --no-input

echo "Collecting static files..."
python manage.py collectstatic --no-input

echo "Starting Gunicorn server on 0.0.0.0:8000..."
exec gunicorn server.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers 3 \
    --timeout 120 \
    --access-logfile - \
    --error-logfile -
