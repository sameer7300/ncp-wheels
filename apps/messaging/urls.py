from django.urls import path
from . import views

app_name = 'messaging'

urlpatterns = [
    path('conversations/', 
         views.ConversationListView.as_view(), 
         name='conversation-list'),
    
    path('conversations/<int:pk>/',
         views.ConversationDetailView.as_view(),
         name='conversation-detail'),
    
    path('cars/<int:car_pk>/start-conversation/',
         views.StartConversationView.as_view(),
         name='start-conversation'),
    
    path('conversations/<int:pk>/send-message/',
         views.SendMessageView.as_view(),
         name='send-message'),
    
    path('conversations/<int:pk>/archive/',
         views.ArchiveConversationView.as_view(),
         name='archive-conversation'),
         
    path('unread-count/',
         views.UnreadCountView.as_view(),
         name='unread-count'),
]
