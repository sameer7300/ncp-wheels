from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'cars', views.CarViewSet)

app_name = 'cars'

urlpatterns = [
    path('api/', include(router.urls)),
    path('', views.CarListView.as_view(), name='car-list'),
    path('my-listings/', views.SellerDashboardView.as_view(), name='my-listings'),
    path('dashboard/', views.SellerDashboardView.as_view(), name='seller-dashboard'),
    path('create/', views.CarCreateView.as_view(), name='create'),
    path('<int:pk>/update/', views.CarUpdateView.as_view(), name='update'),
    path('<int:pk>/toggle-status/', views.ToggleCarStatusView.as_view(), name='toggle-status'),
    path('<int:pk>/', views.CarDetailView.as_view(), name='car-detail'),
    path('<int:pk>/feature/', views.FeaturedListingView.as_view(), name='feature'),
]
