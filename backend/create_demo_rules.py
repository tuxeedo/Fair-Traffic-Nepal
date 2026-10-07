import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'fairtraffic.settings')
django.setup()

from violations.models import ViolationType, TrafficRule

def populate_rules():
    print("Populating all 4-Level Traffic Rules provided...")

    # Clear existing rules for a clean slate
    TrafficRule.objects.all().delete()
    ViolationType.objects.all().delete()

    # --- LEVEL 1: Educational (-2 points) ---
    level1_rules = [
        ("IMPROPER_PARKING", "Improper parking"),
        ("LANE_DISCIPLINE", "Slight lane discipline issue"),
        ("MISSING_DOCS", "Missing required documents"),
        ("UNCLEAR_PLATE", "Dirty or unclear number plate"),
        ("HELMET_STRAP", "Minor helmet strap issue")
    ]
    
    for code, name in level1_rules:
        v_type = ViolationType.objects.create(
            code=code,
            name=name,
            category=ViolationType.Category.EDUCATIONAL,
            base_fine_amount=500.00,
            score_deduction=2,
            description="Mistakes that usually don't create immediate danger."
        )
        TrafficRule.objects.create(violation_type=v_type, offense_number=1, time_window_days=365, action=TrafficRule.Action.WARNING, fine_amount=0, description="1st Offense: Warning")
        TrafficRule.objects.create(violation_type=v_type, offense_number=2, time_window_days=365, action=TrafficRule.Action.FINE, fine_amount=500.00, description="2nd Offense: Small Fine")
        TrafficRule.objects.create(violation_type=v_type, offense_number=3, time_window_days=365, action=TrafficRule.Action.INCREASED_FINE, fine_amount=1000.00, description="3rd Offense: Higher Fine")
        TrafficRule.objects.create(violation_type=v_type, offense_number=4, time_window_days=365, action=TrafficRule.Action.INCREASED_FINE, fine_amount=2000.00, description="4th Offense: Higher Fine + Score Deduction")

    # --- LEVEL 2: Moderate (-5 points) ---
    level2_rules = [
        ("NO_HELMET", "No helmet"),
        ("NO_SEATBELT", "Seat belt not worn"),
        ("MOBILE_PHONE", "Mobile phone while driving"),
        ("SPEEDING_MINOR", "Speeding (small amount)"),
        ("IGNORE_MARKINGS", "Ignoring lane markings")
    ]
    
    for code, name in level2_rules:
        v_type = ViolationType.objects.create(
            code=code,
            name=name,
            category=ViolationType.Category.MODERATE,
            base_fine_amount=1000.00,
            score_deduction=5,
            description="Moderate violations needing immediate correction."
        )
        TrafficRule.objects.create(violation_type=v_type, offense_number=1, time_window_days=365, action=TrafficRule.Action.FINE, fine_amount=1000.00, is_immediate=True, description="Immediate Fine")

    # --- LEVEL 3: Dangerous (-15 points) ---
    level3_rules = [
        ("RED_LIGHT", "Running red light"),
        ("DANGEROUS_OVERTAKING", "Dangerous overtaking"),
        ("OPPOSITE_DIRECTION", "Driving opposite direction"),
        ("OVERLOADING", "Overloading passengers"),
        ("NO_LICENSE", "Driving without license")
    ]

    for code, name in level3_rules:
        v_type = ViolationType.objects.create(
            code=code,
            name=name,
            category=ViolationType.Category.DANGEROUS,
            base_fine_amount=2000.00,
            score_deduction=15,
            description="Dangerous behaviors that risk lives."
        )
        TrafficRule.objects.create(violation_type=v_type, offense_number=1, time_window_days=365, action=TrafficRule.Action.INCREASED_FINE, fine_amount=2000.00, is_immediate=True, description="Higher Fine + Large Score Deduction")

    # --- LEVEL 4: Critical (-40 to -100 points) ---
    level4_rules = [
        ("DRINK_DRIVING", "Drink driving", 40, TrafficRule.Action.LICENSE_SUSPENSION),
        ("DRUG_DRIVING", "Drug driving", 40, TrafficRule.Action.LICENSE_SUSPENSION),
        ("HIT_AND_RUN", "Hit and run", 100, TrafficRule.Action.LICENSE_SUSPENSION),
        ("FAKE_PLATE", "Fake number plate", 40, TrafficRule.Action.LICENSE_SUSPENSION),
        ("RECKLESS_RACING", "Reckless racing", 40, TrafficRule.Action.LICENSE_SUSPENSION),
        ("REPEATED_DANGEROUS", "Repeated dangerous offenses", 40, TrafficRule.Action.LICENSE_SUSPENSION)
    ]

    for code, name, points, action in level4_rules:
        v_type = ViolationType.objects.create(
            code=code,
            name=name,
            category=ViolationType.Category.CRITICAL,
            base_fine_amount=5000.00,
            score_deduction=points,
            description="Critical violations with severe penalties."
        )
        TrafficRule.objects.create(violation_type=v_type, offense_number=1, time_window_days=365, action=action, fine_amount=5000.00, is_immediate=True, description="Immediate Heavy Penalty & License Suspension")

    print(f"Populated all {len(level1_rules) + len(level2_rules) + len(level3_rules) + len(level4_rules)} traffic rules!")

if __name__ == '__main__':
    populate_rules()
