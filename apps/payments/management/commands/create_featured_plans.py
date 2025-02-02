from django.core.management.base import BaseCommand
from apps.payments.models import FeaturedListingPlan

class Command(BaseCommand):
    help = 'Creates default featured listing plans'

    def handle(self, *args, **options):
        plans = [
            {
                'name': 'Basic Boost',
                'description': 'Get more visibility with basic promotion features',
                'price': 1000,
                'duration_days': 7,
                'priority_level': 1,
            },
            {
                'name': 'Premium Spotlight',
                'description': 'Stand out with premium placement and enhanced visibility',
                'price': 2500,
                'duration_days': 14,
                'priority_level': 2,
            },
            {
                'name': 'Ultimate Showcase',
                'description': 'Maximum exposure with top placement and all premium features',
                'price': 5000,
                'duration_days': 30,
                'priority_level': 3,
            },
        ]

        for plan_data in plans:
            plan, created = FeaturedListingPlan.objects.get_or_create(
                name=plan_data['name'],
                defaults=plan_data
            )
            
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created plan: {plan.name}'))
            else:
                self.stdout.write(self.style.WARNING(f'Plan already exists: {plan.name}'))
