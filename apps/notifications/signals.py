from django.db.models.signals import post_save
from django.dispatch import receiver
from apps.cars.models import FeaturedListing
from apps.messaging.models import Message
from .services import NotificationService

@receiver(post_save, sender=FeaturedListing)
def featured_listing_created(sender, instance, created, **kwargs):
    """Create notification when a featured listing is created"""
    if created and instance.is_active:
        NotificationService.create_notification(
            user=instance.car.seller,
            notification_type='featured_expiry',
            title='Featured Listing Active',
            message=f'Your listing for {instance.car} is now featured! It will remain featured until {instance.end_date.strftime("%B %d, %Y")}.',
            content_object=instance
        )

@receiver(post_save, sender=Message)
def message_created(sender, instance, created, **kwargs):
    """Create notification when a new message is received"""
    if created:
        # Get the recipient (the other user in the conversation)
        recipient = instance.conversation.seller if instance.sender == instance.conversation.buyer else instance.conversation.buyer
        
        NotificationService.create_notification(
            user=recipient,
            notification_type='message',
            title='New Message',
            message=f'You have a new message from {instance.sender} about {instance.conversation.car}',
            content_object=instance
        )
