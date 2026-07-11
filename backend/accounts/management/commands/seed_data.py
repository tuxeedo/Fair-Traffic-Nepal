"""
Management command to seed the database with initial data.
Creates violation types, traffic rules, and sample users.
"""

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from violations.models import ViolationType, TrafficRule, SafetyScore
from accounts.models import OfficerProfile

User = get_user_model()


class Command(BaseCommand):
    help = 'Seed the database with initial violation types, traffic rules, and sample users.'

    def handle(self, *args, **options):
        self.stdout.write('Seeding database...\n')
        self.create_violation_types()
        self.create_traffic_rules()
        self.create_sample_users()
        self.stdout.write(self.style.SUCCESS('\nDatabase seeded successfully!'))

    def create_violation_types(self):
        self.stdout.write('  Creating violation types...')
        types_data = [
            {'name': 'No Helmet', 'code': 'NO_HELMET', 'category': 'minor', 'base_fine_amount': 500, 'description': 'Riding a motorcycle without a helmet.'},
            {'name': 'No Seatbelt', 'code': 'NO_SEATBELT', 'category': 'minor', 'base_fine_amount': 500, 'description': 'Driving without wearing a seatbelt.'},
            {'name': 'Drink Driving', 'code': 'DRINK_DRIVING', 'category': 'dangerous', 'base_fine_amount': 5000, 'description': 'Driving under the influence of alcohol.'},
            {'name': 'Dangerous Driving', 'code': 'DANGEROUS_DRIVING', 'category': 'dangerous', 'base_fine_amount': 5000, 'description': 'Driving in a manner dangerous to the public.'},
            {'name': 'Minor Overspeeding', 'code': 'MINOR_OVERSPEEDING', 'category': 'minor', 'base_fine_amount': 1000, 'description': 'Exceeding the speed limit by up to 20 km/h.'},
            {'name': 'Excessive Overspeeding', 'code': 'EXCESSIVE_OVERSPEEDING', 'category': 'dangerous', 'base_fine_amount': 3000, 'description': 'Exceeding the speed limit by more than 20 km/h.'},
            {'name': 'Running Red Light', 'code': 'RED_LIGHT', 'category': 'major', 'base_fine_amount': 2000, 'description': 'Failing to stop at a red traffic signal.'},
            {'name': 'Wrong Way Driving', 'code': 'WRONG_WAY', 'category': 'major', 'base_fine_amount': 1500, 'description': 'Driving against the designated traffic flow.'},
            {'name': 'No License', 'code': 'NO_LICENSE', 'category': 'major', 'base_fine_amount': 3000, 'description': 'Driving without a valid driving license.'},
            {'name': 'Expired Insurance', 'code': 'EXPIRED_INSURANCE', 'category': 'minor', 'base_fine_amount': 1000, 'description': 'Vehicle insurance has expired.'},
            {'name': 'Illegal Parking', 'code': 'ILLEGAL_PARKING', 'category': 'minor', 'base_fine_amount': 500, 'description': 'Parking in a no-parking zone.'},
            {'name': 'Using Phone While Driving', 'code': 'PHONE_DRIVING', 'category': 'major', 'base_fine_amount': 1500, 'description': 'Using a mobile phone while driving.'},
            {'name': 'Overloading', 'code': 'OVERLOADING', 'category': 'major', 'base_fine_amount': 2000, 'description': 'Carrying passengers or load beyond vehicle capacity.'},
            {'name': 'No Number Plate', 'code': 'NO_NUMBER_PLATE', 'category': 'major', 'base_fine_amount': 2000, 'description': 'Driving without a visible number plate.'},
        ]

        for data in types_data:
            ViolationType.objects.get_or_create(
                code=data['code'],
                defaults=data,
            )
        self.stdout.write(f'    -> {len(types_data)} violation types')

    def create_traffic_rules(self):
        self.stdout.write('  Creating traffic rules...')
        rules_created = 0

        # --- No Helmet ---
        no_helmet = ViolationType.objects.get(code='NO_HELMET')
        rules = [
            {'violation_type': no_helmet, 'offense_number': 1, 'time_window_days': 180, 'action': 'warning', 'fine_amount': 0, 'description': 'First offense — formal warning.'},
            {'violation_type': no_helmet, 'offense_number': 2, 'time_window_days': 180, 'action': 'fine', 'fine_amount': 500, 'description': 'Second offense within 6 months — fine.'},
            {'violation_type': no_helmet, 'offense_number': 3, 'time_window_days': 180, 'action': 'increased_fine', 'fine_amount': 1000, 'description': 'Third offense — increased fine.'},
        ]
        for rule_data in rules:
            TrafficRule.objects.get_or_create(
                violation_type=rule_data['violation_type'],
                offense_number=rule_data['offense_number'],
                defaults=rule_data,
            )
            rules_created += 1

        # --- No Seatbelt ---
        seatbelt = ViolationType.objects.get(code='NO_SEATBELT')
        rules = [
            {'violation_type': seatbelt, 'offense_number': 1, 'time_window_days': 180, 'action': 'warning', 'fine_amount': 0, 'description': 'First offense — warning.'},
            {'violation_type': seatbelt, 'offense_number': 2, 'time_window_days': 180, 'action': 'fine', 'fine_amount': 500, 'description': 'Second offense — fine.'},
        ]
        for rule_data in rules:
            TrafficRule.objects.get_or_create(
                violation_type=rule_data['violation_type'],
                offense_number=rule_data['offense_number'],
                defaults=rule_data,
            )
            rules_created += 1

        # --- Drink Driving (IMMEDIATE) ---
        drink = ViolationType.objects.get(code='DRINK_DRIVING')
        TrafficRule.objects.get_or_create(
            violation_type=drink, offense_number=1,
            defaults={
                'violation_type': drink, 'offense_number': 1,
                'action': 'fine', 'fine_amount': 5000,
                'is_immediate': True,
                'description': 'Immediate fine — no warning.',
            },
        )
        rules_created += 1

        # --- Dangerous Driving (IMMEDIATE) ---
        dangerous = ViolationType.objects.get(code='DANGEROUS_DRIVING')
        TrafficRule.objects.get_or_create(
            violation_type=dangerous, offense_number=1,
            defaults={
                'violation_type': dangerous, 'offense_number': 1,
                'action': 'fine', 'fine_amount': 5000,
                'is_immediate': True,
                'description': 'Immediate fine — no warning.',
            },
        )
        rules_created += 1

        # --- Minor Overspeeding ---
        minor_speed = ViolationType.objects.get(code='MINOR_OVERSPEEDING')
        rules = [
            {'violation_type': minor_speed, 'offense_number': 1, 'time_window_days': 365, 'action': 'warning', 'fine_amount': 0, 'description': 'First offense — warning.'},
            {'violation_type': minor_speed, 'offense_number': 2, 'time_window_days': 365, 'action': 'fine', 'fine_amount': 1000, 'description': 'Repeated offense — fine.'},
        ]
        for rule_data in rules:
            TrafficRule.objects.get_or_create(
                violation_type=rule_data['violation_type'],
                offense_number=rule_data['offense_number'],
                defaults=rule_data,
            )
            rules_created += 1

        # --- Excessive Overspeeding (IMMEDIATE) ---
        excess_speed = ViolationType.objects.get(code='EXCESSIVE_OVERSPEEDING')
        TrafficRule.objects.get_or_create(
            violation_type=excess_speed, offense_number=1,
            defaults={
                'violation_type': excess_speed, 'offense_number': 1,
                'action': 'fine', 'fine_amount': 3000,
                'is_immediate': True,
                'description': 'Excessive speeding — immediate fine.',
            },
        )
        rules_created += 1

        # --- Running Red Light ---
        red_light = ViolationType.objects.get(code='RED_LIGHT')
        rules = [
            {'violation_type': red_light, 'offense_number': 1, 'time_window_days': 365, 'action': 'fine', 'fine_amount': 2000, 'description': 'First offense — fine.'},
            {'violation_type': red_light, 'offense_number': 2, 'time_window_days': 365, 'action': 'increased_fine', 'fine_amount': 4000, 'description': 'Repeat offense — increased fine.'},
        ]
        for rule_data in rules:
            TrafficRule.objects.get_or_create(
                violation_type=rule_data['violation_type'],
                offense_number=rule_data['offense_number'],
                defaults=rule_data,
            )
            rules_created += 1

        # --- Illegal Parking ---
        parking = ViolationType.objects.get(code='ILLEGAL_PARKING')
        rules = [
            {'violation_type': parking, 'offense_number': 1, 'time_window_days': 90, 'action': 'warning', 'fine_amount': 0, 'description': 'First offense — warning.'},
            {'violation_type': parking, 'offense_number': 2, 'time_window_days': 90, 'action': 'fine', 'fine_amount': 500, 'description': 'Repeat offense — fine.'},
        ]
        for rule_data in rules:
            TrafficRule.objects.get_or_create(
                violation_type=rule_data['violation_type'],
                offense_number=rule_data['offense_number'],
                defaults=rule_data,
            )
            rules_created += 1

        self.stdout.write(f'    -> {rules_created} traffic rules')

    def create_sample_users(self):
        self.stdout.write('  Creating sample users...')

        # Admin
        admin, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@fairtraffic.np',
                'first_name': 'System',
                'last_name': 'Administrator',
                'role': 'admin',
                'is_staff': True,
                'is_superuser': True,
            },
        )
        if created:
            admin.set_password('admin123')
            admin.save()

        # Officers
        for i, (fname, lname, badge) in enumerate([
            ('Ram', 'Thapa', 'TF-001'),
            ('Sita', 'Sharma', 'TF-002'),
        ], 1):
            officer, created = User.objects.get_or_create(
                username=f'officer{i}',
                defaults={
                    'email': f'officer{i}@fairtraffic.np',
                    'first_name': fname,
                    'last_name': lname,
                    'role': 'officer',
                    'phone': f'98410000{i:02d}',
                },
            )
            if created:
                officer.set_password('officer123')
                officer.save()
                OfficerProfile.objects.get_or_create(
                    user=officer,
                    defaults={
                        'badge_number': badge,
                        'station': 'Kathmandu Metropolitan Traffic Police',
                        'rank': 'si',
                    },
                )

        # Citizens
        for i, (fname, lname, license_no) in enumerate([
            ('Hari', 'Bahadur', 'NP-KTM-2024-001'),
            ('Gita', 'Devi', 'NP-KTM-2024-002'),
            ('Bikash', 'Gurung', 'NP-PKR-2024-003'),
        ], 1):
            citizen, created = User.objects.get_or_create(
                username=f'citizen{i}',
                defaults={
                    'email': f'citizen{i}@fairtraffic.np',
                    'first_name': fname,
                    'last_name': lname,
                    'role': 'citizen',
                    'phone': f'98510000{i:02d}',
                    'license_number': license_no,
                    'citizenship_number': f'24-01-76-{i:05d}',
                },
            )
            if created:
                citizen.set_password('citizen123')
                citizen.save()
                SafetyScore.objects.get_or_create(
                    driver=citizen,
                    defaults={'current_score': 100},
                )

        self.stdout.write('    -> 1 admin, 2 officers, 3 citizens')
        self.stdout.write('    -> Credentials:')
        self.stdout.write('      admin/admin123, officer1/officer123, citizen1/citizen123')
