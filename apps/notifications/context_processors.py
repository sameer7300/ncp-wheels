from .services import NotificationService

def notification_context(request):
    """Add unread notification count to context"""
    if request.user.is_authenticated:
        unread_notification_count = NotificationService.get_unread_count(request.user)
    else:
        unread_notification_count = 0
    
    return {
        'unread_notification_count': unread_notification_count
    }
