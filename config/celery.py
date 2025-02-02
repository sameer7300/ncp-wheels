import os
from celery import Celery
from celery.schedules import crontab

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

app = Celery('ncp_wheels')

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Load task modules from all registered Django app configs.
app.autodiscover_tasks()

# Configure the Celery beat schedule
app.conf.beat_schedule = {
    'check-featured-listing-expiry': {
        'task': 'apps.notifications.tasks.check_featured_listing_expiry',
        'schedule': crontab(hour=0, minute=0),  # Run daily at midnight
    },
}

@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')
