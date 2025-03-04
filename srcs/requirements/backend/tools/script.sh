#!/bin/bash

# Run migrations
echo "Running migrations..."
python manage.py makemigrations
python manage.py migrate --noinput
python manage.py collectstatic --noinput

# Start Django server
exec "$@"