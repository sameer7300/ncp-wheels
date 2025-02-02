from abc import ABC, abstractmethod
from typing import Dict, Any

class PaymentGateway(ABC):
    """Base class for all payment gateways"""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.initialize()
    
    @abstractmethod
    def initialize(self):
        """Initialize the payment gateway with configuration"""
        pass
    
    @abstractmethod
    def initialize_payment(
        self,
        amount: float,
        payment_id: str,
        callback_url: str,
        description: str = None,
    ) -> Dict[str, Any]:
        """Initialize a payment and return the necessary information
        
        Returns:
            Dict containing:
            - redirect_url: URL to redirect user for payment
            - Any additional gateway-specific data
        """
        pass
    
    @abstractmethod
    def verify_payment(self, payment_id: str) -> str:
        """Verify the payment status
        
        Returns:
            Payment status string: 'completed', 'pending', or 'failed'
        """
        pass
    
    @abstractmethod
    def process_webhook(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Process webhook data from the payment gateway
        
        Returns:
            Dict containing processed webhook data and payment status
        """
        pass
