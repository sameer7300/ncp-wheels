from django.contrib.auth.mixins import UserPassesTestMixin
from django.shortcuts import redirect
from django.contrib import messages

class SellerRequiredMixin(UserPassesTestMixin):
    """Verify that the current user is a seller."""
    
    def test_func(self):
        return self.request.user.is_authenticated and self.request.user.is_dealer
    
    def handle_no_permission(self):
        messages.error(self.request, "You must be registered as a dealer to access this page.")
        return redirect('users:register')
