"""Django signals for discussion app."""
from django.db.models.signals import post_save
from django.dispatch import receiver
from discussion.models import Proposal, Notification


@receiver(post_save, sender=Proposal)
def notify_proposal_status_change(sender, instance, created, **kwargs):
    """
    Send notifications when proposal status changes.
    """
    if created:
        # New proposal created - could notify interested parties
        pass
    else:
        # Proposal updated - check for status changes
        pass
