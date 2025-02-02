from django.shortcuts import render
from django.views.generic import TemplateView, View
from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone
from apps.cars.models import Car, FeaturedListing
from .services import AnalyticsService
from .models import FeaturedListingAnalytics, DailyAnalytics

# Create your views here.

class FeaturedListingAnalyticsView(LoginRequiredMixin, TemplateView):
    """View for displaying featured listing analytics"""
    template_name = 'analytics/featured_listing_analytics.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        featured_listing = get_object_or_404(
            FeaturedListing,
            car__seller=self.request.user,
            pk=self.kwargs['pk']
        )
        
        # Get time period from query params, default to 7 days
        period = self.request.GET.get('period', '7')
        period_map = {
            '7': 7,
            '14': 14,
            '30': 30
        }
        days = period_map.get(period, 7)
        
        # Get analytics data for the selected period
        analytics_data = AnalyticsService.get_listing_analytics(
            featured_listing=featured_listing,
            days=days
        )
        
        context.update({
            'featured_listing': featured_listing,
            'analytics': analytics_data,
            'selected_period': period,
            'periods': [
                {'value': '7', 'label': '7 Days'},
                {'value': '14', 'label': '14 Days'},
                {'value': '30', 'label': '30 Days'},
            ]
        })
        return context

class TrackInteractionView(View):
    """API view to track user interactions with featured listings"""
    
    def post(self, request, *args, **kwargs):
        featured_listing = get_object_or_404(
            FeaturedListing,
            pk=kwargs['pk'],
            is_active=True
        )
        
        interaction_type = request.POST.get('type')
        if interaction_type not in ['contact', 'whatsapp', 'call', 'share']:
            return JsonResponse({'error': 'Invalid interaction type'}, status=400)
        
        AnalyticsService.track_interaction(
            featured_listing=featured_listing,
            interaction_type=interaction_type,
            ip_address=request.META.get('REMOTE_ADDR', ''),
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
            user=request.user if request.user.is_authenticated else None
        )
        
        return JsonResponse({'status': 'success'})

class AnalyticsDataAPIView(LoginRequiredMixin, View):
    """API view to get analytics data for different time periods"""
    
    def get(self, request, *args, **kwargs):
        featured_listing = get_object_or_404(
            FeaturedListing,
            car__seller=request.user,
            pk=kwargs['pk']
        )
        
        period = request.GET.get('period', '7')
        period_map = {
            '7': 7,
            '14': 14,
            '30': 30
        }
        days = period_map.get(period, 7)
        
        analytics_data = AnalyticsService.get_listing_analytics(
            featured_listing=featured_listing,
            days=days
        )
        
        return JsonResponse(analytics_data)
