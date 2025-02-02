from typing import Dict, Any
from django.conf import settings
from django.utils import timezone
from .models import PaymentGatewayConfig, FeaturedListingPayment
from .gateways.easypaisa import EasyPaisaGateway
from .gateways.bankalfalah import BankAlfalahGateway
import uuid
import requests
import json
import logging

logger = logging.getLogger(__name__)

class PaymentService:
    """Service class to handle all payment-related operations"""
    
    GATEWAY_CLASSES = {
        'easypaisa': EasyPaisaGateway,
        'bankalfalah': BankAlfalahGateway,
    }
    
    @classmethod
    def get_gateway(cls, gateway_name: str):
        """Get initialized payment gateway instance"""
        try:
            config = PaymentGatewayConfig.objects.get(
                gateway=gateway_name,
                is_active=True
            )
            gateway_class = cls.GATEWAY_CLASSES.get(gateway_name)
            if not gateway_class:
                raise ValueError(f"Unsupported gateway: {gateway_name}")
            
            logger.info(f"Initializing gateway {gateway_name} with config: {config.config}")
            gateway = gateway_class(config.config)
            gateway.initialize()
            return gateway
            
        except PaymentGatewayConfig.DoesNotExist:
            raise ValueError(f"Gateway configuration not found: {gateway_name}")
        except Exception as e:
            logger.error(f"Error initializing gateway {gateway_name}: {str(e)}")
            raise
    
    @classmethod
    def create_featured_listing_payment(
        cls,
        payment: FeaturedListingPayment,
        callback_url: str,
    ) -> Dict[str, Any]:
        """Initialize payment with the payment gateway"""
        
        logger.info(f"Creating featured listing payment - Gateway: {payment.gateway}, Amount: {payment.amount}")
        
        # Get gateway instance
        gateway = cls.get_gateway(payment.gateway)
        
        # Generate a unique payment ID
        payment.payment_id = f"FL-{uuid.uuid4().hex[:8]}"
        payment.save()
        
        # Initialize payment with gateway
        try:
            gateway_response = gateway.initialize_payment(
                amount=float(payment.amount),  # Convert Decimal to float
                payment_id=payment.payment_id,
                callback_url=callback_url,
                description=f"Featured Listing: {payment.car.year} {payment.car.brand} {payment.car.model}"
            )
            
            logger.info(f"Gateway response for payment {payment.payment_id}: {gateway_response}")
            
            # Store gateway response
            payment.gateway_response = gateway_response
            payment.save()
            
            return {
                'status': 'success',
                'payment_id': payment.payment_id,
                'gateway': payment.gateway,
                'amount': float(payment.amount),
                'redirect_url': gateway_response.get('redirect_url'),
            }
            
        except Exception as e:
            logger.error(f"Payment initialization failed for {payment.payment_id}: {str(e)}")
            payment.status = 'failed'
            payment.save()
            raise ValueError(f"Payment initialization failed: {str(e)}")
    
    @classmethod
    def verify_payment(cls, payment: FeaturedListingPayment) -> bool:
        """Verify payment status with the gateway"""
        
        logger.info(f"Verifying payment {payment.payment_id} with gateway {payment.gateway}")
        
        # Get gateway instance
        gateway = cls.get_gateway(payment.gateway)
        
        try:
            # Check payment status with gateway
            status = gateway.verify_payment(payment.payment_id)
            
            logger.info(f"Payment {payment.payment_id} status: {status}")
            
            if status == 'completed':
                payment.status = 'completed'
                payment.save()
                return True
                
            elif status == 'failed':
                payment.status = 'failed'
                payment.save()
            
            return False
            
        except Exception as e:
            logger.error(f"Payment verification failed for {payment.payment_id}: {str(e)}")
            payment.status = 'failed'
            payment.save()
            return False
