from django.urls import path
from . import views

app_name = 'notifications'

urlpatterns = [
    path('', views.NotificationListView.as_view(), name='notification-list'),
    path('<int:pk>/mark-read/', views.MarkNotificationReadView.as_view(), name='mark-read'),
    path('mark-all-read/', views.MarkAllNotificationsReadView.as_view(), name='mark-all-read'),
    path('unread-count/', views.UnreadNotificationCountView.as_view(), name='unread-count'),
]
