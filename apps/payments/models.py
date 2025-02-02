from django.db import models
from django.conf import settings
from django.utils import timezone
import uuid

# Create your models here.

class Transaction(models.Model):
    PAYMENT_METHOD_CHOICES = [
        ('easypaisa', 'EasyPaisa'),
        ('jazzcash', 'JazzCash'),
        ('card', 'Credit/Debit Card'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    ]
    
    TRANSACTION_TYPE_CHOICES = [
        ('featured_listing', 'Featured Listing'),
        ('subscription', 'Subscription'),
        ('other', 'Other'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='transactions')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='PKR')
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPE_CHOICES)
    reference_id = models.CharField(max_length=100, unique=True)  # Payment gateway reference
    description = models.TextField(blank=True)
    metadata = models.JSONField(default=dict)  # For storing gateway-specific data
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['user', 'status']),
            models.Index(fields=['payment_method', 'status']),
        ]
    
    def __str__(self):
        return f"{self.get_payment_method_display()} - {self.amount} {self.currency}"
    
    def complete(self):
        self.status = 'completed'
        self.completed_at = timezone.now()
        self.save()

class PaymentGatewayConfig(models.Model):
    GATEWAY_CHOICES = [
        ('easypaisa', 'EasyPaisa'),
        ('bankalfalah', 'Bank Alfalah'),
    ]
    
    ENVIRONMENT_CHOICES = [
        ('sandbox', 'Sandbox'),
        ('production', 'Production'),
    ]
    
    gateway = models.CharField(max_length=20, choices=GATEWAY_CHOICES, unique=True)
    is_active = models.BooleanField(default=False)
    environment = models.CharField(max_length=20, choices=ENVIRONMENT_CHOICES, default='sandbox')
    config = models.JSONField(help_text='Gateway-specific configuration')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Payment Gateway Configuration'
        verbose_name_plural = 'Payment Gateway Configurations'
    
    def __str__(self):
        return f"{self.get_gateway_display()} ({self.get_environment_display()})"

class FeaturedListingFee(models.Model):
    DURATION_CHOICES = [
        (7, '7 Days'),
        (14, '14 Days'),
        (30, '30 Days'),
    ]
    
    duration_days = models.PositiveIntegerField(choices=DURATION_CHOICES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    is_active = models.BooleanField(default=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['duration_days']
    
    def __str__(self):
        return f"{self.get_duration_days_display()} - PKR {self.amount}"

class PaymentPlan(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    duration_days = models.PositiveIntegerField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} - {self.duration_days} days for PKR {self.price}"

class Payment(models.Model):
    PAYMENT_STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    )

    PAYMENT_METHOD_CHOICES = (
        ('easypaisa', 'EasyPaisa'),
        ('jazzcash', 'JazzCash'),
        ('card', 'Credit/Debit Card'),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES)
    status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    transaction_id = models.CharField(max_length=100, unique=True)
    payment_data = models.JSONField(default=dict)  # Stores payment gateway specific data
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Payment of PKR {self.amount} by {self.user.username} via {self.payment_method}"

class FeaturedListingPlan(models.Model):
    """Plans for featuring listings"""
    name = models.CharField(max_length=100)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    duration_days = models.PositiveIntegerField()
    priority_level = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} - {self.duration_days} days"

    class Meta:
        ordering = ['price', 'duration_days']

class FeaturedListingPayment(models.Model):
    """Payments for featuring listings"""
    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    car = models.ForeignKey('cars.Car', on_delete=models.CASCADE)
    plan = models.ForeignKey(FeaturedListingPlan, on_delete=models.PROTECT)
    payment_id = models.CharField(max_length=100, unique=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    gateway = models.CharField(max_length=50, default='easypaisa')
    gateway_response = models.JSONField(null=True, blank=True)
    start_date = models.DateTimeField(null=True, blank=True)
    end_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Payment {self.payment_id} for {self.car} by {self.user}"

    def activate_featured_listing(self):
        """Activate the featured listing after successful payment"""
        from apps.cars.models import FeaturedListing
        
        self.start_date = timezone.now()
        self.end_date = self.start_date + timezone.timedelta(days=self.plan.duration_days)
        self.save()

        # Create or update featured listing
        featured_listing, created = FeaturedListing.objects.update_or_create(
            car=self.car,
            defaults={
                'start_date': self.start_date,
                'end_date': self.end_date,
                'payment': self,
                'is_active': True
            }
        )
        
        return featured_listing

    class Meta:
        ordering = ['-created_at']

class PaymentGatewayCredential(models.Model):
    GATEWAY_CHOICES = (
        ('easypaisa', 'EasyPaisa'),
        ('jazzcash', 'JazzCash'),
        ('ubl', 'UBL'),
    )

    gateway = models.CharField(max_length=20, choices=GATEWAY_CHOICES, unique=True)
    merchant_id = models.CharField(max_length=100)
    api_key = models.CharField(max_length=100)
    api_secret = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)
    is_test_mode = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.gateway} {'(Test)' if self.is_test_mode else '(Production)'}"

    class Meta:
        verbose_name = "Payment Gateway Credential"
        verbose_name_plural = "Payment Gateway Credentials"
