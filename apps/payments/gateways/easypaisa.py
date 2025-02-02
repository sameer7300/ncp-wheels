from typing import Dict, Any
import requests
import hmac
import hashlib
import logging
import json
from datetime import datetime
from .base import PaymentGateway

logger = logging.getLogger(__name__)

class EasyPaisaGateway(PaymentGateway):
    """EasyPaisa payment gateway implementation"""
    
    def initialize(self):
        """Initialize EasyPaisa gateway with credentials"""
        self.merchant_id = self.config.get('merchant_id')
        self.merchant_key = self.config.get('merchant_key')
        self.store_id = self.config.get('store_id', '1234')
        self.is_sandbox = self.config.get('environment', 'sandbox') == 'sandbox'
        
        if self.is_sandbox:
            self.base_url = 'https://easypay.easypaisa.com.pk/easypay-service/rest/v4'
        else:
            self.base_url = 'https://easypay.easypaisa.com.pk/easypay-service/rest/v4'
            
        logger.info(f"Initialized EasyPaisa gateway - Merchant ID: {self.merchant_id}, Environment: {'sandbox' if self.is_sandbox else 'production'}")
    
    def _generate_hash(self, data_string: str) -> str:
        """Generate hash for EasyPaisa API"""
        return hmac.new(
            self.merchant_key.encode(),
            data_string.encode(),
            hashlib.sha256
        ).hexdigest()
    
    def initialize_payment(
        self,
        amount: float,
        payment_id: str,
        callback_url: str,
        description: str = None,
    ) -> Dict[str, Any]:
        """Initialize a payment request with EasyPaisa"""
        
        logger.info(f"Initializing EasyPaisa payment - Amount: {amount}, Payment ID: {payment_id}")
        
        # In sandbox mode, simulate a successful payment initialization
        if self.is_sandbox:
            logger.info("Using sandbox mode, returning simulated response")
            return {
                'status': 'success',
                'redirect_url': f"https://sandbox.easypay.easypaisa.com.pk/payment?token=sandbox_{payment_id}",
                'token': f"sandbox_{payment_id}",
            }
        
        endpoint = f"{self.base_url}/merchant-payment-init"
        
        # Format amount to 2 decimal places without decimal point
        amount_str = "{:.2f}".format(amount).replace(".", "")
        
        # Get current timestamp
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        
        # Prepare payment data
        payment_data = {
            "merchantId": self.merchant_id,
            "storeId": self.store_id,
            "orderId": payment_id,
            "transactionAmount": amount_str,
            "mobileAccountNo": "",  # Leave empty for web checkout
            "emailAddress": "",     # Optional
            "transactionType": "MA_WEB_CHECKOUT",
            "tokenExpiry": "20231231235959",  # Set appropriate expiry
            "bankIdentificationNumber": "0",
            "merchantPaymentMethod": "",
            "mobileNo": "",
            "msisdn": "",
            "transactionDateTime": timestamp,
            "description": description or "Featured Listing Payment"
        }
        
        # Generate hash string
        hash_string = (
            f"{self.merchant_id}"
            f"{self.store_id}"
            f"{payment_id}"
            f"{amount_str}"
            f"{self.merchant_key}"
        )
        
        # Add hash to payment data
        payment_data["hashKey"] = self._generate_hash(hash_string)
        
        logger.info(f"Making request to EasyPaisa - Endpoint: {endpoint}")
        
        try:
            response = requests.post(
                endpoint,
                json=payment_data,
                headers={'Content-Type': 'application/json'}
            )
            response.raise_for_status()
            data = response.json()
            
            logger.info(f"EasyPaisa response: {data}")
            
            if data.get('responseCode') == '0000':  # Success code
                return {
                    'status': 'success',
                    'redirect_url': f"https://easypay.easypaisa.com.pk/payment?token={data.get('paymentToken')}",
                    'token': data.get('paymentToken'),
                }
            else:
                error_msg = data.get('responseDesc', 'Payment initialization failed')
                logger.error(f"EasyPaisa error: {error_msg}")
                raise Exception(error_msg)
                
        except requests.exceptions.RequestException as e:
            logger.error(f"EasyPaisa request failed: {str(e)}")
            raise Exception(f"EasyPaisa payment initialization failed: {str(e)}")
    
    def verify_payment(self, payment_id: str) -> str:
        """Verify payment status with EasyPaisa"""
        
        logger.info(f"Verifying EasyPaisa payment - Payment ID: {payment_id}")
        
        # In sandbox mode, simulate a successful payment
        if self.is_sandbox:
            logger.info("Using sandbox mode, returning simulated success")
            return 'completed'
        
        endpoint = f"{self.base_url}/merchant-payment-status"
        
        try:
            # Prepare verification data
            verify_data = {
                "merchantId": self.merchant_id,
                "storeId": self.store_id,
                "orderId": payment_id
            }
            
            # Generate hash
            hash_string = f"{self.merchant_id}{self.store_id}{payment_id}{self.merchant_key}"
            verify_data["hashKey"] = self._generate_hash(hash_string)
            
            response = requests.post(
                endpoint,
                json=verify_data,
                headers={'Content-Type': 'application/json'}
            )
            response.raise_for_status()
            data = response.json()
            
            logger.info(f"EasyPaisa status response: {data}")
            
            # Map EasyPaisa status to our status
            status_map = {
                '0000': 'completed',  # Success
                '0001': 'failed',     # Failed
                '0002': 'pending',    # Pending
                '0003': 'failed'      # Cancelled
            }
            
            return status_map.get(data.get('responseCode'), 'failed')
            
        except requests.exceptions.RequestException as e:
            logger.error(f"EasyPaisa verification request failed: {str(e)}")
            raise Exception(f"EasyPaisa payment verification failed: {str(e)}")
    
    def process_webhook(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Process webhook notification from EasyPaisa"""
        logger.info(f"Processing EasyPaisa webhook: {data}")
        
        try:
            # Verify hash
            received_hash = data.get('hashKey', '')
            merchant_id = data.get('merchantId', '')
            store_id = data.get('storeId', '')
            order_id = data.get('orderId', '')
            amount = data.get('transactionAmount', '')
            
            # Generate verification hash
            hash_string = f"{merchant_id}{store_id}{order_id}{amount}{self.merchant_key}"
            calculated_hash = self._generate_hash(hash_string)
            
            if received_hash != calculated_hash:
                logger.error("Invalid webhook hash")
                return {'status': 'failed', 'message': 'Invalid hash'}
            
            # Map EasyPaisa status to our status
            status_map = {
                '0000': 'completed',  # Success
                '0001': 'failed',     # Failed
                '0002': 'pending',    # Pending
                '0003': 'failed'      # Cancelled
            }
            
            return {
                'status': status_map.get(data.get('responseCode'), 'failed'),
                'payment_id': order_id,
                'amount': float(amount) / 100,  # Convert to decimal
                'currency': 'PKR',
                'transaction_id': data.get('transactionId', ''),
                'raw_response': data
            }
            
        except Exception as e:
            logger.error(f"Error processing EasyPaisa webhook: {str(e)}")
            return {'status': 'failed', 'message': str(e)}
