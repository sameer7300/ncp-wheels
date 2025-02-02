from typing import Any, Callable
from django.http import HttpRequest, HttpResponse
from django.urls import resolve
from apps.cars.models import Car, FeaturedListing
from .services import AnalyticsService

class AnalyticsMiddleware:
    """Middleware to track analytics for featured listings"""
    
    def __init__(self, get_response: Callable):
        self.get_response = get_response
    
    def __call__(self, request: HttpRequest) -> HttpResponse:
        response = self.get_response(request)
        
        try:
            # Only process if it's a car detail view
            resolved = resolve(request.path)
            if resolved.app_name == 'cars' and resolved.url_name == 'car-detail':
                car_id = resolved.kwargs.get('pk')
                if car_id:
                    # Check if this car has a featured listing
                    featured_listing = FeaturedListing.objects.filter(
                        car_id=car_id,
                        is_active=True
                    ).first()
                    
                    if featured_listing:
                        # Track the view
                        AnalyticsService.track_listing_view(
                            featured_listing=featured_listing,
                            ip_address=self.get_client_ip(request),
                            user_agent=request.META.get('HTTP_USER_AGENT', ''),
                            user=request.user if request.user.is_authenticated else None
                        )
        except:
            # Don't let analytics tracking break the application
            pass
        
        return response
    
    def get_client_ip(self, request: HttpRequest) -> str:
        """Get the client's IP address from the request"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0]
        return request.META.get('REMOTE_ADDR', '')
