from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic import ListView, DetailView, CreateView, TemplateView
from django.views import View
from django.http import JsonResponse
from django.urls import reverse
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.cars.models import Car, FeaturedListing
from .models import Transaction, FeaturedListingPlan, FeaturedListingPayment
from .serializers import TransactionSerializer
from .services import PaymentService

class TransactionViewSet(viewsets.ModelViewSet):
    """ViewSet for Transaction model"""
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class TransactionListView(LoginRequiredMixin, ListView):
    """View to list user's transactions"""
    model = Transaction
    template_name = 'payments/transaction_list.html'
    context_object_name = 'transactions'

    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user)

class TransactionDetailView(LoginRequiredMixin, DetailView):
    """View to show transaction details"""
    model = Transaction
    template_name = 'payments/transaction_detail.html'
    context_object_name = 'transaction'

    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user)

class FeaturedListingPlansView(ListView):
    """View to display available featured listing plans"""
    model = FeaturedListingPlan
    template_name = 'payments/featured_listing_plans.html'
    context_object_name = 'plans'

    def get_queryset(self):
        return FeaturedListingPlan.objects.filter(is_active=True)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['car'] = get_object_or_404(Car, pk=self.kwargs.get('car_pk'))
        return context

class InitiateFeaturedListingPaymentView(LoginRequiredMixin, View):
    """View to initiate payment for featuring a listing"""
    
    def post(self, request, *args, **kwargs):
        car = get_object_or_404(Car, pk=kwargs['car_pk'], seller=request.user)
        plan = get_object_or_404(FeaturedListingPlan, pk=request.POST.get('plan_id'))
        gateway = request.POST.get('gateway', 'easypaisa')
        
        try:
            # Create payment record
            payment = PaymentService.create_featured_listing_payment(
                user=request.user,
                car=car,
                plan=plan,
                gateway=gateway
            )
            
            # Process payment based on gateway
            if gateway == 'easypaisa':
                response = PaymentService.process_easypaisa_payment(payment)
                if response['status'] == 'success':
                    return JsonResponse({
                        'status': 'success',
                        'redirect_url': reverse('payments:payment-success')
                    })
            
            return JsonResponse({
                'status': 'error',
                'message': 'Payment processing failed'
            }, status=400)
            
        except Exception as e:
            return JsonResponse({
                'status': 'error',
                'message': str(e)
            }, status=400)

class VerifyFeaturedListingPaymentView(View):
    """View to verify payment status"""
    
    def get(self, request, *args, **kwargs):
        payment_id = kwargs['payment_id']
        response = PaymentService.verify_payment_status(payment_id)
        
        if response['status'] == 'completed':
            return JsonResponse({'status': 'success'})
        elif response['status'] == 'not_found':
            return JsonResponse({
                'status': 'error',
                'message': 'Payment not found'
            }, status=404)
        else:
            return JsonResponse({
                'status': 'error',
                'message': response.get('message', 'Payment verification failed')
            }, status=400)

class PaymentSuccessView(TemplateView):
    """View to display payment success message"""
    template_name = 'payments/payment_success.html'

class PaymentFailedView(TemplateView):
    """View to display payment failed message"""
    template_name = 'payments/payment_failed.html'
