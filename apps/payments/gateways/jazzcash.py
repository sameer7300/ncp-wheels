from typing import Dict, Any
import requests
import hashlib
from .base import PaymentGateway

class JazzCashGateway(PaymentGateway):
    """JazzCash payment gateway implementation"""
    
    def initialize(self):
        """Initialize JazzCash gateway with credentials"""
        self.merchant_id = self.config.get('merchant_id')
        self.password = self.config.get('password')
        self.integrity_salt = self.config.get('integrity_salt')
        self.is_sandbox = self.config.get('environment', 'sandbox') == 'sandbox'
        self.base_url = (
            'https://sandbox.jazzcash.com.pk/api' if self.is_sandbox
            else 'https://payments.jazzcash.com.pk/api'
        )
    
    def _generate_secure_hash(self, data: Dict[str, Any]) -> str:
        """Generate secure hash for JazzCash API"""
        # Sort dictionary by keys
        sorted_data = dict(sorted(data.items()))
        
        # Create string for hashing
        hash_string = '&'.join([f"{k}={v}" for k, v in sorted_data.items()])
        hash_string = f"{hash_string}&{self.integrity_salt}"
        
        # Generate SHA-256 hash
        return hashlib.sha256(hash_string.encode()).hexdigest()
    
    def create_payment(self, amount: float, currency: str = 'PKR', **kwargs) -> Dict[str, Any]:
        """Create a payment request with JazzCash"""
        endpoint = f"{self.base_url}/payments/create"
        
        payload = {
            'merchant_id': self.merchant_id,
            'amount': str(amount),
            'currency': currency,
            'txn_ref_no': kwargs.get('order_id'),
            'mobile_number': kwargs.get('mobile_number'),
            'description': kwargs.get('description', 'Payment for featured listing'),
            'return_url': kwargs.get('callback_url')
        }
        
        # Add secure hash
        payload['secure_hash'] = self._generate_secure_hash(payload)
        
        try:
            response = requests.post(endpoint, json=payload)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            raise Exception(f"JazzCash payment creation failed: {str(e)}")
    
    def verify_payment(self, payment_id: str) -> Dict[str, Any]:
        """Verify payment status with JazzCash"""
        endpoint = f"{self.base_url}/payments/{payment_id}/status"
        
        payload = {
            'merchant_id': self.merchant_id,
            'txn_ref_no': payment_id
        }
        
        # Add secure hash
        payload['secure_hash'] = self._generate_secure_hash(payload)
        
        try:
            response = requests.get(endpoint, params=payload)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            raise Exception(f"JazzCash payment verification failed: {str(e)}")
    
    def process_webhook(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Process webhook notification from JazzCash"""
        # Verify webhook data integrity
        received_hash = data.pop('secure_hash', None)
        calculated_hash = self._generate_secure_hash(data)
        
        if not received_hash or received_hash != calculated_hash:
            raise Exception("Invalid webhook signature")
        
        return {
            'status': data.get('status'),
            'transaction_id': data.get('txn_ref_no'),
            'amount': data.get('amount'),
            'payment_method': 'jazzcash'
        }
