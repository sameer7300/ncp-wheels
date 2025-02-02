from django import forms
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from .models import Car, CarFeature, CarImage
from .constants import CITIES_BY_PROVINCE

class MultipleFileInput(forms.ClearableFileInput):
    allow_multiple_selected = True

class MultipleFileField(forms.FileField):
    def __init__(self, *args, **kwargs):
        kwargs.setdefault("widget", MultipleFileInput())
        super().__init__(*args, **kwargs)

    def clean(self, data, initial=None):
        single_file_clean = super().clean
        if isinstance(data, (list, tuple)):
            result = [single_file_clean(d, initial) for d in data]
        else:
            result = single_file_clean(data, initial)
        return result

class CarSearchForm(forms.Form):
    # Basic Search
    keywords = forms.CharField(required=False, widget=forms.TextInput(attrs={
        'class': 'form-input rounded-md shadow-sm mt-1 block w-full',
        'placeholder': 'Search by brand, model, or description'
    }))
    
    # Price Range
    min_price = forms.DecimalField(required=False, widget=forms.NumberInput(attrs={
        'class': 'form-input rounded-md shadow-sm mt-1 block w-full',
        'placeholder': 'Minimum price'
    }))
    
    max_price = forms.DecimalField(required=False, widget=forms.NumberInput(attrs={
        'class': 'form-input rounded-md shadow-sm mt-1 block w-full',
        'placeholder': 'Maximum price'
    }))
    
    # Year Range
    min_year = forms.IntegerField(required=False, widget=forms.NumberInput(attrs={
        'class': 'form-input rounded-md shadow-sm mt-1 block w-full',
        'placeholder': 'From year'
    }))
    
    max_year = forms.IntegerField(required=False, widget=forms.NumberInput(attrs={
        'class': 'form-input rounded-md shadow-sm mt-1 block w-full',
        'placeholder': 'To year'
    }))
    
    # Location
    location = forms.CharField(required=False, widget=forms.TextInput(attrs={
        'class': 'form-input rounded-md shadow-sm mt-1 block w-full',
        'placeholder': 'Enter location'
    }))
    
    # Ordering
    ORDERING_CHOICES = [
        ('-created_at', 'Newest First'),
        ('price', 'Price: Low to High'),
        ('-price', 'Price: High to Low'),
        ('-year', 'Year: Newest First')
    ]
    
    ordering = forms.ChoiceField(
        choices=ORDERING_CHOICES,
        required=False,
        initial='-created_at',
        widget=forms.Select(attrs={
            'class': 'form-select rounded-md shadow-sm mt-1 block w-full'
        })
    )
    
    def clean(self):
        cleaned_data = super().clean()
        
        # Validate price range
        min_price = cleaned_data.get('min_price')
        max_price = cleaned_data.get('max_price')
        if min_price and max_price and min_price > max_price:
            raise forms.ValidationError('Minimum price cannot be greater than maximum price')
        
        # Validate year range
        min_year = cleaned_data.get('min_year')
        max_year = cleaned_data.get('max_year')
        if min_year and max_year and min_year > max_year:
            raise forms.ValidationError('Start year cannot be greater than end year')
        
        return cleaned_data

class CarForm(forms.ModelForm):
    images = MultipleFileField(
        required=False,
        widget=MultipleFileInput(attrs={
            'class': 'sr-only',
            'multiple': True,
            'accept': 'image/*'
        })
    )
    
    city = forms.ChoiceField(
        choices=[],
        required=True,
        widget=forms.Select(attrs={'class': 'form-select'})
    )
    
    features = forms.ModelMultipleChoiceField(
        queryset=CarFeature.objects.all().order_by('category', 'name'),
        required=False,
        widget=forms.CheckboxSelectMultiple(attrs={'class': 'form-checkbox'})
    )
    
    class Meta:
        model = Car
        exclude = ['seller', 'is_active', 'slug', 'created_at', 'updated_at', 'featured', 'featured_until', 'views', 'status', 'sold_at', 'title']
        
        widgets = {
            'brand': forms.Select(attrs={'class': 'form-select'}),
            'model': forms.TextInput(attrs={'class': 'form-input', 'placeholder': 'e.g. Civic'}),
            'year': forms.NumberInput(attrs={'class': 'form-input', 'placeholder': 'e.g. 2020'}),
            'condition': forms.Select(attrs={'class': 'form-select'}),
            'price': forms.NumberInput(attrs={'class': 'form-input', 'placeholder': 'e.g. 2500000'}),
            'mileage': forms.NumberInput(attrs={'class': 'form-input', 'placeholder': 'e.g. 50000'}),
            'body_type': forms.Select(attrs={'class': 'form-select'}),
            'color': forms.Select(attrs={'class': 'form-select'}),
            'transmission': forms.Select(attrs={'class': 'form-select'}),
            'fuel_type': forms.Select(attrs={'class': 'form-select'}),
            'engine_size': forms.NumberInput(attrs={'class': 'form-input', 'placeholder': 'e.g. 1800'}),
            'power': forms.NumberInput(attrs={'class': 'form-input', 'placeholder': 'e.g. 180'}),
            'doors': forms.NumberInput(attrs={'class': 'form-input', 'min': '2', 'max': '5'}),
            'seats': forms.NumberInput(attrs={'class': 'form-input', 'min': '2', 'max': '9'}),
            'province': forms.Select(attrs={'class': 'form-select'}),
            'location_details': forms.TextInput(attrs={'class': 'form-input', 'placeholder': 'e.g. Near City Center'}),
            'description': forms.Textarea(attrs={'class': 'form-textarea', 'rows': 4})
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        current_year = timezone.now().year
        
        # Add validators
        self.fields['year'].validators = [
            MinValueValidator(1900),
            MaxValueValidator(current_year + 1)
        ]
        self.fields['price'].validators = [MinValueValidator(0)]
        self.fields['mileage'].validators = [MinValueValidator(0)]
        self.fields['engine_size'].validators = [
            MinValueValidator(0),
            MaxValueValidator(10000)
        ]
        self.fields['power'].validators = [
            MinValueValidator(0),
            MaxValueValidator(2000)
        ]
        
        # Make important fields required
        required_fields = ['brand', 'model', 'year', 'condition', 'price',
                          'body_type', 'transmission', 'fuel_type',
                          'province', 'city']
        for field in required_fields:
            self.fields[field].required = True

        # Add help texts
        self.fields['engine_size'].help_text = 'Engine size in cc'
        self.fields['power'].help_text = 'Power in horsepower (HP)'
        self.fields['mileage'].help_text = 'Mileage in kilometers'
        self.fields['price'].help_text = 'Price in PKR'
        self.fields['description'].help_text = 'Provide a detailed description of your car, including its condition, history, and any special features.'
        self.fields['features'].help_text = 'Select all the features that your car has.'
        self.fields['location_details'].help_text = 'Provide specific location details to help buyers find your car.'
        
        # Set up city choices based on selected province
        province = self.data.get('province') or (self.instance.province if self.instance.pk else None)
        if province:
            self.fields['city'].choices = [(city, city) for city in CITIES_BY_PROVINCE.get(province, [])]
        else:
            self.fields['city'].choices = [('', 'Select a province first')]
        
        # Set initial city if editing
        if self.instance.pk and self.instance.city:
            self.fields['city'].initial = self.instance.city
        
    def clean_year(self):
        year = self.cleaned_data.get('year')
        current_year = 2025  # You might want to make this dynamic
        if year:
            if year < 1900 or year > current_year:
                raise forms.ValidationError(f'Year must be between 1900 and {current_year}')
        return year

    def clean_price(self):
        price = self.cleaned_data.get('price')
        if price and price < 0:
            raise forms.ValidationError('Price cannot be negative')
        return price

    def clean_mileage(self):
        mileage = self.cleaned_data.get('mileage')
        if mileage and mileage < 0:
            raise forms.ValidationError('Mileage cannot be negative')
        return mileage

    def clean_engine_size(self):
        engine_size = self.cleaned_data.get('engine_size')
        if engine_size and engine_size < 0:
            raise forms.ValidationError('Engine size cannot be negative')
        return engine_size

    def clean_power(self):
        power = self.cleaned_data.get('power')
        if power and power < 0:
            raise forms.ValidationError('Power cannot be negative')
        return power
