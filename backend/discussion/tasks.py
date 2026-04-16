"""
Celery background tasks for discussion app.
Handles periodic checks and event syncing.
"""
from celery import shared_task
import logging
from django.utils import timezone
from discussion.models import Proposal
from discussion.services.governance import GovernanceService
from discussion.services.blockchain import blockchain_service

logger = logging.getLogger(__name__)


@shared_task
def task_check_quorum_periodically():
    """
    Periodic task: Check all proposals in VOTING phase.
    - Apply extensions if quorum not met
    - Finalize proposals whose voting period has ended
    
    Runs every hour via Celery beat.
    """
    try:
        voting_proposals = Proposal.objects.filter(status='VOTING')
        
        for proposal in voting_proposals:
            if timezone.now() >= proposal.voting_end:
                # Voting has ended, try to finalize
                GovernanceService.finalize_proposal(proposal)
                logger.info(f"Processed proposal {proposal.id}")
        
        logger.info(f"Quorum check task completed for {voting_proposals.count()} proposals")
    
    except Exception as e:
        logger.error(f"Error in task_check_quorum_periodically: {str(e)}")


@shared_task
def task_poll_vote_events(proposal_id):
    """
    Poll blockchain for VoteCast events for a specific proposal.
    Syncs on-chain votes to local VoteRecord cache.
    
    Can be called:
    - On demand when a user votes
    - Periodically for active proposals
    
    Args:
        proposal_id: ID of the proposal to sync
    """
    try:
        proposal = Proposal.objects.get(id=proposal_id)
        
        if proposal.status != 'VOTING':
            logger.info(f"Proposal {proposal_id} not in voting status, skipping")
            return
        
        # Sync votes from blockchain
        GovernanceService.sync_votes_from_blockchain(proposal)
        
        # Update quorum status
        GovernanceService.calculate_quorum(proposal)
        
        logger.info(f"Vote polling completed for proposal {proposal_id}")
    
    except Proposal.DoesNotExist:
        logger.error(f"Proposal {proposal_id} not found")
    except Exception as e:
        logger.error(f"Error in task_poll_vote_events: {str(e)}")


@shared_task
def task_notify_proposal_died(proposal_id):
    """
    Send notifications to all voters that a proposal has died.
    Called when a proposal reaches the end of voting without quorum
    and can't be extended further.
    
    Args:
        proposal_id: ID of the proposal that died
    """
    try:
        proposal = Proposal.objects.get(id=proposal_id)
        
        if proposal.status != 'DIED':
            logger.warning(f"Proposal {proposal_id} is not in DIED status")
            return
        
        GovernanceService.notify_proposal_died(proposal)
        logger.info(f"Notifications sent for proposal {proposal_id}")
    
    except Proposal.DoesNotExist:
        logger.error(f"Proposal {proposal_id} not found")
    except Exception as e:
        logger.error(f"Error in task_notify_proposal_died: {str(e)}")


@shared_task
def task_sync_token_supply():
    """
    Periodic task: Sync total token supply from blockchain.
    Updates cached value in Company model.
    
    Runs daily via Celery beat.
    """
    try:
        from discussion.models import Company
        
        for company in Company.objects.all():
            try:
                supply = blockchain_service.get_total_supply(
                    company.token_address
                )
                
                if supply != company.total_supply:
                    company.total_supply = supply
                    company.save()
                    logger.info(
                        f"Updated supply for {company.name}: {supply}"
                    )
            
            except Exception as e:
                logger.error(
                    f"Error updating supply for {company.name}: {str(e)}"
                )
    
    except Exception as e:
        logger.error(f"Error in task_sync_token_supply: {str(e)}")


@shared_task
def task_vote_event_listener(proposal_id):
    """
    Long-running task (if using event streaming):
    Listen for VoteCast events on the blockchain for a proposal.
    
    In production with Web3.py event filters, this would:
    1. Create event filter for VoteCast(indexed proposalId)
    2. Poll for new events
    3. Update VoteRecord cache
    4. Update quorum calculation
    
    Note: This is simplified. Real implementation would use
    event subscription via provider (e.g., Alchemy, Infura).
    
    Args:
        proposal_id: ID of the proposal
    """
    try:
        logger.info(f"Starting vote event listener for proposal {proposal_id}")
        
        # Placeholder: Real implementation would use Web3.py event filters
        # and long-poll or websocket for new events
        
        logger.info(f"Vote event listener completed for proposal {proposal_id}")
    
    except Exception as e:
        logger.error(f"Error in task_vote_event_listener: {str(e)}")


# Celery Beat Schedule Configuration
# Add to settings.py:
#
# from celery.schedules import crontab
#
# CELERY_BEAT_SCHEDULE = {
#     'check-quorum-every-hour': {
#         'task': 'discussion.tasks.task_check_quorum_periodically',
#         'schedule': crontab(minute=0),  # Every hour at :00
#     },
#     'sync-token-supply-daily': {
#         'task': 'discussion.tasks.task_sync_token_supply',
#         'schedule': crontab(hour=0, minute=0),  # Daily at midnight
#     },
# }
