from django.utils import timezone
from django.db.models import Q
from django.contrib.contenttypes.models import ContentType
from datetime import timedelta
from .models import Notification
from apps.cars.models import FeaturedListing

class NotificationService:
    @staticmethod
    def create_notification(user, notification_type, title, message, content_object=None):
        """Create a new notification"""
        notification = Notification.objects.create(
            user=user,
            notification_type=notification_type,
            title=title,
            message=message,
            content_type=ContentType.objects.get_for_model(content_object) if content_object else None,
            object_id=content_object.id if content_object else None
        )
        return notification

    @staticmethod
    def check_featured_listing_expiry():
        """Check for featured listings that are about to expire"""
        now = timezone.now()
        expiry_threshold = now + timedelta(days=3)  # Notify 3 days before expiry
        
        # Get featured listings that are about to expire and haven't been notified
        featured_listings = FeaturedListing.objects.filter(
            Q(end_date__lte=expiry_threshold) & Q(end_date__gt=now),
            is_active=True,
            transaction__status='completed'
        ).select_related('car', 'car__seller')
        
        for listing in featured_listings:
            days_left = (listing.end_date - now).days
            
            # Check if we already sent a notification for this expiry
            existing_notification = Notification.objects.filter(
                user=listing.car.seller,
                notification_type='featured_expiry',
                content_type=ContentType.objects.get_for_model(listing),
                object_id=listing.id,
                created_at__gte=now - timedelta(days=1)  # Don't send more than once per day
            ).exists()
            
            if not existing_notification:
                NotificationService.create_notification(
                    user=listing.car.seller,
                    notification_type='featured_expiry',
                    title='Featured Listing Expiring Soon',
                    message=f'Your featured listing for {listing.car} will expire in {days_left} days. '
                           f'Renew now to maintain premium visibility.',
                    content_object=listing
                )

    @staticmethod
    def get_unread_notifications(user):
        """Get unread notifications for a user"""
        return Notification.objects.filter(
            user=user,
            is_read=False
        ).order_by('-created_at')

    @staticmethod
    def mark_all_as_read(user):
        """Mark all notifications as read for a user"""
        Notification.objects.filter(
            user=user,
            is_read=False
        ).update(is_read=True)

    @staticmethod
    def get_unread_count(user):
        """Get count of unread notifications for a user"""
        return Notification.objects.filter(
            user=user,
            is_read=False
        ).count()
