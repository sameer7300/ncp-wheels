#!/usr/bin/env bash
# exit on error
set -o errexit

echo "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo "Collecting static files..."
python manage.py collectstatic --no-input --settings=config.settings_prod

echo "Running migrations..."
python manage.py migrate --settings=config.settings_prod

echo "Build completed successfully!"
