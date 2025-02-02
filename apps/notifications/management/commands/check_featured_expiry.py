from django.core.management.base import BaseCommand
from apps.notifications.services import NotificationService

class Command(BaseCommand):
    help = 'Check for featured listings that are about to expire and send notifications'

    def handle(self, *args, **kwargs):
        self.stdout.write('Checking for expiring featured listings...')
        
        try:
            NotificationService.check_featured_listing_expiry()
            self.stdout.write(self.style.SUCCESS('Successfully checked featured listing expiry'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error checking featured listing expiry: {str(e)}'))
