from rest_framework import serializers
from .models import Car, CarImage, FeaturedListing
from apps.users.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'first_name', 'last_name', 'email', 'phone_number',
                 'profile_picture', 'bio', 'location', 'facebook', 'twitter', 'instagram',
                 'is_dealer', 'business_name', 'business_address', 'business_registration_number',
                 'is_verified')
        read_only_fields = ('is_verified',)

class CarImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = CarImage
        fields = ('id', 'image', 'is_primary', 'created_at')

class CarSerializer(serializers.ModelSerializer):
    seller = UserSerializer(read_only=True)
    images = CarImageSerializer(many=True, read_only=True)
    uploaded_images = serializers.ListField(
        child=serializers.ImageField(),
        write_only=True,
        required=False
    )
    
    class Meta:
        model = Car
        fields = ('id', 'seller', 'make', 'model', 'year', 'price', 'mileage',
                 'fuel_type', 'transmission', 'color', 'description', 'condition',
                 'features', 'location', 'is_active', 'images', 'uploaded_images',
                 'created_at', 'updated_at')
        read_only_fields = ('seller', 'is_active')
    
    def create(self, validated_data):
        uploaded_images = validated_data.pop('uploaded_images', [])
        car = Car.objects.create(**validated_data)
        
        for i, image in enumerate(uploaded_images):
            CarImage.objects.create(
                car=car,
                image=image,
                is_primary=(i == 0)  # First image is primary
            )
        
        return car

class FeaturedListingSerializer(serializers.ModelSerializer):
    car = CarSerializer(read_only=True)
    car_id = serializers.PrimaryKeyRelatedField(
        queryset=Car.objects.all(),
        write_only=True,
        source='car'
    )
    
    class Meta:
        model = FeaturedListing
        fields = ('id', 'car', 'car_id', 'start_date', 'end_date', 'amount_paid',
                 'payment_status', 'transaction_id', 'created_at', 'updated_at')
        read_only_fields = ('start_date', 'end_date', 'amount_paid',
                          'payment_status', 'transaction_id')
