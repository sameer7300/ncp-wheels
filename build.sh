#!/usr/bin/env bash
# exit on error
set -o errexit

echo "Installing Python dependencies..."
pip install -r requirements.txt

echo "Collecting static files..."
python manage.py collectstatic --no-input --settings=config.settings_prod

echo "Checking database connection..."
python manage.py check --settings=config.settings_prod --database default

echo "Running migrations..."
python manage.py migrate --no-input --settings=config.settings_prod

echo "Build completed successfully!"
