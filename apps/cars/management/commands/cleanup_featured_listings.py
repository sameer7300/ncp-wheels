from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.cars.models import FeaturedListing

class Command(BaseCommand):
    help = 'Clean up expired featured listings'

    def handle(self, *args, **options):
        now = timezone.now()
        expired_listings = FeaturedListing.objects.filter(
            end_date__lt=now,
            is_active=True
        )
        
        count = expired_listings.count()
        expired_listings.update(is_active=False)
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully deactivated {count} expired featured listings'
            )
        )
