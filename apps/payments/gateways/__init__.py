from abc import ABC, abstractmethod
from typing import Dict, Any

class PaymentGateway(ABC):
    """Abstract base class for payment gateways"""
    
    @abstractmethod
    def initialize_payment(self, amount: float, currency: str = 'PKR', **kwargs) -> Dict[str, Any]:
        """Initialize a payment and return necessary data for the frontend"""
        pass
    
    @abstractmethod
    def verify_payment(self, payment_data: Dict[str, Any]) -> Dict[str, Any]:
        """Verify a payment using gateway-specific data"""
        pass
    
    @abstractmethod
    def process_webhook(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process webhook notifications from the payment gateway"""
        pass
