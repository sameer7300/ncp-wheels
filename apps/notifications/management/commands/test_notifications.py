from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.notifications.services import NotificationService

User = get_user_model()

class Command(BaseCommand):
    help = 'Test notification system by creating a test notification'

    def handle(self, *args, **kwargs):
        # Get all users
        users = User.objects.all()
        
        if not users.exists():
            self.stdout.write(self.style.ERROR('No users found in the system'))
            return
        
        # Create a test notification for each user
        for user in users:
            NotificationService.create_notification(
                user=user,
                notification_type='system',
                title='Test Notification',
                message='This is a test notification to verify the notification system is working correctly.',
            )
            self.stdout.write(self.style.SUCCESS(f'Created test notification for user {user.username}'))
        
        self.stdout.write(self.style.SUCCESS('Successfully created test notifications'))
