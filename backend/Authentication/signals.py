from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User, KYC

@receiver(post_save, sender=User)
def create_kyc(sender, instance, created, **kwargs):
    if created:
        KYC.objects.create(user=instance)
    print("KYC created for:", instance.email)