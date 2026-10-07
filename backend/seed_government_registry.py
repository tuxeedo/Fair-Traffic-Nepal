import os
import sys
import django

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'fairtraffic.settings')
django.setup()

from accounts.models import GovernmentCitizenRecord

CITIZENS_DATA = [
    {
        "full_name": "Abhi Karki",
        "first_name": "Abhi",
        "last_name": "Karki",
        "citizenship_number": "27-01-75-00001",
        "nid_number": "100-000-000001",
        "license_number": "70-00-00000001",
        "phone": "+977 9841000001",
        "date_of_birth": "2001-03-12", # Age 25
        "address": "Baneshwor, Kathmandu, Nepal",
    },
    {
        "full_name": "Abheshek Chaudhary",
        "first_name": "Abheshek",
        "last_name": "Chaudhary",
        "citizenship_number": "27-01-75-00002",
        "nid_number": "100-000-000002",
        "license_number": "70-00-00000002",
        "phone": "+977 9841000002",
        "date_of_birth": "2002-07-24", # Age 24
        "address": "Lalitpur, Nepal",
    },
    {
        "full_name": "Ragib Khyaju",
        "first_name": "Ragib",
        "last_name": "Khyaju",
        "citizenship_number": "27-01-75-00003",
        "nid_number": "100-000-000003",
        "license_number": "70-00-00000003",
        "phone": "+977 9741000003",
        "date_of_birth": "2003-11-08", # Age 23
        "address": "Bhaktapur, Nepal",
    },
    {
        "full_name": "Pranish Machamasi",
        "first_name": "Pranish",
        "last_name": "Machamasi",
        "citizenship_number": "27-01-75-00004",
        "nid_number": "100-000-000004",
        "license_number": "70-00-00000004",
        "phone": "+977 9841000004",
        "date_of_birth": "2001-01-19", # Age 25
        "address": "Thimi, Bhaktapur, Nepal",
    },
    {
        "full_name": "Alisha Chaudhary",
        "first_name": "Alisha",
        "last_name": "Chaudhary",
        "citizenship_number": "27-01-75-00005",
        "nid_number": "100-000-000005",
        "license_number": "70-00-00000005",
        "phone": "+977 9741000005",
        "date_of_birth": "2002-09-30", # Age 24
        "address": "Pokhara, Kaski, Nepal",
    },
    {
        "full_name": "Sneha Shah",
        "first_name": "Sneha",
        "last_name": "Shah",
        "citizenship_number": "27-01-75-00006",
        "nid_number": "100-000-000006",
        "license_number": "70-00-00000006",
        "phone": "+977 9841000006",
        "date_of_birth": "2003-12-05", # Age 23
        "address": "Biratnagar, Morang, Nepal",
    },
    {
        "full_name": "Sabin Shrestha",
        "first_name": "Sabin",
        "last_name": "Shrestha",
        "citizenship_number": "27-01-75-00007",
        "nid_number": "100-000-000007",
        "license_number": "70-00-00000007",
        "phone": "+977 9741000007",
        "date_of_birth": "2001-04-14", # Age 25
        "address": "Kirtipur, Kathmandu, Nepal",
    },
    {
        "full_name": "Pawan Regmi",
        "first_name": "Pawan",
        "last_name": "Regmi",
        "citizenship_number": "27-01-75-00008",
        "nid_number": "100-000-000008",
        "license_number": "70-00-00000008",
        "phone": "+977 9841000008",
        "date_of_birth": "2002-08-22", # Age 24
        "address": "Butwal, Rupandehi, Nepal",
    },
    {
        "full_name": "Sabin Tamang",
        "first_name": "Sabin",
        "last_name": "Tamang",
        "citizenship_number": "27-01-75-00009",
        "nid_number": "100-000-000009",
        "license_number": "70-00-00000009",
        "phone": "+977 9741000009",
        "date_of_birth": "2003-02-17", # Age 23
        "address": "Bouddha, Kathmandu, Nepal",
    },
    {
        "full_name": "Nishcal Shakya",
        "first_name": "Nishcal",
        "last_name": "Shakya",
        "citizenship_number": "27-01-75-00010",
        "nid_number": "100-000-000010",
        "license_number": "70-00-00000010",
        "phone": "+977 9841000010",
        "date_of_birth": "2001-10-11", # Age 25
        "address": "Patan, Lalitpur, Nepal",
    },
    {
        "full_name": "Jay Joshi",
        "first_name": "Jay",
        "last_name": "Joshi",
        "citizenship_number": "27-01-75-00011",
        "nid_number": "100-000-000011",
        "license_number": "70-00-00000011",
        "phone": "+977 9841000011",
        "date_of_birth": "1990-06-25", # Age 36
        "address": "Dhangadhi, Kailali, Nepal",
    },
]

def seed_registry():
    print("Seeding Government Citizen Registry Database...")
    created_count = 0
    updated_count = 0

    for data in CITIZENS_DATA:
        # Check by citizenship_number or nid_number
        record, created = GovernmentCitizenRecord.objects.update_or_create(
            citizenship_number=data["citizenship_number"],
            defaults={
                "full_name": data["full_name"],
                "first_name": data["first_name"],
                "last_name": data["last_name"],
                "nid_number": data["nid_number"],
                "license_number": data["license_number"],
                "phone": data["phone"],
                "date_of_birth": data["date_of_birth"],
                "address": data["address"],
            }
        )
        if created:
            created_count += 1
        else:
            updated_count += 1

    print(f"Seeding Complete! Created: {created_count}, Updated: {updated_count} citizen records.")



if __name__ == '__main__':
    seed_registry()
