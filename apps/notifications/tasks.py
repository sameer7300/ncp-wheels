from celery import shared_task
from .services import NotificationService

@shared_task
def check_featured_listing_expiry():
    """Celery task to check for expiring featured listings"""
    NotificationService.check_featured_listing_expiry()
    return "Completed featured listing expiry check"
