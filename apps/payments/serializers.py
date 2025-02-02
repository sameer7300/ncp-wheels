from rest_framework import serializers
from .models import Transaction, FeaturedListingFee

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ('id', 'user', 'amount', 'currency', 'payment_method',
                 'status', 'transaction_type', 'reference_id', 'description',
                 'created_at', 'updated_at', 'completed_at')
        read_only_fields = ('user', 'status', 'reference_id', 'completed_at')

class FeaturedListingFeeSerializer(serializers.ModelSerializer):
    duration_display = serializers.CharField(source='get_duration_days_display', read_only=True)
    
    class Meta:
        model = FeaturedListingFee
        fields = ('id', 'duration_days', 'duration_display', 'amount',
                 'is_active', 'description', 'created_at', 'updated_at')
        read_only_fields = ('is_active',)
