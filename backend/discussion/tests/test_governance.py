"""
Unit tests for governance business logic (services/governance.py).
Tests core governance rules: thresholds, quorum, veto limits, extensions, etc.
"""
from datetime import datetime, timedelta
from decimal import Decimal
from unittest.mock import patch, MagicMock
from django.test import TestCase
from django.utils import timezone
from freezegun import freeze_time

from discussion.models import Company, Proposal, VoteRecord, Notification
from discussion.services.governance import GovernanceService
from discussion.tests.factories import (
    CompanyFactory,
    UserFactory,
    VotingProposalFactory,
    DraftProposalFactory,
    DiscussionProposalFactory,
    PassedProposalFactory,
    DiedProposalFactory,
    YesVoteFactory,
    NoVoteFactory,
)
from discussion.tests.mock_web3 import MockWeb3


class LargeHolderThresholdTestCase(TestCase):
    """Test 5% holder threshold for voting/commenting/proposing."""

    def setUp(self):
        """Create test company and mock blockchain."""
        self.company = CompanyFactory()
        self.mock_web3 = MockWeb3()
        self.wallet = '0x' + 'a' * 40

    def test_exactly_five_percent_is_large_holder(self):
        """Test that exactly 5% is considered large holder (edge case)."""
        # 5% of 1M = 50k
        balance = (self.company.total_supply * Decimal('5')) / Decimal('100')
        self.mock_web3.set_balance(self.wallet, balance)

        with patch(
            'discussion.services.governance.blockchain_service.get_balance_at_block',
            return_value=balance
        ):
            result = GovernanceService.is_large_holder(
                self.wallet,
                self.company
            )

        self.assertTrue(result, "Exactly 5% should be large holder")

    def test_just_below_five_percent_not_large_holder(self):
        """Test that 4.99% is NOT a large holder."""
        balance = (self.company.total_supply * Decimal('4.99')) / Decimal('100')
        
        with patch(
            'discussion.services.governance.blockchain_service.get_balance_at_block',
            return_value=balance
        ):
            result = GovernanceService.is_large_holder(
                self.wallet,
                self.company
            )

        self.assertFalse(result, "Below 5% should not be large holder")

    def test_just_above_five_percent_is_large_holder(self):
        """Test that 5.01% is a large holder."""
        balance = (self.company.total_supply * Decimal('5.01')) / Decimal('100')
        
        with patch(
            'discussion.services.governance.blockchain_service.get_balance_at_block',
            return_value=balance
        ):
            result = GovernanceService.is_large_holder(
                self.wallet,
                self.company
            )

        self.assertTrue(result, "Above 5% should be large holder")

    def test_zero_balance_not_large_holder(self):
        """Test that zero balance is not a large holder."""
        with patch(
            'discussion.services.governance.blockchain_service.get_balance_at_block',
            return_value=Decimal('0')
        ):
            result = GovernanceService.is_large_holder(
                self.wallet,
                self.company
            )

        self.assertFalse(result, "Zero balance should not be large holder")

    def test_large_holder_at_specific_block(self):
        """Test large holder check at specific block number."""
        balance = (self.company.total_supply * Decimal('10')) / Decimal('100')
        block = 12345
        
        with patch(
            'discussion.services.governance.blockchain_service.get_balance_at_block',
            return_value=balance
        ) as mock_balance:
            result = GovernanceService.is_large_holder(
                self.wallet,
                self.company,
                at_block=block
            )

        self.assertTrue(result)
        # Verify the block was passed
        mock_balance.assert_called_with(
            self.company.token_address,
            self.wallet,
            block
        )


class QuorumCalculationTestCase(TestCase):
    """Test quorum calculation (16% of total supply)."""

    def setUp(self):
        """Create test proposal."""
        self.company = CompanyFactory()
        self.proposal = VotingProposalFactory(company=self.company)

    def test_quorum_not_reached_below_16_percent(self):
        """Test that 15% total votes does NOT reach quorum."""
        # Create votes summing to 15% (<16%)
        yes_weight = (self.company.total_supply * Decimal('10')) / Decimal('100')
        no_weight = (self.company.total_supply * Decimal('5')) / Decimal('100')
        
        YesVoteFactory(proposal=self.proposal, weight=yes_weight)
        NoVoteFactory(proposal=self.proposal, weight=no_weight)

        result = GovernanceService.calculate_quorum(self.proposal)

        self.assertFalse(result, "15% should not reach 16% quorum")

    def test_quorum_exactly_sixteen_percent(self):
        """Test that exactly 16% reaches quorum (edge case)."""
        # Create votes summing to 16%
        yes_weight = (self.company.total_supply * Decimal('10')) / Decimal('100')
        no_weight = (self.company.total_supply * Decimal('6')) / Decimal('100')
        
        YesVoteFactory(proposal=self.proposal, weight=yes_weight)
        NoVoteFactory(proposal=self.proposal, weight=no_weight)

        result = GovernanceService.calculate_quorum(self.proposal)

        self.assertTrue(result, "Exactly 16% should reach quorum")

    def test_quorum_above_sixteen_percent(self):
        """Test that 17% reaches quorum."""
        yes_weight = (self.company.total_supply * Decimal('10')) / Decimal('100')
        no_weight = (self.company.total_supply * Decimal('7')) / Decimal('100')
        
        YesVoteFactory(proposal=self.proposal, weight=yes_weight)
        NoVoteFactory(proposal=self.proposal, weight=no_weight)

        result = GovernanceService.calculate_quorum(self.proposal)

        self.assertTrue(result, "17% should reach quorum")

    def test_all_yes_votes_for_quorum(self):
        """Test quorum with only YES votes (no NO votes)."""
        yes_weight = (self.company.total_supply * Decimal('20')) / Decimal('100')
        
        YesVoteFactory(proposal=self.proposal, weight=yes_weight)

        result = GovernanceService.calculate_quorum(self.proposal)

        self.assertTrue(result, "20% YES votes should reach quorum")

    def test_all_no_votes_for_quorum(self):
        """Test quorum with only NO votes (no YES votes)."""
        no_weight = (self.company.total_supply * Decimal('20')) / Decimal('100')
        
        NoVoteFactory(proposal=self.proposal, weight=no_weight)

        result = GovernanceService.calculate_quorum(self.proposal)

        self.assertTrue(result, "20% NO votes should reach quorum")


class ProposalExtensionTestCase(TestCase):
    """Test proposal extension logic (max 2 extensions of 3 days each)."""

    def setUp(self):
        """Create test proposal."""
        self.company = CompanyFactory()
        self.proposal = VotingProposalFactory(
            company=self.company,
            voting_end=timezone.now() - timedelta(hours=1),
            extension_count=0
        )

    def test_first_extension_succeeds(self):
        """Test that first extension is applied."""
        original_end = self.proposal.voting_end
        
        result = GovernanceService.apply_extensions(self.proposal)

        self.assertTrue(result, "First extension should succeed")
        self.assertEqual(self.proposal.extension_count, 1)
        self.assertEqual(
            self.proposal.voting_end,
            original_end + timedelta(days=3)
        )

    def test_second_extension_succeeds(self):
        """Test that second extension is applied."""
        self.proposal.extension_count = 1
        self.proposal.save()
        original_end = self.proposal.voting_end
        
        result = GovernanceService.apply_extensions(self.proposal)

        self.assertTrue(result, "Second extension should succeed")
        self.assertEqual(self.proposal.extension_count, 2)
        self.assertEqual(
            self.proposal.voting_end,
            original_end + timedelta(days=3)
        )

    def test_third_extension_fails(self):
        """Test that third extension fails (max 2)."""
        self.proposal.extension_count = 2
        self.proposal.save()
        
        result = GovernanceService.apply_extensions(self.proposal)

        self.assertFalse(result, "Third extension should fail (max 2 allowed)")
        self.assertEqual(self.proposal.extension_count, 2)

    def test_extension_while_voting_active_fails(self):
        """Test that extension fails while voting is still active."""
        self.proposal.voting_end = timezone.now() + timedelta(days=1)
        self.proposal.save()
        
        result = GovernanceService.apply_extensions(self.proposal)

        self.assertFalse(result, "Cannot extend while voting is active")
        self.assertEqual(self.proposal.extension_count, 0)


class OwnerVetoTestCase(TestCase):
    """Test owner veto logic (max 2 per calendar year, 7-day window)."""

    def setUp(self):
        """Create test proposal and company."""
        self.company = CompanyFactory()
        self.owner = self.company.owner_address
        self.non_owner = '0x' + 'b' * 40

    def test_owner_can_veto_within_window(self):
        """Test that owner can veto within 7 days of voting end."""
        proposal = VotingProposalFactory(
            company=self.company,
            voting_end=timezone.now() - timedelta(hours=1)
        )
        
        can_veto, reason = GovernanceService.owner_can_veto(
            self.owner,
            proposal
        )

        self.assertTrue(can_veto, f"Owner should be able to veto: {reason}")

    def test_non_owner_cannot_veto(self):
        """Test that non-owner cannot veto."""
        proposal = VotingProposalFactory(
            company=self.company,
            voting_end=timezone.now() - timedelta(hours=1)
        )
        
        can_veto, reason = GovernanceService.owner_can_veto(
            self.non_owner,
            proposal
        )

        self.assertFalse(can_veto, "Non-owner should not be able to veto")

    def test_veto_after_7_days_fails(self):
        """Test that veto is not allowed after 7 days."""
        proposal = VotingProposalFactory(
            company=self.company,
            voting_end=timezone.now() - timedelta(days=8)
        )
        
        can_veto, reason = GovernanceService.owner_can_veto(
            self.owner,
            proposal
        )

        self.assertFalse(can_veto, "Cannot veto after 7-day window")

    def test_veto_at_exactly_7_days_allowed(self):
        """Test that veto is allowed at exactly 7 days."""
        proposal = VotingProposalFactory(
            company=self.company,
            voting_end=timezone.now() - timedelta(days=7)
        )
        
        can_veto, reason = GovernanceService.owner_can_veto(
            self.owner,
            proposal
        )

        self.assertTrue(can_veto, "Veto should be allowed at exactly 7 days")

    @freeze_time("2024-04-16")
    def test_veto_limit_two_per_calendar_year(self):
        """Test that owner is limited to 2 vetoes per calendar year."""
        company = CompanyFactory()
        owner = company.owner_address
        
        # Create 2 vetoed proposals in 2024
        VotingProposalFactory(
            company=company,
            status='VETOED',
            veto_date=timezone.now() - timedelta(days=10)
        )
        VotingProposalFactory(
            company=company,
            status='VETOED',
            veto_date=timezone.now() - timedelta(days=20)
        )
        
        # Try to veto a third
        proposal = VotingProposalFactory(
            company=company,
            voting_end=timezone.now() - timedelta(days=1)
        )
        
        can_veto, reason = GovernanceService.owner_can_veto(owner, proposal)

        self.assertFalse(can_veto, "Owner should be limited to 2 vetoes per year")

    @freeze_time("2025-01-01")
    def test_veto_limit_resets_on_january_first(self):
        """Test that veto limit resets on January 1st."""
        company = CompanyFactory()
        owner = company.owner_address
        
        # Create 2 vetoed proposals in 2024
        with freeze_time("2024-12-31"):
            VotingProposalFactory(
                company=company,
                status='VETOED',
                veto_date=timezone.now()
            )
            VotingProposalFactory(
                company=company,
                status='VETOED',
                veto_date=timezone.now()
            )
        
        # On 2025-01-01, should be able to veto again
        proposal = VotingProposalFactory(
            company=company,
            voting_end=timezone.now() - timedelta(days=1)
        )
        
        can_veto, reason = GovernanceService.owner_can_veto(owner, proposal)

        self.assertTrue(can_veto, "Veto limit should reset on Jan 1")


class ProposalFinalizationTestCase(TestCase):
    """Test proposal finalization logic after voting ends."""

    def setUp(self):
        """Create test company and proposal."""
        self.company = CompanyFactory()

    def test_finalize_passed_when_yes_greater_and_quorum(self):
        """Test proposal marked as PASSED when YES > NO and quorum met."""
        proposal = VotingProposalFactory(
            company=self.company,
            voting_end=timezone.now() - timedelta(hours=1)
        )
        
        # Create votes: 20% YES, 10% NO (quorum met, YES wins)
        YesVoteFactory(
            proposal=proposal,
            weight=(self.company.total_supply * Decimal('20')) / Decimal('100')
        )
        NoVoteFactory(
            proposal=proposal,
            weight=(self.company.total_supply * Decimal('10')) / Decimal('100')
        )
        
        result = GovernanceService.finalize_proposal(proposal)

        self.assertTrue(result, "Proposal should finalize")
        self.assertEqual(proposal.status, 'PASSED')

    def test_finalize_failed_when_no_greater(self):
        """Test proposal marked as FAILED when NO > YES and quorum met."""
        proposal = VotingProposalFactory(
            company=self.company,
            voting_end=timezone.now() - timedelta(hours=1)
        )
        
        # Create votes: 10% YES, 20% NO (quorum met, NO wins)
        YesVoteFactory(
            proposal=proposal,
            weight=(self.company.total_supply * Decimal('10')) / Decimal('100')
        )
        NoVoteFactory(
            proposal=proposal,
            weight=(self.company.total_supply * Decimal('20')) / Decimal('100')
        )
        
        result = GovernanceService.finalize_proposal(proposal)

        self.assertTrue(result, "Proposal should finalize")
        self.assertEqual(proposal.status, 'FAILED')

    def test_finalize_died_when_no_quorum_and_no_extensions_left(self):
        """Test proposal marked as DIED when quorum not met and max extensions reached."""
        proposal = VotingProposalFactory(
            company=self.company,
            voting_end=timezone.now() - timedelta(hours=1),
            extension_count=2
        )
        
        # Create votes: 10% (no quorum, already extended twice)
        YesVoteFactory(
            proposal=proposal,
            weight=(self.company.total_supply * Decimal('10')) / Decimal('100')
        )
        
        result = GovernanceService.finalize_proposal(proposal)

        self.assertTrue(result, "Proposal should finalize as DIED")
        self.assertEqual(proposal.status, 'DIED')

    def test_finalize_extends_when_no_quorum_and_extensions_available(self):
        """Test proposal auto-extends when quorum not met and extensions available."""
        proposal = VotingProposalFactory(
            company=self.company,
            voting_end=timezone.now() - timedelta(hours=1),
            extension_count=0
        )
        original_end = proposal.voting_end
        
        # Create votes: 10% (no quorum)
        YesVoteFactory(
            proposal=proposal,
            weight=(self.company.total_supply * Decimal('10')) / Decimal('100')
        )
        
        result = GovernanceService.finalize_proposal(proposal)

        self.assertFalse(result, "Should not finalize, should extend instead")
        self.assertEqual(proposal.status, 'VOTING')
        self.assertEqual(proposal.extension_count, 1)
        self.assertEqual(
            proposal.voting_end,
            original_end + timedelta(days=3)
        )

    def test_finalize_cannot_finalize_non_voting_proposal(self):
        """Test that finalization fails for non-VOTING proposals."""
        proposal = DraftProposalFactory(company=self.company)
        
        result = GovernanceService.finalize_proposal(proposal)

        self.assertFalse(result, "Cannot finalize non-VOTING proposal")
        self.assertEqual(proposal.status, 'DRAFT')


class OneVotePerUserTestCase(TestCase):
    """Test that each user can only vote once per proposal."""

    def setUp(self):
        """Create test data."""
        self.company = CompanyFactory()
        self.proposal = VotingProposalFactory(company=self.company)
        self.voter = '0x' + 'a' * 40

    def test_can_vote_first_time(self):
        """Test that voting succeeds on first vote."""
        # Mock a balance that's 10% of total supply (>= 5% threshold)
        balance = (self.company.total_supply * Decimal('10')) / Decimal('100')
        
        with patch(
            'discussion.services.governance.blockchain_service.get_balance_at_block',
            return_value=balance
        ):
            result = GovernanceService.can_vote(self.voter, self.proposal)

        self.assertTrue(result, "First vote should be allowed")

    def test_cannot_vote_second_time(self):
        """Test that voting fails on second vote."""
        # Record first vote
        VoteRecord.objects.create(
            proposal=self.proposal,
            voter_address=self.voter,
            choice='YES',
            weight=Decimal('100000'),
            tx_hash='0x' + 'a' * 64
        )
        
        # Try to vote again - even with sufficient balance, should fail due to existing vote
        balance = (self.company.total_supply * Decimal('10')) / Decimal('100')
        
        with patch(
            'discussion.services.governance.blockchain_service.get_balance_at_block',
            return_value=balance
        ):
            result = GovernanceService.can_vote(self.voter, self.proposal)

        self.assertFalse(result, "Second vote should not be allowed")


class NotifyProposalDiedTestCase(TestCase):
    """Test notification sending when proposal dies."""

    def test_notify_all_voters_when_proposal_dies(self):
        """Test that all voters are notified when proposal dies."""
        company = CompanyFactory()
        proposal = DiedProposalFactory(company=company)
        
        # Create multiple votes
        voters = ['0x' + f'{i:040x}' for i in range(3)]
        for idx, voter in enumerate(voters):
            VoteRecord.objects.create(
                proposal=proposal,
                voter_address=voter,
                choice='YES',
                weight=Decimal('100000'),
                tx_hash=f'0x{voter[2:]}{idx:032x}'
            )
        
        # Notify
        GovernanceService.notify_proposal_died(proposal)
        
        # Check notifications
        notifications = Notification.objects.filter(proposal=proposal)
        self.assertEqual(
            notifications.count(),
            len(voters),
            f"Should create {len(voters)} notifications"
        )

    def test_no_notification_for_zero_voters(self):
        """Test that no notifications sent if no one voted."""
        company = CompanyFactory()
        proposal = DiedProposalFactory(company=company)
        
        # Notify with no votes
        GovernanceService.notify_proposal_died(proposal)
        
        # Check no notifications
        notifications = Notification.objects.filter(proposal=proposal)
        self.assertEqual(notifications.count(), 0, "No notifications if no voters")
