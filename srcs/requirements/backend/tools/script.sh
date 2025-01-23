#!/bin/bash
# wait for database to be ready
echo "Waiting for PostgreSQL to be ready..."
sleep 1

# Run migrations
echo "Running migrations..."
python manage.py makemigrations
python manage.py migrate --noinput

# Start Django server
exec "$@"