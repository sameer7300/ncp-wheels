from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.text import slugify
from django.utils import timezone
from django.urls import reverse
import uuid
import random

class Car(models.Model):
    CONDITION_CHOICES = (
        ('new', 'New'),
        ('used', 'Used'),
    )
    
    TRANSMISSION_CHOICES = (
        ('automatic', 'Automatic'),
        ('manual', 'Manual'),
        ('cvt', 'CVT'),
    )
    
    FUEL_TYPE_CHOICES = (
        ('petrol', 'Petrol'),
        ('diesel', 'Diesel'),
        ('hybrid', 'Hybrid'),
        ('electric', 'Electric'),
        ('cng', 'CNG'),
    )
    
    BODY_TYPE_CHOICES = (
        ('sedan', 'Sedan'),
        ('hatchback', 'Hatchback'),
        ('suv', 'SUV'),
        ('crossover', 'Crossover'),
        ('coupe', 'Coupe'),
        ('convertible', 'Convertible'),
        ('wagon', 'Wagon'),
        ('van', 'Van'),
        ('truck', 'Truck'),
    )
    
    COLOR_CHOICES = (
        ('black', 'Black'),
        ('white', 'White'),
        ('silver', 'Silver'),
        ('gray', 'Gray'),
        ('red', 'Red'),
        ('blue', 'Blue'),
        ('brown', 'Brown'),
        ('green', 'Green'),
        ('other', 'Other'),
    )

    BRAND_CHOICES = (
        ('toyota', 'Toyota'),
        ('honda', 'Honda'),
        ('suzuki', 'Suzuki'),
        ('nissan', 'Nissan'),
        ('hyundai', 'Hyundai'),
        ('kia', 'Kia'),
        ('mercedes', 'Mercedes'),
        ('bmw', 'BMW'),
        ('audi', 'Audi'),
        ('volkswagen', 'Volkswagen'),
        ('other', 'Other'),
    )
    
    PROVINCE_CHOICES = (
        ('punjab', 'Punjab'),
        ('sindh', 'Sindh'),
        ('kpk', 'Khyber Pakhtunkhwa'),
        ('balochistan', 'Balochistan'),
        ('gilgit', 'Gilgit-Baltistan'),
        ('ajk', 'Azad Kashmir'),
        ('islamabad', 'Islamabad Capital Territory'),
    )

    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('sold', 'Sold'),
        ('archived', 'Archived'),
    ]
    
    # Basic Information
    title = models.CharField(max_length=255, null=True, blank=True)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    description = models.TextField(null=True, blank=True)
    price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    condition = models.CharField(max_length=10, choices=CONDITION_CHOICES, default='used')
    year = models.PositiveIntegerField(validators=[MinValueValidator(1900), MaxValueValidator(2100)], default=2000)
    mileage = models.PositiveIntegerField(help_text="Mileage in kilometers", null=True, blank=True)
    
    # Technical Specifications
    brand = models.CharField(max_length=50, choices=BRAND_CHOICES, verbose_name='Brand', default='other')  
    model = models.CharField(max_length=100, default='Unknown')  
    transmission = models.CharField(max_length=20, choices=TRANSMISSION_CHOICES, default='manual')
    fuel_type = models.CharField(max_length=20, choices=FUEL_TYPE_CHOICES, default='petrol')
    engine_size = models.DecimalField(max_digits=4, decimal_places=1, help_text="Engine size in liters", null=True, blank=True)
    power = models.PositiveIntegerField(help_text="Engine power in horsepower", null=True, blank=True)
    
    # Physical Characteristics
    body_type = models.CharField(max_length=20, choices=BODY_TYPE_CHOICES, default='sedan')
    color = models.CharField(max_length=20, choices=COLOR_CHOICES, default='white')
    doors = models.PositiveSmallIntegerField(validators=[MinValueValidator(2), MaxValueValidator(6)], default=4)
    seats = models.PositiveSmallIntegerField(validators=[MinValueValidator(2), MaxValueValidator(10)], default=5)
    
    # Features and Equipment
    features = models.ManyToManyField('CarFeature', blank=True)
    
    # Location
    city = models.CharField(max_length=100, null=True, blank=True)
    province = models.CharField(max_length=100, choices=PROVINCE_CHOICES, null=True, blank=True)
    location_details = models.TextField(blank=True)
    
    # Listing Details
    seller = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='car_listings', null=True, blank=True)
    featured = models.BooleanField(default=False)
    featured_until = models.DateTimeField(null=True, blank=True)
    views = models.PositiveIntegerField(default=0)
    
    # Status and Dates
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    sold_at = models.DateTimeField(null=True, blank=True)
    
    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(f"{self.year} {self.brand} {self.model}")
            unique_slug = base_slug
            counter = 1
            while Car.objects.filter(slug=unique_slug).exists():
                unique_slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = unique_slug
        super().save(*args, **kwargs)

    def get_absolute_url(self):
        return reverse('cars:car-detail', kwargs={'pk': self.pk})

    def __str__(self):
        return f"{self.year} {self.brand} {self.model}"

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['brand', 'model', 'year']),
            models.Index(fields=['price']),
            models.Index(fields=['city', 'province']),
            models.Index(fields=['created_at']),
            models.Index(fields=['featured']),
        ]

class CarFeature(models.Model):
    CATEGORY_CHOICES = (
        ('safety', 'Safety'),
        ('comfort', 'Comfort'),
        ('entertainment', 'Entertainment'),
        ('performance', 'Performance'),
        ('exterior', 'Exterior'),
        ('interior', 'Interior'),
        ('other', 'Other'),
    )
    
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    description = models.TextField(blank=True)
    
    def __str__(self):
        return self.name

    class Meta:
        ordering = ['category', 'name']

class CarImage(models.Model):
    car = models.ForeignKey(Car, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='car_images/')
    is_primary = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Image for {self.car}"

    class Meta:
        ordering = ['order']

class PriceHistory(models.Model):
    car = models.ForeignKey(Car, on_delete=models.CASCADE, related_name='price_history')
    price = models.DecimalField(max_digits=12, decimal_places=2)
    date = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Price history for {self.car} - {self.price}"

    class Meta:
        ordering = ['-date']
        verbose_name_plural = "Price histories"

class FeaturedListing(models.Model):
    car = models.OneToOneField(Car, on_delete=models.CASCADE, related_name='featured_listing')
    start_date = models.DateTimeField(default=timezone.now)
    end_date = models.DateTimeField()
    transaction = models.OneToOneField('payments.Transaction', on_delete=models.CASCADE, related_name='featured_listing')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['is_active', '-start_date']),
            models.Index(fields=['end_date']),
        ]
    
    def save(self, *args, **kwargs):
        if not self.pk:  # Only on creation
            # Deactivate any existing featured listings for this car
            FeaturedListing.objects.filter(car=self.car).update(is_active=False)
            
            # Set end date based on the transaction's payment plan
            if not self.end_date and hasattr(self.transaction, 'payment_plan'):
                self.end_date = self.start_date + timezone.timedelta(days=self.transaction.payment_plan.duration_days)
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"Featured listing for {self.car}"

class SearchHistory(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='car_searches')
    query = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Search by {self.user} at {self.created_at}"

    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = "Search histories"
