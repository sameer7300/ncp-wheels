import os
from celery import Celery
from celery.schedules import crontab

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ncp_wheels.settings')

app = Celery('ncp_wheels')

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Load task modules from all registered Django app configs.
app.autodiscover_tasks()

# Configure periodic tasks
app.conf.beat_schedule = {
    'cleanup-expired-featured-listings': {
        'task': 'apps.cars.tasks.cleanup_expired_featured_listings',
        'schedule': crontab(minute=0, hour=0),  # Run at midnight every day
    },
}
