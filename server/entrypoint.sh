#!/bin/bash
set -e

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
    print('Database ready!')
except Exception as e:
    print(f'Waiting... {e}')
    exit(1)
" 2>/dev/null; do
    sleep 1
done

echo "Running migrations..."
python manage.py migrate --no-input

echo "Collecting static files..."
python manage.py collectstatic --no-input

echo "Starting Gunicorn..."
exec gunicorn server.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers 3 \
    --timeout 120 \
    --access-logfile - \
    --error-logfile -
