from celery import shared_task
from django.core.management import call_command

@shared_task
def cleanup_expired_featured_listings():
    """Task to clean up expired featured listings"""
    call_command('cleanup_featured_listings')
