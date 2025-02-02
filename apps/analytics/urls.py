from django.urls import path
from . import views

app_name = 'analytics'

urlpatterns = [
    path(
        'featured-listing/<int:pk>/analytics/',
        views.FeaturedListingAnalyticsView.as_view(),
        name='featured-listing-analytics'
    ),
    path(
        'featured-listing/<int:pk>/track-interaction/',
        views.TrackInteractionView.as_view(),
        name='track-interaction'
    ),
    path(
        'featured-listing/<int:pk>/analytics/data/',
        views.AnalyticsDataAPIView.as_view(),
        name='analytics-data'
    ),
]
