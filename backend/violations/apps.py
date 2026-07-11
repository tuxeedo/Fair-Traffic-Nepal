from django.apps import AppConfig


class ViolationsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'violations'
    verbose_name = 'Violations & Rule Engine'

    def ready(self):
        import violations.signals  # noqa: F401
