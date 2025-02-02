from typing import Optional, Dict, Any
from django.utils import timezone
from django.db.models import F
from django.contrib.auth import get_user_model
from .models import (
    FeaturedListingAnalytics,
    FeaturedListingView,
    FeaturedListingInteraction,
    DailyAnalytics
)
from apps.cars.models import FeaturedListing

User = get_user_model()

class AnalyticsService:
    """Service class to handle analytics tracking"""
    
    @classmethod
    def track_listing_view(
        cls,
        featured_listing: FeaturedListing,
        ip_address: str,
        user_agent: str,
        user: Optional[User] = None
    ) -> None:
        """Track a view of a featured listing"""
        
        # Get or create analytics record
        analytics, _ = FeaturedListingAnalytics.objects.get_or_create(
            featured_listing=featured_listing
        )
        
        # Create view record
        FeaturedListingView.objects.create(
            featured_listing=featured_listing,
            viewer=user,
            ip_address=ip_address,
            user_agent=user_agent
        )
        
        # Update analytics counters
        analytics.views = F('views') + 1
        
        # Check if this is a unique view (by IP in last 24 hours)
        last_24h = timezone.now() - timezone.timedelta(hours=24)
        is_unique = not FeaturedListingView.objects.filter(
            featured_listing=featured_listing,
            ip_address=ip_address,
            timestamp__gte=last_24h
        ).exists()
        
        if is_unique:
            analytics.unique_views = F('unique_views') + 1
        
        analytics.save()
        
        # Update daily analytics
        today = timezone.now().date()
        daily_analytics, _ = DailyAnalytics.objects.get_or_create(
            featured_listing=featured_listing,
            date=today,
            defaults={
                'views': 1,
                'unique_views': 1 if is_unique else 0
            }
        )
        
        if not _:  # If record already existed
            daily_analytics.views = F('views') + 1
            if is_unique:
                daily_analytics.unique_views = F('unique_views') + 1
            daily_analytics.save()
    
    @classmethod
    def track_interaction(
        cls,
        featured_listing: FeaturedListing,
        interaction_type: str,
        ip_address: str,
        user_agent: str,
        user: Optional[User] = None
    ) -> None:
        """Track an interaction with a featured listing"""
        
        # Create interaction record
        FeaturedListingInteraction.objects.create(
            featured_listing=featured_listing,
            user=user,
            interaction_type=interaction_type,
            ip_address=ip_address,
            user_agent=user_agent
        )
        
        # Update analytics counters
        analytics, _ = FeaturedListingAnalytics.objects.get_or_create(
            featured_listing=featured_listing
        )
        
        if interaction_type == 'contact':
            analytics.contact_clicks = F('contact_clicks') + 1
        elif interaction_type == 'whatsapp':
            analytics.whatsapp_clicks = F('whatsapp_clicks') + 1
        elif interaction_type == 'call':
            analytics.call_clicks = F('call_clicks') + 1
        
        analytics.save()
        
        # Update daily analytics
        today = timezone.now().date()
        daily_analytics, _ = DailyAnalytics.objects.get_or_create(
            featured_listing=featured_listing,
            date=today
        )
        
        if interaction_type == 'contact':
            daily_analytics.contact_clicks = F('contact_clicks') + 1
        elif interaction_type == 'whatsapp':
            daily_analytics.whatsapp_clicks = F('whatsapp_clicks') + 1
        elif interaction_type == 'call':
            daily_analytics.call_clicks = F('call_clicks') + 1
        
        daily_analytics.save()
    
    @classmethod
    def get_listing_analytics(
        cls,
        featured_listing: FeaturedListing,
        days: int
    ) -> Dict[str, Any]:
        """Get analytics for a featured listing for the specified number of days"""
        
        end_date = timezone.now().date()
        start_date = end_date - timezone.timedelta(days=days)
        
        # Get daily analytics for the period
        daily_stats = DailyAnalytics.objects.filter(
            featured_listing=featured_listing,
            date__gte=start_date,
            date__lte=end_date
        ).order_by('date')
        
        # Calculate totals
        total_views = sum(stat.views for stat in daily_stats)
        total_unique_views = sum(stat.unique_views for stat in daily_stats)
        total_contact_clicks = sum(stat.contact_clicks for stat in daily_stats)
        total_whatsapp_clicks = sum(stat.whatsapp_clicks for stat in daily_stats)
        total_call_clicks = sum(stat.call_clicks for stat in daily_stats)
        
        # Calculate engagement rate
        engagement_rate = 0
        if total_views > 0:
            total_interactions = total_contact_clicks + total_whatsapp_clicks + total_call_clicks
            engagement_rate = (total_interactions / total_views) * 100
            
        # Get daily breakdown
        daily_breakdown = [{
            'date': stat.date.strftime('%Y-%m-%d'),
            'views': stat.views,
            'unique_views': stat.unique_views,
            'contact_clicks': stat.contact_clicks,
            'whatsapp_clicks': stat.whatsapp_clicks,
            'call_clicks': stat.call_clicks,
        } for stat in daily_stats]
        
        return {
            'period_days': days,
            'start_date': start_date.strftime('%Y-%m-%d'),
            'end_date': end_date.strftime('%Y-%m-%d'),
            'total_views': total_views,
            'total_unique_views': total_unique_views,
            'total_contact_clicks': total_contact_clicks,
            'total_whatsapp_clicks': total_whatsapp_clicks,
            'total_call_clicks': total_call_clicks,
            'engagement_rate': round(engagement_rate, 2),
            'daily_breakdown': daily_breakdown,
            'performance_indicators': {
                'avg_daily_views': round(total_views / days if days > 0 else 0, 2),
                'avg_daily_interactions': round((total_contact_clicks + total_whatsapp_clicks + total_call_clicks) / days if days > 0 else 0, 2),
                'unique_view_rate': round((total_unique_views / total_views * 100) if total_views > 0 else 0, 2),
            }
        }
