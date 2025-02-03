"""
Debug middleware for NCP Wheels V2 project.
"""
import logging

logger = logging.getLogger(__name__)

class DebugMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Log request information
        logger.info(f"Request HOST: {request.get_host()}")
        logger.info(f"Request META['HTTP_HOST']: {request.META.get('HTTP_HOST')}")
        logger.info(f"ALLOWED_HOSTS: {request.META.get('ALLOWED_HOSTS')}")
        
        response = self.get_response(request)
        return response
