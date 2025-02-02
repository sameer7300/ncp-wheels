from typing import Dict, Any
import requests
from .base import PaymentGateway

class UBLGateway(PaymentGateway):
    """UBL payment gateway implementation for credit/debit cards"""
    
    def initialize(self):
        """Initialize UBL gateway with credentials"""
        self.merchant_id = self.config.get('merchant_id')
        self.api_key = self.config.get('api_key')
        self.api_secret = self.config.get('api_secret')
        self.is_sandbox = self.config.get('environment', 'sandbox') == 'sandbox'
        self.base_url = (
            'https://sandbox.ubl.com.pk/api' if self.is_sandbox
            else 'https://payments.ubl.com.pk/api'
        )
    
    def create_payment(self, amount: float, currency: str = 'PKR', **kwargs) -> Dict[str, Any]:
        """Create a payment request with UBL"""
        endpoint = f"{self.base_url}/payments/create"
        
        payload = {
            'merchant_id': self.merchant_id,
            'amount': amount,
            'currency': currency,
            'order_id': kwargs.get('order_id'),
            'customer_email': kwargs.get('email'),
            'customer_name': kwargs.get('name'),
            'card_number': kwargs.get('card_number'),
            'expiry_month': kwargs.get('expiry_month'),
            'expiry_year': kwargs.get('expiry_year'),
            'cvv': kwargs.get('cvv'),
            'return_url': kwargs.get('callback_url')
        }
        
        headers = {
            'Authorization': f"Bearer {self.api_key}",
            'Content-Type': 'application/json'
        }
        
        try:
            response = requests.post(endpoint, json=payload, headers=headers)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            raise Exception(f"UBL payment creation failed: {str(e)}")
    
    def verify_payment(self, payment_id: str) -> Dict[str, Any]:
        """Verify payment status with UBL"""
        endpoint = f"{self.base_url}/payments/{payment_id}/status"
        
        headers = {
            'Authorization': f"Bearer {self.api_key}",
            'Content-Type': 'application/json'
        }
        
        try:
            response = requests.get(endpoint, headers=headers)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            raise Exception(f"UBL payment verification failed: {str(e)}")
    
    def process_webhook(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Process webhook notification from UBL"""
        # Verify webhook signature using UBL's method
        # Implementation depends on UBL's actual webhook format
        
        return {
            'status': data.get('status'),
            'transaction_id': data.get('transaction_id'),
            'amount': data.get('amount'),
            'payment_method': 'card',
            'card_type': data.get('card_type'),
            'last_4': data.get('last_4')
        }
    
    def refund_payment(self, transaction_id: str, amount: float = None) -> Dict[str, Any]:
        """Refund a payment through UBL"""
        endpoint = f"{self.base_url}/payments/{transaction_id}/refund"
        
        payload = {
            'merchant_id': self.merchant_id,
            'transaction_id': transaction_id
        }
        
        if amount:
            payload['amount'] = amount
        
        headers = {
            'Authorization': f"Bearer {self.api_key}",
            'Content-Type': 'application/json'
        }
        
        try:
            response = requests.post(endpoint, json=payload, headers=headers)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            raise Exception(f"UBL refund failed: {str(e)}")
