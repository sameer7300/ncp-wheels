from django.shortcuts import render
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic import ListView, View
from django.http import JsonResponse
from .models import Notification
from .services import NotificationService

# Create your views here.

class NotificationListView(LoginRequiredMixin, ListView):
    """Display list of notifications for the current user"""
    model = Notification
    template_name = 'notifications/notification_list.html'
    context_object_name = 'notifications'
    paginate_by = 20
    
    def get_queryset(self):
        return Notification.objects.filter(
            user=self.request.user
        ).select_related('content_type').order_by('-created_at')

class MarkNotificationReadView(LoginRequiredMixin, View):
    """Mark a notification as read"""
    def post(self, request, pk):
        try:
            notification = Notification.objects.get(pk=pk, user=request.user)
            notification.mark_as_read()
            return JsonResponse({'status': 'success'})
        except Notification.DoesNotExist:
            return JsonResponse({'error': 'Notification not found'}, status=404)

class MarkAllNotificationsReadView(LoginRequiredMixin, View):
    """Mark all notifications as read"""
    def post(self, request):
        NotificationService.mark_all_as_read(request.user)
        return JsonResponse({'status': 'success'})

class UnreadNotificationCountView(LoginRequiredMixin, View):
    """Get count of unread notifications"""
    def get(self, request):
        count = NotificationService.get_unread_count(request.user)
        return JsonResponse({'count': count})
