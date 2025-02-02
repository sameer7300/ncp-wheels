from typing import Dict, Any
import requests
import hmac
import hashlib
import logging
import json
from datetime import datetime
from .base import PaymentGateway

logger = logging.getLogger(__name__)

class BankAlfalahGateway(PaymentGateway):
    """Bank Alfalah payment gateway implementation"""
    
    def initialize(self):
        """Initialize Bank Alfalah gateway with credentials"""
        self.merchant_id = self.config.get('merchant_id')
        self.merchant_name = self.config.get('merchant_name', 'NCP Wheels')
        self.merchant_key = self.config.get('merchant_key')
        self.is_sandbox = self.config.get('environment', 'sandbox') == 'sandbox'
        
        if self.is_sandbox:
            self.base_url = 'https://sandbox.bankalfalah.com/HS/api/Transaction/Post'
        else:
            self.base_url = 'https://payments.bankalfalah.com/HS/api/Transaction/Post'
            
        logger.info(f"Initialized Bank Alfalah gateway - Merchant ID: {self.merchant_id}, Environment: {'sandbox' if self.is_sandbox else 'production'}")
    
    def _generate_hash(self, data_string: str) -> str:
        """Generate AES hash for Bank Alfalah API"""
        return hmac.new(
            self.merchant_key.encode(),
            data_string.encode(),
            hashlib.sha256
        ).hexdigest().upper()
    
    def initialize_payment(
        self,
        amount: float,
        payment_id: str,
        callback_url: str,
        description: str = None,
    ) -> Dict[str, Any]:
        """Initialize a payment request with Bank Alfalah"""
        
        logger.info(f"Initializing Bank Alfalah payment - Amount: {amount}, Payment ID: {payment_id}")
        
        # In sandbox mode, simulate a successful payment initialization
        if self.is_sandbox:
            logger.info("Using sandbox mode, returning simulated response")
            return {
                'status': 'success',
                'redirect_url': f"https://sandbox.bankalfalah.com/SSO/SSO/SSO?ID=sandbox_{payment_id}",
                'token': 'sandbox_token_123',
            }
        
        # Format amount to 2 decimal places
        amount_str = "{:.2f}".format(amount)
        
        # Get current timestamp in required format
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        
        # Prepare payment data
        payment_data = {
            "TransactionTypeId": "3",  # For web checkout
            "TransactionReferenceNumber": payment_id,
            "MerchantId": self.merchant_id,
            "MerchantName": self.merchant_name,
            "MerchantAddress": "Pakistan",
            "MerchantCategoryCode": "5399",  # General retail
            "TransactionCurrency": "PKR",
            "TransactionAmount": amount_str,
            "OrderNumber": payment_id,
            "OrderDateTime": timestamp,
            "TransactionExpiryDateTime": (datetime.now().replace(hour=23, minute=59, second=59)).strftime("%Y%m%d%H%M%S"),
            "ReturnURL": callback_url,
            "Description": description or "Featured Listing Payment",
            "TerminalId": "1234567",  # Default terminal ID
            "Language": "EN",
            "Version": "1.1",
            "BankId": "ALFAH",
            "Signature": ""  # Will be added after hash generation
        }
        
        # Generate hash string
        hash_string = (
            f"{self.merchant_id}"
            f"{payment_data['OrderNumber']}"
            f"{amount_str}"
            f"{payment_data['TransactionCurrency']}"
            f"{self.merchant_key}"
        )
        
        # Add signature to payment data
        payment_data["Signature"] = self._generate_hash(hash_string)
        
        logger.info(f"Making request to Bank Alfalah - Endpoint: {self.base_url}")
        
        try:
            response = requests.post(
                self.base_url,
                json=payment_data,
                headers={'Content-Type': 'application/json'}
            )
            response.raise_for_status()
            data = response.json()
            
            logger.info(f"Bank Alfalah response: {data}")
            
            if data.get('ResponseCode') == '00':  # Success code
                return {
                    'status': 'success',
                    'redirect_url': data.get('RedirectURL'),
                    'token': data.get('TransactionReferenceNumber'),
                }
            else:
                error_msg = data.get('ResponseMessage', 'Payment initialization failed')
                logger.error(f"Bank Alfalah error: {error_msg}")
                raise Exception(error_msg)
                
        except requests.exceptions.RequestException as e:
            logger.error(f"Bank Alfalah request failed: {str(e)}")
            raise Exception(f"Bank Alfalah payment initialization failed: {str(e)}")
    
    def verify_payment(self, payment_id: str) -> str:
        """Verify payment status with Bank Alfalah"""
        
        logger.info(f"Verifying Bank Alfalah payment - Payment ID: {payment_id}")
        
        # In sandbox mode, simulate a successful payment
        if self.is_sandbox:
            logger.info("Using sandbox mode, returning simulated success")
            return 'completed'
            
        # For Bank Alfalah, we rely on the return parameters from the payment page
        # The actual implementation should verify these parameters using the signature
        return 'pending'  # Default to pending until callback is received
        
    def process_webhook(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Process webhook notification from Bank Alfalah"""
        logger.info(f"Processing Bank Alfalah webhook: {data}")
        
        try:
            # Verify signature
            received_signature = data.get('Signature', '')
            order_ref = data.get('OrderNumber', '')
            amount = data.get('TransactionAmount', '')
            currency = data.get('TransactionCurrency', '')
            
            # Generate verification hash
            hash_string = f"{self.merchant_id}{order_ref}{amount}{currency}{self.merchant_key}"
            calculated_signature = self._generate_hash(hash_string)
            
            if received_signature != calculated_signature:
                logger.error("Invalid webhook signature")
                return {'status': 'failed', 'message': 'Invalid signature'}
            
            # Map Bank Alfalah status to our status
            status_map = {
                '00': 'completed',  # Success
                '01': 'failed',     # Failed
                '02': 'pending',    # Pending
            }
            
            return {
                'status': status_map.get(data.get('ResponseCode'), 'failed'),
                'payment_id': order_ref,
                'amount': float(amount),
                'currency': currency,
                'transaction_id': data.get('AuthCode', ''),
                'raw_response': data
            }
            
        except Exception as e:
            logger.error(f"Error processing Bank Alfalah webhook: {str(e)}")
            return {'status': 'failed', 'message': str(e)}
