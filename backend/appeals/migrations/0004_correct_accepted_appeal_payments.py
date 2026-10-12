from django.db import migrations


def correct_false_payments(apps, schema_editor):
    Violation = apps.get_model('violations', 'Violation')
    # Old acceptance marked a fine paid without a payment timestamp.
    # Preserve actual payment records and timestamps for financial history.
    Violation.objects.using(schema_editor.connection.alias).filter(
        appeal__status='accepted', is_paid=True, paid_at__isnull=True,
        payments__isnull=True,
    ).update(is_paid=False)


class Migration(migrations.Migration):
    dependencies = [
        ('appeals', '0003_appeal_appeal_count_alter_appeal_status'),
        ('violations', '0004_violationtype_score_deduction_and_more'),
    ]
    operations = [migrations.RunPython(correct_false_payments, migrations.RunPython.noop)]
