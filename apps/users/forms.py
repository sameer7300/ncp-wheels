from django import forms
from django.contrib.auth.forms import UserCreationForm
from .models import User

class UserRegistrationForm(UserCreationForm):
    is_dealer = forms.BooleanField(
        required=False,
        label='Register as a Dealer',
        widget=forms.CheckboxInput(attrs={
            'class': 'form-checkbox h-4 w-4 text-primary-600',
            'x-model': 'isDealer'
        })
    )
    
    business_name = forms.CharField(
        required=False,
        widget=forms.TextInput(attrs={
            'class': 'form-input rounded-md shadow-sm mt-1 block w-full',
            'x-show': 'isDealer'
        })
    )
    
    business_address = forms.CharField(
        required=False,
        widget=forms.Textarea(attrs={
            'class': 'form-textarea rounded-md shadow-sm mt-1 block w-full',
            'rows': 3,
            'x-show': 'isDealer'
        })
    )
    
    business_registration_number = forms.CharField(
        required=False,
        widget=forms.TextInput(attrs={
            'class': 'form-input rounded-md shadow-sm mt-1 block w-full',
            'x-show': 'isDealer'
        })
    )
    
    class Meta:
        model = User
        fields = [
            'username', 'email', 'first_name', 'last_name', 'phone_number',
            'is_dealer', 'business_name', 'business_address', 'business_registration_number'
        ]
        
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field in self.fields.values():
            if not isinstance(field.widget, (forms.CheckboxInput, forms.Textarea)):
                field.widget.attrs.update({'class': 'form-input rounded-md shadow-sm mt-1 block w-full'})
                
    def clean(self):
        cleaned_data = super().clean()
        is_dealer = cleaned_data.get('is_dealer')
        
        if is_dealer:
            business_name = cleaned_data.get('business_name')
            business_address = cleaned_data.get('business_address')
            business_registration_number = cleaned_data.get('business_registration_number')
            
            if not business_name:
                self.add_error('business_name', 'Business name is required for dealers')
            if not business_address:
                self.add_error('business_address', 'Business address is required for dealers')
            if not business_registration_number:
                self.add_error('business_registration_number', 'Business registration number is required for dealers')
        
        return cleaned_data

class UserProfileForm(forms.ModelForm):
    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'email', 'phone_number',
            'profile_picture', 'bio', 'location',
            'facebook', 'twitter', 'instagram',
            'is_dealer', 'business_name', 'business_address', 'business_registration_number'
        ]
        
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field in self.fields.values():
            if isinstance(field.widget, (forms.TextInput, forms.EmailInput, forms.URLInput)):
                field.widget.attrs.update({'class': 'form-input rounded-md shadow-sm mt-1 block w-full'})
            elif isinstance(field.widget, forms.Textarea):
                field.widget.attrs.update({'class': 'form-textarea rounded-md shadow-sm mt-1 block w-full', 'rows': 3})
            elif isinstance(field.widget, forms.CheckboxInput):
                field.widget.attrs.update({'class': 'form-checkbox h-4 w-4 text-indigo-600'})
            elif isinstance(field.widget, forms.FileInput):
                field.widget.attrs.update({'class': 'form-input rounded-md shadow-sm mt-1 block w-full'})
