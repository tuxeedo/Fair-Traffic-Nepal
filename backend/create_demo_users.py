import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'fairtraffic.settings')
django.setup()

from django.contrib.auth import get_user_model
from accounts.models import OfficerProfile

User = get_user_model()

def create_users():
    # 1. Admin User
    if not User.objects.filter(username='admin').exists():
        admin = User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
        admin.role = User.Role.ADMIN
        admin.save()
        print("Created Admin user: admin / admin123")
    else:
        print("Admin user already exists.")

    # 2. Officer User
    if not User.objects.filter(username='officer').exists():
        officer = User.objects.create_user('officer', 'officer@example.com', 'officer123')
        officer.role = User.Role.OFFICER
        officer.first_name = "John"
        officer.last_name = "Officer"
        officer.save()
        
        OfficerProfile.objects.create(
            user=officer,
            badge_number="POLICE-101",
            station="Central Headquarters",
            rank=OfficerProfile.Rank.INSPECTOR,
        )
        print("Created Officer user: officer / officer123")
    else:
        print("Officer user already exists.")

    # 3. Citizen User
    if not User.objects.filter(username='citizen').exists():
        citizen = User.objects.create_user('citizen', 'citizen@example.com', 'citizen123')
        citizen.role = User.Role.CITIZEN
        citizen.first_name = "Jane"
        citizen.last_name = "Citizen"
        citizen.license_number = "DL-987654321"
        citizen.save()
        print("Created Citizen user: citizen / citizen123")
    else:
        print("Citizen user already exists.")

if __name__ == '__main__':
    create_users()
