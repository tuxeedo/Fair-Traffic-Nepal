"""
FairTraffic Rule Engine.

Evaluates the appropriate enforcement action (warning or fine) based on:
  - Violation type and its configured rules
  - Driver's violation history
  - Number of previous offenses within the time window
  - Whether the violation demands immediate action

The admin can modify TrafficRule entries via the UI to change policies
without any source code changes.
"""

from datetime import timedelta
from django.utils import timezone
from django.conf import settings

from .models import TrafficRule, Violation, SafetyScore, SafetyScoreHistory


def evaluate_violation(driver, violation_type):
    """
    Determine the recommended action for a violation.

    Args:
        driver: User instance (the offending driver)
        violation_type: ViolationType instance

    Returns:
        dict with keys:
            action: 'warning' or 'fine'
            fine_amount: Decimal amount (0 for warnings)
            rule_applied: TrafficRule instance or None
            offense_number: int — which offense this is
            reason: str — human-readable explanation
    """
    rules = TrafficRule.objects.filter(
        violation_type=violation_type
    ).order_by('offense_number')

    if not rules.exists():
        # No rules configured — fall back to default fine
        return {
            'action': 'fine',
            'fine_amount': violation_type.base_fine_amount,
            'rule_applied': None,
            'offense_number': 1,
            'reason': f'No rules configured for {violation_type.name}. Default fine applied.',
        }

    # Check for immediate-action rules first (e.g. Drink Driving → always fine)
    immediate_rule = rules.filter(is_immediate=True).first()
    if immediate_rule:
        return {
            'action': immediate_rule.action,
            'fine_amount': immediate_rule.fine_amount,
            'rule_applied': immediate_rule,
            'offense_number': 0,
            'reason': f'{violation_type.name}: Immediate {immediate_rule.get_action_display()} — {immediate_rule.description or "no exceptions"}.',
        }

    # Count previous offenses of this violation type within the time window
    # Use the largest time window among all rules
    max_window = max(rule.time_window_days for rule in rules)
    window_start = timezone.now() - timedelta(days=max_window)

    previous_count = Violation.objects.filter(
        driver=driver,
        violation_type=violation_type,
        created_at__gte=window_start,
    ).count()

    # Current offense number (1-based: first offense = 1)
    current_offense = previous_count + 1

    # Find the matching rule tier
    matched_rule = None
    for rule in rules:
        if rule.offense_number == current_offense:
            matched_rule = rule
            break

    if matched_rule is None:
        # Offense exceeds configured tiers → use the last (highest) rule
        matched_rule = rules.last()

    return {
        'action': 'warning' if matched_rule.action == 'warning' else 'fine',
        'fine_amount': matched_rule.fine_amount,
        'rule_applied': matched_rule,
        'offense_number': current_offense,
        'reason': (
            f'{violation_type.name}: Offense #{current_offense} within '
            f'{matched_rule.time_window_days} days → '
            f'{matched_rule.get_action_display()}.'
        ),
    }


def update_safety_score(driver, violation, action_taken):
    """
    Update the driver's safety score based on the violation and action.
    Points are deducted based on the violation_type's score_deduction,
    unless the action_taken is a warning (which does not deduct points).
    """
    score_obj, created = SafetyScore.objects.get_or_create(
        driver=driver,
        defaults={'current_score': getattr(settings, 'SAFETY_SCORE_INITIAL', 100)},
    )

    # Don't deduct points for warnings based on the new logic.
    if action_taken == 'warning':
        return score_obj

    deduction = violation.violation_type.score_deduction
    if deduction <= 0:
        return score_obj

    delta = -deduction
    reason = f'Penalty for: {violation.violation_type.name}'

    previous_score = score_obj.current_score
    min_score = getattr(settings, 'SAFETY_SCORE_MIN', 0)
    max_score = getattr(settings, 'SAFETY_SCORE_MAX', 100)
    
    new_score = max(
        min_score,
        min(max_score, previous_score + delta),
    )
    score_obj.current_score = new_score
    score_obj.save()

    SafetyScoreHistory.objects.create(
        driver=driver,
        score_change=delta,
        reason=reason,
        previous_score=previous_score,
        new_score=new_score,
        violation=violation,
    )

    return score_obj


def restore_safety_score(driver, violation):
    """
    Restore safety score points when an appeal is accepted.
    Reverses the deduction that was applied for this violation.
    """
    history_entry = SafetyScoreHistory.objects.filter(
        driver=driver, violation=violation
    ).first()

    if not history_entry:
        return

    score_obj = SafetyScore.objects.get(driver=driver)
    restore_amount = abs(history_entry.score_change)
    previous_score = score_obj.current_score
    new_score = min(settings.SAFETY_SCORE_MAX, previous_score + restore_amount)

    score_obj.current_score = new_score
    score_obj.save()

    SafetyScoreHistory.objects.create(
        driver=driver,
        score_change=restore_amount,
        reason=f'Appeal accepted — restored points for: {violation.violation_type.name}',
        previous_score=previous_score,
        new_score=new_score,
        violation=violation,
    )
