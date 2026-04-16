"""
Governance business logic:
- Voting threshold checks (5% minimum)
- Quorum calculations
- Veto limits and windows
- Proposal extensions
- Vote finalization
"""
import logging
from datetime import datetime, timedelta
from decimal import Decimal
from typing import Optional

from django.utils import timezone
from discussion.models import Proposal, VoteRecord, Notification, Company
from discussion.services.blockchain import blockchain_service

logger = logging.getLogger(__name__)

# Constants
MIN_HOLDER_PERCENTAGE = Decimal('5')  # Minimum 5% to vote/comment
QUORUM_PERCENTAGE = Decimal('16')  # 16% quorum requirement
MAX_VETOES_PER_YEAR = 2
VETO_WINDOW_DAYS = 7
EXTENSION_DAYS = 3
MAX_EXTENSIONS = 2


class GovernanceService:
    """
    Enforces governance rules and processes proposal lifecycle.
    """

    @staticmethod
    def is_large_holder(
        wallet_address: str,
        company: Company,
        at_block: Optional[int] = None
    ) -> bool:
        """
        Check if a wallet holds ≥5% of total token supply.
        
        Args:
            wallet_address: Ethereum wallet address
            company: Company instance
            at_block: Optional block number (None = latest)
            
        Returns:
            True if balance >= 5% of total supply
        """
        try:
            balance = blockchain_service.get_balance_at_block(
                company.token_address,
                wallet_address,
                at_block
            )
            
            # Calculate 5% of total supply
            threshold = (company.total_supply * MIN_HOLDER_PERCENTAGE) / Decimal('100')
            
            result = balance >= threshold
            logger.info(
                f"Large holder check: {wallet_address[:8]}... "
                f"balance={balance}, threshold={threshold}, result={result}"
            )
            return result

        except Exception as e:
            logger.error(f"Error in is_large_holder: {str(e)}")
            return False

    @staticmethod
    def can_comment(user_address: str, proposal: Proposal) -> bool:
        """
        Check if user can comment on a proposal.
        Must be large holder at current block and proposal must be in DISCUSSION phase.
        
        Args:
            user_address: User's wallet address
            proposal: Proposal instance
            
        Returns:
            True if user meets requirements
        """
        # Must be in discussion phase
        if proposal.status != 'DISCUSSION':
            logger.info(f"Proposal {proposal.id} not in DISCUSSION phase")
            return False
        
        # Must be large holder
        return GovernanceService.is_large_holder(
            user_address,
            proposal.company
        )

    @staticmethod
    def can_vote(user_address: str, proposal: Proposal) -> bool:
        """
        Check if user can vote on a proposal.
        Must:
        - Be large holder at snapshot block
        - Proposal must be in VOTING phase
        - User hasn't already voted
        
        Args:
            user_address: User's wallet address
            proposal: Proposal instance
            
        Returns:
            True if user can vote
        """
        # Must be in voting phase
        if proposal.status != 'VOTING':
            logger.info(f"Proposal {proposal.id} not in VOTING phase")
            return False
        
        # Check if already voted
        if VoteRecord.objects.filter(
            proposal=proposal,
            voter_address=user_address
        ).exists():
            logger.info(f"User {user_address[:8]}... already voted on {proposal.id}")
            return False
        
        # Must be large holder at snapshot block
        is_holder = GovernanceService.is_large_holder(
            user_address,
            proposal.company,
            proposal.snapshot_block
        )
        
        if not is_holder:
            logger.info(f"User {user_address[:8]}... not large holder at snapshot")
        
        return is_holder

    @staticmethod
    def start_voting(proposal: Proposal) -> bool:
        """
        Transition proposal from DISCUSSION to VOTING.
        Fetches and stores the snapshot block number.
        
        Args:
            proposal: Proposal instance
            
        Returns:
            True if successful
        """
        try:
            # Must be in DISCUSSION phase
            if proposal.status != 'DISCUSSION':
                logger.warning(f"Cannot start voting: proposal not in DISCUSSION phase")
                return False
            
            # Get current block as snapshot
            current_block = blockchain_service.get_current_block()
            proposal.snapshot_block = current_block
            
            # Set voting period (e.g., 7 days)
            proposal.voting_start = timezone.now()
            proposal.voting_end = proposal.voting_start + timedelta(days=7)
            
            proposal.status = 'VOTING'
            proposal.save()
            
            logger.info(f"Proposal {proposal.id} started voting at block {current_block}")
            return True

        except Exception as e:
            logger.error(f"Error starting voting: {str(e)}")
            return False

    @staticmethod
    def calculate_quorum(proposal: Proposal) -> bool:
        """
        Check if quorum is reached: (YES + NO votes) >= 16% of total supply.
        Updates yes_votes_weight, no_votes_weight, and quorum_reached.
        
        Args:
            proposal: Proposal instance
            
        Returns:
            True if quorum reached
        """
        try:
            # Sum votes from local cache
            votes = VoteRecord.objects.filter(proposal=proposal)
            
            yes_votes = votes.filter(choice='YES').aggregate(
                total=models.Sum('weight')
            )['total'] or Decimal('0')
            
            no_votes = votes.filter(choice='NO').aggregate(
                total=models.Sum('weight')
            )['total'] or Decimal('0')
            
            total_votes = yes_votes + no_votes
            
            # Calculate quorum threshold (16% of total supply)
            quorum_threshold = (
                proposal.company.total_supply * QUORUM_PERCENTAGE
            ) / Decimal('100')
            
            quorum_reached = total_votes >= quorum_threshold
            
            # Update proposal
            proposal.yes_votes_weight = yes_votes
            proposal.no_votes_weight = no_votes
            proposal.quorum_reached = quorum_reached
            proposal.save()
            
            logger.info(
                f"Quorum check for proposal {proposal.id}: "
                f"votes={total_votes}, threshold={quorum_threshold}, "
                f"reached={quorum_reached}"
            )
            
            return quorum_reached

        except Exception as e:
            logger.error(f"Error calculating quorum: {str(e)}")
            return False

    @staticmethod
    def apply_extensions(proposal: Proposal) -> bool:
        """
        Extend voting period if quorum not met.
        Can extend max 2 times (3 days each extension).
        
        Args:
            proposal: Proposal instance
            
        Returns:
            True if extension applied, False if already at max extensions
        """
        # Must be past voting end
        if timezone.now() <= proposal.voting_end:
            logger.info(f"Proposal {proposal.id} voting still active")
            return False
        
        # Must not have reached max extensions
        if proposal.extension_count >= MAX_EXTENSIONS:
            logger.info(f"Proposal {proposal.id} at max extensions")
            return False
        
        # Extend voting period
        proposal.voting_end = proposal.voting_end + timedelta(days=EXTENSION_DAYS)
        proposal.extension_count += 1
        proposal.save()
        
        logger.info(f"Proposal {proposal.id} extended (count={proposal.extension_count})")
        return True

    @staticmethod
    def finalize_proposal(proposal: Proposal) -> bool:
        """
        Finalize a proposal after voting ends.
        Sets status based on quorum and vote outcome.
        Handles extensions if quorum not met.
        
        Args:
            proposal: Proposal instance
            
        Returns:
            True if finalized
        """
        try:
            # Must be in VOTING phase
            if proposal.status != 'VOTING':
                logger.warning(f"Proposal {proposal.id} not in VOTING phase")
                return False
            
            # Check if voting period has ended
            if timezone.now() <= proposal.voting_end:
                logger.info(f"Proposal {proposal.id} voting still active")
                return False
            
            # Calculate quorum
            GovernanceService.calculate_quorum(proposal)
            
            if not proposal.quorum_reached:
                # Try to extend
                if GovernanceService.apply_extensions(proposal):
                    logger.info(f"Proposal {proposal.id} extended, not finalized yet")
                    return False
                else:
                    # No more extensions - proposal dies
                    proposal.status = 'DIED'
                    proposal.save()
                    
                    # Notify voters
                    GovernanceService.notify_proposal_died(proposal)
                    
                    logger.info(f"Proposal {proposal.id} died (no quorum, no extensions left)")
                    return True
            
            # Quorum reached - determine outcome
            if proposal.yes_votes_weight > proposal.no_votes_weight:
                proposal.status = 'PASSED'
            else:
                proposal.status = 'FAILED'
            
            proposal.save()
            logger.info(f"Proposal {proposal.id} finalized: {proposal.status}")
            return True

        except Exception as e:
            logger.error(f"Error finalizing proposal: {str(e)}")
            return False

    @staticmethod
    def owner_can_veto(owner_address: str, proposal: Proposal) -> Tuple[bool, str]:
        """
        Check if owner can veto this proposal.
        Constraints:
        - Must be owner of the company
        - Max 2 vetoes per calendar year
        - Must be within 7 days of voting end
        
        Args:
            owner_address: Address trying to veto
            proposal: Proposal instance
            
        Returns:
            Tuple of (can_veto: bool, reason: str)
        """
        # Check owner address
        if owner_address.lower() != proposal.company.owner_address.lower():
            return False, "Only company owner can veto"
        
        # Check timing (within 7 days of voting end)
        if not proposal.voting_end:
            return False, "Proposal voting has not ended"
        
        days_since_end = (timezone.now() - proposal.voting_end).days
        if days_since_end > VETO_WINDOW_DAYS:
            return False, f"Veto window closed (was {VETO_WINDOW_DAYS} days)"
        
        # Check veto count this year
        current_year = timezone.now().year
        veto_count = Proposal.objects.filter(
            company=proposal.company,
            status='VETOED',
            veto_date__year=current_year
        ).count()
        
        if veto_count >= MAX_VETOES_PER_YEAR:
            return False, f"Already used {MAX_VETOES_PER_YEAR} vetoes this year"
        
        return True, "Can veto"

    @staticmethod
    def execute_veto(proposal: Proposal, owner_key: str) -> bool:
        """
        Execute a veto on a proposal.
        Sends veto transaction to blockchain and updates proposal status.
        
        Args:
            proposal: Proposal instance
            owner_key: Private key of owner
            
        Returns:
            True if successful
        """
        try:
            can_veto, reason = GovernanceService.owner_can_veto(
                proposal.company.owner_address,
                proposal
            )
            
            if not can_veto:
                logger.warning(f"Cannot veto proposal {proposal.id}: {reason}")
                return False
            
            # Send veto transaction
            tx_hash = blockchain_service.record_veto(
                proposal.id,
                owner_key
            )
            
            # Update proposal
            proposal.status = 'VETOED'
            proposal.veto_date = timezone.now()
            proposal.save()
            
            logger.info(f"Proposal {proposal.id} vetoed (tx: {tx_hash})")
            return True

        except Exception as e:
            logger.error(f"Error executing veto: {str(e)}")
            return False

    @staticmethod
    def notify_proposal_died(proposal: Proposal) -> None:
        """
        Send notifications to all users who voted that proposal has died.
        
        Args:
            proposal: Proposal instance
        """
        try:
            # Get all voters
            voters = VoteRecord.objects.filter(
                proposal=proposal
            ).values_list('voter_address', flat=True).distinct()
            
            # Create notifications
            notifications = [
                Notification(
                    recipient_address=voter,
                    proposal=proposal,
                    notification_type='PROPOSAL_DIED',
                    message=f"Proposal '{proposal.title}' died due to insufficient quorum."
                )
                for voter in voters
            ]
            
            Notification.objects.bulk_create(notifications)
            logger.info(f"Created {len(notifications)} notifications for proposal {proposal.id}")

        except Exception as e:
            logger.error(f"Error notifying proposal death: {str(e)}")

    @staticmethod
    def sync_votes_from_blockchain(proposal: Proposal) -> None:
        """
        Polls blockchain for VoteCast events and syncs to local cache.
        Used by Celery tasks for periodic polling.
        
        Args:
            proposal: Proposal instance
        """
        try:
            # This would use blockchain_service to listen for events
            # Implementation depends on specific blockchain setup
            logger.info(f"Syncing votes for proposal {proposal.id}")

        except Exception as e:
            logger.error(f"Error syncing votes: {str(e)}")


# Import here to avoid circular imports
from django.db import models
from typing import Tuple
