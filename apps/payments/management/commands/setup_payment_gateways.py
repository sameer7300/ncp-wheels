from django.core.management.base import BaseCommand
from apps.payments.models import PaymentGatewayConfig

class Command(BaseCommand):
    help = 'Sets up payment gateway configurations'

    def handle(self, *args, **options):
        # EasyPaisa Configuration (using sandbox/test credentials)
        easypaisa_config = {
            'merchant_id': '123456',  # Replace with actual merchant ID
            'merchant_key': 'YOUR_EASYPAISA_KEY',  # Replace with actual key
            'store_id': '12345',  # Replace with actual store ID
            'environment': 'sandbox'
        }
        
        easypaisa, created = PaymentGatewayConfig.objects.get_or_create(
            gateway='easypaisa',
            defaults={
                'config': easypaisa_config,
                'is_active': True,
                'environment': 'sandbox'
            }
        )
        
        if created:
            self.stdout.write(self.style.SUCCESS('Created EasyPaisa gateway config'))
        else:
            # Update existing config
            easypaisa.config = easypaisa_config
            easypaisa.is_active = True
            easypaisa.environment = 'sandbox'
            easypaisa.save()
            self.stdout.write(self.style.SUCCESS('Updated EasyPaisa gateway config'))

        # Bank Alfalah Configuration (using sandbox/test credentials)
        bankalfalah_config = {
            'merchant_id': 'BA12345',  # Replace with actual merchant ID
            'merchant_key': 'YOUR_BANKALFALAH_KEY',  # Replace with actual key
            'merchant_name': 'NCP Wheels',
            'environment': 'sandbox'
        }
        
        bankalfalah, created = PaymentGatewayConfig.objects.get_or_create(
            gateway='bankalfalah',
            defaults={
                'config': bankalfalah_config,
                'is_active': True,
                'environment': 'sandbox'
            }
        )
        
        if created:
            self.stdout.write(self.style.SUCCESS('Created Bank Alfalah gateway config'))
        else:
            # Update existing config
            bankalfalah.config = bankalfalah_config
            bankalfalah.is_active = True
            bankalfalah.environment = 'sandbox'
            bankalfalah.save()
            self.stdout.write(self.style.SUCCESS('Updated Bank Alfalah gateway config'))
