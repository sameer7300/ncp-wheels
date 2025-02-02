from django.core.management.base import BaseCommand
from apps.cars.models import CarFeature

class Command(BaseCommand):
    help = 'Creates default car features'

    def handle(self, *args, **kwargs):
        features = {
            'safety': [
                ('ABS', 'Anti-lock Braking System'),
                ('Airbags', 'Driver and Passenger Airbags'),
                ('Parking Sensors', 'Rear Parking Sensors'),
                ('Backup Camera', 'Rear View Camera'),
                ('ESP', 'Electronic Stability Program'),
                ('Child Locks', 'Child Safety Locks'),
                ('Immobilizer', 'Engine Immobilizer System'),
            ],
            'comfort': [
                ('AC', 'Air Conditioning'),
                ('Power Steering', 'Power Steering'),
                ('Power Windows', 'Power Windows'),
                ('Power Mirrors', 'Power Adjustable Mirrors'),
                ('Central Locking', 'Remote Central Locking'),
                ('Keyless Entry', 'Keyless Entry System'),
                ('Cruise Control', 'Cruise Control'),
            ],
            'entertainment': [
                ('Infotainment', 'Touch Screen Infotainment System'),
                ('Navigation', 'GPS Navigation System'),
                ('Bluetooth', 'Bluetooth Connectivity'),
                ('USB', 'USB Connectivity'),
                ('Speakers', 'Premium Sound System'),
                ('Android Auto', 'Android Auto Support'),
                ('Apple CarPlay', 'Apple CarPlay Support'),
            ],
            'performance': [
                ('Turbo', 'Turbocharged Engine'),
                ('Sports Mode', 'Sports Driving Mode'),
                ('Paddle Shifters', 'Steering Mounted Paddle Shifters'),
                ('AWD', 'All Wheel Drive'),
                ('Hill Assist', 'Hill Start Assist'),
                ('Traction Control', 'Traction Control System'),
            ],
            'exterior': [
                ('Alloy Wheels', 'Alloy Wheels'),
                ('Sunroof', 'Electric Sunroof'),
                ('LED Headlights', 'LED Headlights'),
                ('Fog Lights', 'Front Fog Lights'),
                ('Roof Rails', 'Roof Rails'),
                ('Rain Sensors', 'Automatic Rain Sensing Wipers'),
            ],
            'interior': [
                ('Leather Seats', 'Leather Upholstery'),
                ('Electric Seats', 'Electric Adjustable Seats'),
                ('Climate Control', 'Automatic Climate Control'),
                ('Rear AC', 'Rear AC Vents'),
                ('Armrest', 'Front and Rear Armrests'),
                ('Cup Holders', 'Front and Rear Cup Holders'),
            ],
        }

        for category, feature_list in features.items():
            for name, description in feature_list:
                CarFeature.objects.get_or_create(
                    name=name,
                    defaults={
                        'category': category,
                        'description': description
                    }
                )
                self.stdout.write(f'Created/Updated feature: {name} ({category})')

        self.stdout.write(self.style.SUCCESS('Successfully created default features'))
