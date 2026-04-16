"""
Django signals for discussion app.
"""
import logging
from django.db.models.signals import post_save
from django.dispatch import receiver
from discussion.models import Proposal, Notification

logger = logging.getLogger(__name__)


@receiver(post_save, sender=Proposal)
def notify_proposal_status_change(sender, instance, created, **kwargs):
    """
    Send notifications when proposal status changes.
    """
    if created:
        # New proposal created - could notify interested parties
        logger.info(f"New proposal created: {instance.id}")
    else:
        # Proposal updated - check for status changes
        logger.info(f"Proposal {instance.id} updated: {instance.status}")
