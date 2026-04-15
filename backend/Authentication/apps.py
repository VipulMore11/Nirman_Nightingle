from django.apps import AppConfig

class AuthenticationConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'Authentication'
    label = 'authentication_app'

    def ready(self):
        import Authentication.signals   