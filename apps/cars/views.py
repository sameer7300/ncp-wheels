from django.shortcuts import render, get_object_or_404, redirect
from django.views.generic import ListView, DetailView, View, CreateView, UpdateView, TemplateView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.db.models import Q, Count
from django.urls import reverse, reverse_lazy
from django.contrib import messages
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.utils.decorators import method_decorator
from django.contrib.auth.decorators import login_required
from .models import Car, CarFeature, SearchHistory, FeaturedListing, CarImage
from .forms import CarSearchForm, CarForm
from .mixins import SellerRequiredMixin
from .serializers import CarSerializer, FeaturedListingSerializer
from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.payments.models import FeaturedListingFee, PaymentPlan, Payment, FeaturedListingPlan
from apps.payments.services import PaymentService
from decimal import Decimal
from .constants import CITIES_BY_PROVINCE
from django.utils import timezone
import json

# Create your views here.

class HomeView(TemplateView):
    template_name = 'home.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        
        # Get featured cars
        featured_listings = FeaturedListing.objects.filter(
            start_date__lte=timezone.now(),
            end_date__gte=timezone.now(),
            transaction__status='completed',
            is_active=True
        ).select_related('car').order_by('-created_at')
        
        context['featured_cars'] = [fl.car for fl in featured_listings if fl.car.is_active][:6]
        
        # Get recent cars
        context['recent_cars'] = Car.objects.filter(
            is_active=True
        ).order_by('-created_at')[:6]
        
        return context

class CarListView(ListView):
    model = Car
    template_name = 'cars/car_list.html'
    context_object_name = 'cars'
    paginate_by = 12
    
    def get_queryset(self):
        queryset = Car.objects.filter(is_active=True)
        form = CarSearchForm(self.request.GET)
        
        if form.is_valid():
            filters = Q()
            
            # Basic Search
            keywords = form.cleaned_data.get('keywords')
            if keywords:
                filters &= Q(title__icontains=keywords) | \
                         Q(description__icontains=keywords) | \
                         Q(brand__icontains=keywords) | \
                         Q(model__icontains=keywords)
            
            # Price Range
            min_price = form.cleaned_data.get('min_price')
            if min_price:
                filters &= Q(price__gte=min_price)
            
            max_price = form.cleaned_data.get('max_price')
            if max_price:
                filters &= Q(price__lte=max_price)
            
            # Year Range
            min_year = form.cleaned_data.get('min_year')
            if min_year:
                filters &= Q(year__gte=min_year)
            
            max_year = form.cleaned_data.get('max_year')
            if max_year:
                filters &= Q(year__lte=max_year)
            
            # Location
            location = form.cleaned_data.get('location')
            if location:
                filters &= Q(location__icontains=location)
            
            # Apply filters
            queryset = queryset.filter(filters)
        
        # Ordering
        ordering = self.request.GET.get('ordering', '-created_at')
        if ordering == 'price':
            queryset = queryset.order_by('price')
        elif ordering == '-price':
            queryset = queryset.order_by('-price')
        elif ordering == '-year':
            queryset = queryset.order_by('-year')
        else:
            queryset = queryset.order_by('-created_at')
        
        return queryset
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        
        # Get active featured listings
        now = timezone.now()
        featured_cars = Car.objects.filter(
            is_active=True,
            featured_listing__isnull=False,
            featured_listing__is_active=True,
            featured_listing__start_date__lte=now,
            featured_listing__end_date__gte=now
        ).order_by('-featured_listing__created_at')
        
        context['featured_cars'] = featured_cars
        context['search_form'] = CarSearchForm(self.request.GET)
        
        return context

class CarDetailView(DetailView):
    model = Car
    template_name = 'cars/car_detail.html'
    context_object_name = 'car'
    
    def get_object(self):
        car = super().get_object()
        car.views += 1
        car.save()
        return car
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['related_cars'] = Car.objects.filter(
            Q(brand=self.object.brand) | Q(model=self.object.model),
            is_active=True
        ).exclude(id=self.object.id)[:4]
        return context

class CarCreateView(LoginRequiredMixin, SellerRequiredMixin, CreateView):
    model = Car
    form_class = CarForm
    template_name = 'cars/car_form.html'
    success_url = reverse_lazy('cars:my-listings')
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['CITIES_BY_PROVINCE'] = json.dumps(CITIES_BY_PROVINCE)
        return context
    
    def get_form(self, form_class=None):
        form = super().get_form(form_class)
        form.fields['brand'].choices = Car.BRAND_CHOICES
        return form
    
    def form_valid(self, form):
        form.instance.seller = self.request.user
        response = super().form_valid(form)
        
        # Handle image uploads
        images = self.request.FILES.getlist('images')
        for index, image in enumerate(images):
            CarImage.objects.create(
                car=self.object,
                image=image,
                is_primary=(index == 0)  # First image is primary
            )
        
        messages.success(self.request, 'Your car listing has been created successfully!')
        return response

class CarUpdateView(LoginRequiredMixin, SellerRequiredMixin, UpdateView):
    model = Car
    form_class = CarForm
    template_name = 'cars/car_form.html'
    success_url = reverse_lazy('cars:my-listings')
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['CITIES_BY_PROVINCE'] = json.dumps(CITIES_BY_PROVINCE)
        if self.object:
            context['existing_images'] = self.object.images.all()
        return context
    
    def get_form(self, form_class=None):
        form = super().get_form(form_class)
        form.fields['brand'].choices = Car.BRAND_CHOICES
        return form
    
    def get_queryset(self):
        return Car.objects.filter(seller=self.request.user)
    
    def form_valid(self, form):
        response = super().form_valid(form)
        
        # Handle new image uploads
        images = self.request.FILES.getlist('images')
        existing_images = self.object.images.exists()
        
        for index, image in enumerate(images):
            CarImage.objects.create(
                car=self.object,
                image=image,
                is_primary=(not existing_images and index == 0)  # Only set as primary if no existing images
            )
        
        messages.success(self.request, 'Your car listing has been updated successfully!')
        return response

class SellerDashboardView(LoginRequiredMixin, SellerRequiredMixin, ListView):
    model = Car
    template_name = 'cars/seller_dashboard.html'
    context_object_name = 'cars'
    paginate_by = 10
    
    def get_queryset(self):
        return Car.objects.filter(seller=self.request.user).order_by('-created_at')
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        user_cars = Car.objects.filter(seller=self.request.user)
        context.update({
            'total_cars': user_cars.count(),
            'active_listings': user_cars.filter(is_active=True).count(),
            'sold_cars': user_cars.filter(status='sold').count(),
            'total_views': user_cars.aggregate(total_views=Count('views'))['total_views'] or 0,
            'featured_cars': user_cars.filter(featured=True).count()
        })
        return context

@method_decorator(login_required, name='dispatch')
class ToggleCarStatusView(SellerRequiredMixin, View):
    def post(self, request, pk):
        car = get_object_or_404(Car, pk=pk, seller=request.user)
        car.is_active = not car.is_active
        car.save()
        messages.success(request, f'Listing {"activated" if car.is_active else "deactivated"} successfully!')
        return redirect('cars:car-detail', pk=car.pk)

class CarViewSet(viewsets.ModelViewSet):
    queryset = Car.objects.all()
    serializer_class = CarSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['make', 'model', 'description', 'features', 'location']
    ordering_fields = ['price', 'year', 'created_at']
    
    def get_queryset(self):
        queryset = self.queryset
        
        # Filter active listings only for list action
        if self.action == 'list':
            queryset = queryset.filter(is_active=True)
        
        # Filter by seller for seller's own listings
        if self.request.user.is_authenticated and self.request.user.is_seller:
            seller_filter = Q(seller__user=self.request.user)
            if self.action == 'list':
                # For list action, show all active listings and seller's own listings
                queryset = queryset.filter(Q(is_active=True) | seller_filter)
            else:
                # For other actions, only show seller's own listings
                queryset = queryset.filter(seller_filter)
        
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(seller=self.request.user.sellerprofile)
    
    @action(detail=True, methods=['post'])
    def feature_listing(self, request, pk=None):
        car = self.get_object()
        duration_days = request.data.get('duration_days')
        payment_method = request.data.get('payment_method')
        
        try:
            # Create payment for featuring the listing
            payment_data = PaymentService.create_featured_listing_payment(
                car=car,
                duration_days=duration_days,
                payment_method=payment_method,
                mobile_number=request.data.get('mobile_number'),
                email=request.data.get('email'),
                callback_url=request.data.get('callback_url')
            )
            return Response(payment_data, status=status.HTTP_201_CREATED)
        except ValueError as e:
            return Response(
                {'detail': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class FeaturedListingViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = FeaturedListing.objects.filter(
        start_date__lte=timezone.now(),
        end_date__gte=timezone.now(),
        transaction__status='completed',
        is_active=True
    )
    serializer_class = FeaturedListingSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        car_id = self.request.query_params.get('car_id', None)
        if car_id:
            queryset = queryset.filter(car_id=car_id)
        return queryset

class FeaturedListingView(LoginRequiredMixin, DetailView):
    model = Car
    template_name = 'payments/featured_listing_plans.html'
    context_object_name = 'car'
    
    def get_queryset(self):
        return Car.objects.filter(seller=self.request.user)
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['plans'] = FeaturedListingPlan.objects.filter(is_active=True).order_by('price')
        return context

class CreateFeaturedPaymentView(LoginRequiredMixin, View):
    def post(self, request, slug, plan_id):
        try:
            car = Car.objects.get(slug=slug, seller=request.user)
            plan = PaymentPlan.objects.get(id=plan_id, is_active=True)
            
            # Create payment using payment service
            payment_data = PaymentService.create_featured_listing_payment(
                car=car,
                duration_days=plan.duration_days,
                payment_method=request.POST.get('payment_method'),
                mobile_number=request.POST.get('mobile_number'),
                email=request.user.email,
                callback_url=request.build_absolute_uri(
                    reverse('payments:payment_callback')
                )
            )
            
            # Redirect to payment gateway
            return redirect(payment_data['payment_data']['redirect_url'])
            
        except (Car.DoesNotExist, PaymentPlan.DoesNotExist) as e:
            messages.error(request, str(e))
            return redirect('cars:car-detail', slug=slug)
        except Exception as e:
            messages.error(request, f"Payment creation failed: {str(e)}")
            return redirect('cars:feature_listing', slug=slug)
