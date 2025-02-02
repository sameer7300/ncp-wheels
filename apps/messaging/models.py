from django.db import models
from django.conf import settings
from django.utils import timezone
from django.urls import reverse
from apps.cars.models import Car

class Conversation(models.Model):
    """A conversation between a buyer and a seller about a car"""
    car = models.ForeignKey(
        Car,
        on_delete=models.CASCADE,
        related_name='conversations'
    )
    buyer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='buyer_conversations'
    )
    seller = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='seller_conversations'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_archived = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-updated_at']
        indexes = [
            models.Index(fields=['buyer', '-updated_at']),
            models.Index(fields=['seller', '-updated_at']),
            models.Index(fields=['car', '-updated_at']),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=['car', 'buyer', 'seller'],
                name='unique_conversation'
            )
        ]
    
    def __str__(self):
        return f"Conversation about {self.car} between {self.buyer} and {self.seller}"
    
    def get_absolute_url(self):
        return reverse('messaging:conversation-detail', kwargs={'pk': self.pk})
    
    def get_messages(self):
        """Get all messages in this conversation"""
        return self.messages.all()
    
    def get_unread_count(self, user):
        """Get count of unread messages for a user"""
        return self.messages.filter(
            read_by__isnull=True
        ).exclude(sender=user).count()
    
    def mark_read(self, user):
        """Mark all messages as read for a user"""
        unread_messages = self.messages.filter(
            read_by__isnull=True
        ).exclude(sender=user)
        
        for message in unread_messages:
            message.read_by = user
            message.read_at = timezone.now()
            message.save()

class Message(models.Model):
    """A message within a conversation"""
    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name='messages'
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='sent_messages'
    )
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    read_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='read_messages'
    )
    read_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['conversation', 'created_at']),
            models.Index(fields=['sender', 'created_at']),
            models.Index(fields=['read_by', 'read_at']),
        ]
    
    def __str__(self):
        return f"Message from {self.sender} in {self.conversation}"
    
    def mark_read(self, user):
        """Mark message as read by user"""
        if not self.read_by and self.sender != user:
            self.read_by = user
            self.read_at = timezone.now()
            self.save()
