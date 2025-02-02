from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic import ListView, DetailView, CreateView, View
from django.http import JsonResponse
from django.urls import reverse_lazy
from django.utils import timezone
from django.db.models import Q, Max, Count, F, Value
from django.db.models.functions import Coalesce
from .models import Conversation, Message
from apps.cars.models import Car

class ConversationListView(LoginRequiredMixin, ListView):
    """Display list of conversations for the current user"""
    model = Conversation
    template_name = 'messaging/conversation_list.html'
    context_object_name = 'conversations'
    
    def get_queryset(self):
        """Get conversations where user is either buyer or seller"""
        return Conversation.objects.filter(
            Q(buyer=self.request.user) | Q(seller=self.request.user)
        ).annotate(
            unread_count=Count(
                'messages',
                filter=Q(messages__read_by__isnull=True) & ~Q(messages__sender=self.request.user)
            ),
            other_user=F('seller') if F('buyer') == self.request.user else F('buyer'),
            last_message_time=Max('messages__created_at')
        ).order_by('-last_message_time')

class ConversationDetailView(LoginRequiredMixin, DetailView):
    """Display a conversation and its messages"""
    model = Conversation
    template_name = 'messaging/conversation_detail.html'
    context_object_name = 'conversation'
    
    def get_queryset(self):
        """Ensure user is part of the conversation"""
        return Conversation.objects.filter(
            Q(buyer=self.request.user) | Q(seller=self.request.user)
        )
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        # Mark messages as read
        self.object.mark_read(self.request.user)
        return context

class StartConversationView(LoginRequiredMixin, CreateView):
    """Start a new conversation about a car"""
    model = Conversation
    template_name = 'messaging/start_conversation.html'
    fields = []  # No fields needed as we'll set them in form_valid
    
    def dispatch(self, request, *args, **kwargs):
        """Get the car and ensure user is not the seller"""
        self.car = get_object_or_404(Car, pk=self.kwargs['car_pk'])
        if self.car.seller == request.user:
            if request.method == 'GET':
                return redirect(self.car.get_absolute_url())
            return JsonResponse({
                'error': 'You cannot start a conversation about your own car'
            }, status=400)
        return super().dispatch(request, *args, **kwargs)
    
    def get_context_data(self, **kwargs):
        """Add car to context"""
        context = super().get_context_data(**kwargs)
        context['car'] = self.car
        return context
    
    def form_valid(self, form):
        """Create conversation and first message"""
        # Check if conversation already exists
        existing_conversation = Conversation.objects.filter(
            car=self.car,
            buyer=self.request.user,
            seller=self.car.seller
        ).first()
        
        if existing_conversation:
            Message.objects.create(
                conversation=existing_conversation,
                sender=self.request.user,
                content=self.request.POST.get('message', '')
            )
            return JsonResponse({
                'status': 'success',
                'redirect_url': existing_conversation.get_absolute_url()
            })
        
        # Create new conversation
        conversation = form.save(commit=False)
        conversation.car = self.car
        conversation.buyer = self.request.user
        conversation.seller = self.car.seller
        conversation.save()
        
        # Create initial message
        Message.objects.create(
            conversation=conversation,
            sender=self.request.user,
            content=self.request.POST.get('message', '')
        )
        
        return JsonResponse({
            'status': 'success',
            'redirect_url': conversation.get_absolute_url()
        })

class SendMessageView(LoginRequiredMixin, View):
    """Send a new message in a conversation"""
    
    def post(self, request, *args, **kwargs):
        conversation = get_object_or_404(
            Conversation,
            Q(buyer=request.user) | Q(seller=request.user),
            pk=kwargs['pk']
        )
        
        content = request.POST.get('content', '').strip()
        if not content:
            return JsonResponse({
                'error': 'Message content cannot be empty'
            }, status=400)
        
        message = Message.objects.create(
            conversation=conversation,
            sender=request.user,
            content=content
        )
        
        # Update conversation timestamp
        conversation.updated_at = timezone.now()
        conversation.save()
        
        return JsonResponse({
            'status': 'success',
            'message': {
                'id': message.id,
                'content': message.content,
                'sender': request.user.get_full_name() or request.user.email,
                'created_at': message.created_at.isoformat(),
                'is_sender': True
            }
        })

class ArchiveConversationView(LoginRequiredMixin, View):
    """Archive/Unarchive a conversation"""
    
    def post(self, request, *args, **kwargs):
        conversation = get_object_or_404(
            Conversation,
            Q(buyer=request.user) | Q(seller=request.user),
            pk=kwargs['pk']
        )
        
        conversation.is_archived = not conversation.is_archived
        conversation.save()
        
        return JsonResponse({
            'status': 'success',
            'is_archived': conversation.is_archived
        })

class UnreadCountView(LoginRequiredMixin, View):
    """Get count of unread messages for the current user"""
    
    def get(self, request, *args, **kwargs):
        unread_count = Message.objects.filter(
            Q(conversation__buyer=request.user) | Q(conversation__seller=request.user),
            read_by__isnull=True
        ).exclude(sender=request.user).count()
        
        return JsonResponse({
            'unread_count': unread_count
        })
