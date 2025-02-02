from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _
from phonenumber_field.modelfields import PhoneNumberField


class User(AbstractUser):
    phone_number = PhoneNumberField(_("Phone number"), blank=True)
    profile_picture = models.ImageField(upload_to='profile_pictures/', blank=True, null=True)
    bio = models.TextField(blank=True)
    location = models.CharField(max_length=255, blank=True)
    
    # Social media fields
    facebook = models.URLField(blank=True)
    twitter = models.URLField(blank=True)
    instagram = models.URLField(blank=True)
    
    # Business fields for dealers
    is_dealer = models.BooleanField(default=False)
    business_name = models.CharField(max_length=255, blank=True)
    business_address = models.TextField(blank=True)
    business_registration_number = models.CharField(max_length=100, blank=True)
    
    # Verification
    is_verified = models.BooleanField(default=False)
    verification_document = models.FileField(upload_to='verification_documents/', blank=True, null=True)
    
    class Meta:
        ordering = ['-date_joined']
        
    def __str__(self):
        return self.get_full_name() or self.username
