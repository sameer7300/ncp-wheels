from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'payments'

# DRF Router
router = DefaultRouter()
router.register(r'transactions', views.TransactionViewSet)

urlpatterns = [
    # API endpoints
    path('api/', include(router.urls)),
    
    # Transaction views
    path('transactions/', views.TransactionListView.as_view(), name='transaction-list'),
    path('transactions/<int:pk>/', views.TransactionDetailView.as_view(), name='transaction-detail'),
    
    # Featured listing payment views
    path('featured-listing/<int:car_pk>/plans/', views.FeaturedListingPlansView.as_view(), name='featured-listing-plans'),
    path(
        'featured-listing/<int:car_pk>/initiate-payment/',
        views.InitiateFeaturedListingPaymentView.as_view(),
        name='initiate-featured-listing-payment'
    ),
    path(
        'featured-listing/verify/<str:payment_id>/',
        views.VerifyFeaturedListingPaymentView.as_view(),
        name='verify-featured-listing-payment'
    ),
    
    # Payment result views
    path('success/', views.PaymentSuccessView.as_view(), name='payment-success'),
    path('failed/', views.PaymentFailedView.as_view(), name='payment-failed'),
]
