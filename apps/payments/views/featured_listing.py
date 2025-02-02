from django.shortcuts import get_object_or_404
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic import ListView, DetailView, CreateView
from django.urls import reverse_lazy
from django.http import JsonResponse, HttpResponseBadRequest, redirect
from django.views import View
from apps.cars.models import Car, FeaturedListing
from apps.payments.models import FeaturedListingPlan, FeaturedListingPayment
from apps.payments.services import PaymentService
import logging
import json

logger = logging.getLogger(__name__)

class FeaturedListingPlansView(ListView):
    """Display available featured listing plans"""
    model = FeaturedListingPlan
    template_name = 'payments/featured_listing_plans.html'
    context_object_name = 'plans'
    
    def get_queryset(self):
        return FeaturedListingPlan.objects.filter(is_active=True)
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        car_pk = self.kwargs.get('car_pk')
        context['car'] = get_object_or_404(Car, pk=car_pk)
        return context

class InitiateFeaturedListingPaymentView(LoginRequiredMixin, View):
    """Initiate payment for featuring a car listing"""
    
    def post(self, request, *args, **kwargs):
        # Log request data
        logger.info(f"Payment initiation request - POST data: {request.POST}")
        
        car_pk = kwargs.get('car_pk')
        plan_id = request.POST.get('plan_id')
        payment_method = request.POST.get('payment_method')
        
        logger.info(f"Initiating payment - car_pk: {car_pk}, plan_id: {plan_id}, payment_method: {payment_method}")
        
        if not all([car_pk, plan_id, payment_method]):
            error_msg = "Missing required parameters"
            logger.error(f"Payment initiation failed - {error_msg}")
            return JsonResponse({
                'status': 'error',
                'message': error_msg
            }, status=400)
        
        try:
            # Get car and plan
            car = get_object_or_404(Car, pk=car_pk)
            
            # Check if user is the seller
            if car.seller != request.user:
                error_msg = "You are not authorized to feature this car"
                logger.error(f"Payment initiation failed - {error_msg}")
                return JsonResponse({
                    'status': 'error',
                    'message': error_msg
                }, status=403)
                
            plan = get_object_or_404(FeaturedListingPlan, pk=plan_id, is_active=True)
            
            # Create payment record
            payment = FeaturedListingPayment.objects.create(
                user=request.user,
                car=car,
                plan=plan,
                amount=plan.price,
                gateway=payment_method,
                status='pending'
            )
            
            # Initialize payment with gateway
            callback_url = request.build_absolute_uri(
                reverse_lazy('payments:verify-featured-listing-payment', kwargs={'payment_id': payment.id})
            )
            logger.info(f"Callback URL: {callback_url}")
            
            payment_data = PaymentService.create_featured_listing_payment(
                payment=payment,
                callback_url=callback_url
            )
            
            logger.info(f"Payment initialized successfully - payment_id: {payment.payment_id}")
            return JsonResponse(payment_data)
            
        except Car.DoesNotExist:
            error_msg = "Car not found"
            logger.error(f"Payment initiation failed - {error_msg}")
            return JsonResponse({
                'status': 'error',
                'message': error_msg
            }, status=404)
            
        except FeaturedListingPlan.DoesNotExist:
            error_msg = "Plan not found or inactive"
            logger.error(f"Payment initiation failed - {error_msg}")
            return JsonResponse({
                'status': 'error',
                'message': error_msg
            }, status=404)
            
        except ValueError as e:
            logger.error(f"Payment initiation failed - {str(e)}")
            return JsonResponse({
                'status': 'error',
                'message': str(e)
            }, status=400)
            
        except Exception as e:
            logger.error(f"Unexpected error during payment initiation: {str(e)}", exc_info=True)
            return JsonResponse({
                'status': 'error',
                'message': "An unexpected error occurred. Please try again later."
            }, status=500)

class VerifyFeaturedListingPaymentView(View):
    """Verify payment status and activate featured listing"""
    
    def get(self, request, *args, **kwargs):
        """Handle callback from payment gateway"""
        payment_id = kwargs.get('payment_id')
        logger.info(f"Payment verification callback - payment_id: {payment_id}")
        logger.info(f"Callback data: {request.GET}")
        
        try:
            payment = get_object_or_404(FeaturedListingPayment, id=payment_id)
            gateway = PaymentService.get_gateway(payment.gateway)
            
            if payment.gateway == 'bankalfalah':
                # Process Bank Alfalah callback
                response_code = request.GET.get('ResponseCode')
                if response_code == '00':  # Success code
                    payment.status = 'completed'
                    payment.activate_featured_listing()
                    logger.info(f"Bank Alfalah payment {payment_id} completed successfully")
                    return redirect('payments:payment-success', pk=payment.id)
                else:
                    payment.status = 'failed'
                    payment.save()
                    logger.warning(f"Bank Alfalah payment {payment_id} failed - Response code: {response_code}")
                    return redirect('payments:payment-failed', pk=payment.id)
                    
            elif payment.gateway == 'easypaisa':
                # Process EasyPaisa callback
                status_code = request.GET.get('status')
                if status_code == '0000':  # Success code
                    payment.status = 'completed'
                    payment.activate_featured_listing()
                    logger.info(f"EasyPaisa payment {payment_id} completed successfully")
                    return redirect('payments:payment-success', pk=payment.id)
                else:
                    payment.status = 'failed'
                    payment.save()
                    logger.warning(f"EasyPaisa payment {payment_id} failed - Status code: {status_code}")
                    return redirect('payments:payment-failed', pk=payment.id)
            
            else:
                logger.error(f"Unknown payment gateway: {payment.gateway}")
                return JsonResponse({
                    'status': 'error',
                    'message': 'Unknown payment gateway'
                }, status=400)
                
        except FeaturedListingPayment.DoesNotExist:
            error_msg = "Payment not found"
            logger.error(f"Payment verification failed - {error_msg}")
            return JsonResponse({
                'status': 'error',
                'message': error_msg
            }, status=404)
            
        except Exception as e:
            logger.error(f"Unexpected error during payment verification: {str(e)}", exc_info=True)
            return JsonResponse({
                'status': 'error',
                'message': "An unexpected error occurred while verifying the payment."
            }, status=500)
    
    def post(self, request, *args, **kwargs):
        """Handle webhook notifications from payment gateways"""
        payment_id = kwargs.get('payment_id')
        logger.info(f"Payment webhook notification - payment_id: {payment_id}")
        logger.info(f"Webhook data: {request.POST}")
        
        try:
            payment = get_object_or_404(FeaturedListingPayment, id=payment_id)
            gateway = PaymentService.get_gateway(payment.gateway)
            
            # Process webhook data
            webhook_data = request.POST.dict()
            result = gateway.process_webhook(webhook_data)
            
            if result['status'] == 'completed':
                payment.status = 'completed'
                payment.activate_featured_listing()
                logger.info(f"Payment {payment_id} completed via webhook")
            elif result['status'] == 'failed':
                payment.status = 'failed'
                payment.save()
                logger.warning(f"Payment {payment_id} failed via webhook")
            
            return JsonResponse({'status': 'success'})
            
        except Exception as e:
            logger.error(f"Error processing webhook: {str(e)}", exc_info=True)
            return JsonResponse({
                'status': 'error',
                'message': str(e)
            }, status=500)

class PaymentSuccessView(DetailView):
    """Display payment success message"""
    template_name = 'payments/payment_success.html'
    model = FeaturedListingPayment
    context_object_name = 'payment'

class PaymentFailedView(DetailView):
    """Display payment failure message"""
    template_name = 'payments/payment_failed.html'
    model = FeaturedListingPayment
    context_object_name = 'payment'
