from django.db import models
from django.conf import settings
from django.utils import timezone
from apps.cars.models import Car, FeaturedListing

class FeaturedListingAnalytics(models.Model):
    """Analytics data for featured listings"""
    
    featured_listing = models.OneToOneField(
        FeaturedListing,
        on_delete=models.CASCADE,
        related_name='analytics'
    )
    views = models.PositiveIntegerField(default=0)
    unique_views = models.PositiveIntegerField(default=0)
    contact_clicks = models.PositiveIntegerField(default=0)
    whatsapp_clicks = models.PositiveIntegerField(default=0)
    call_clicks = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Featured Listing Analytics'
        verbose_name_plural = 'Featured Listing Analytics'
    
    def __str__(self):
        return f"Analytics for {self.featured_listing}"

class FeaturedListingView(models.Model):
    """Individual view records for featured listings"""
    
    featured_listing = models.ForeignKey(
        FeaturedListing,
        on_delete=models.CASCADE,
        related_name='view_records'
    )
    viewer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='featured_listing_views'
    )
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['featured_listing', 'timestamp']),
            models.Index(fields=['viewer', 'timestamp']),
        ]

class FeaturedListingInteraction(models.Model):
    """Track user interactions with featured listings"""
    
    INTERACTION_TYPES = [
        ('contact', 'Contact Button Click'),
        ('whatsapp', 'WhatsApp Click'),
        ('call', 'Call Button Click'),
        ('share', 'Share Button Click'),
    ]
    
    featured_listing = models.ForeignKey(
        FeaturedListing,
        on_delete=models.CASCADE,
        related_name='interactions'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='featured_listing_interactions'
    )
    interaction_type = models.CharField(max_length=20, choices=INTERACTION_TYPES)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['featured_listing', 'interaction_type', 'timestamp']),
            models.Index(fields=['user', 'interaction_type', 'timestamp']),
        ]

class DailyAnalytics(models.Model):
    """Daily aggregated analytics for featured listings"""
    
    featured_listing = models.ForeignKey(
        FeaturedListing,
        on_delete=models.CASCADE,
        related_name='daily_analytics'
    )
    date = models.DateField()
    views = models.PositiveIntegerField(default=0)
    unique_views = models.PositiveIntegerField(default=0)
    contact_clicks = models.PositiveIntegerField(default=0)
    whatsapp_clicks = models.PositiveIntegerField(default=0)
    call_clicks = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Daily Analytics'
        verbose_name_plural = 'Daily Analytics'
        unique_together = ['featured_listing', 'date']
        ordering = ['-date']
        indexes = [
            models.Index(fields=['featured_listing', 'date']),
        ]
    
    def __str__(self):
        return f"Analytics for {self.featured_listing} on {self.date}"
