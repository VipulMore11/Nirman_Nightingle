"""
Unit tests for discussion app.
Tests cover:
- Large holder threshold checks
- Quorum calculations
- Veto limits
- One-time vote enforcement
- Proposal lifecycle
"""
from datetime import timedelta
from decimal import Decimal
from unittest.mock import patch, MagicMock

from django.test import TestCase, TransactionTestCase
from django.utils import timezone

from discussion.models import Company, Proposal, Comment, VoteRecord, Notification
from discussion.services.governance import GovernanceService


class CompanyTestCase(TestCase):
    """Test Company model and related logic."""

    def setUp(self):
        """Create test company."""
        self.company = Company.objects.create(
            name='Test Corp',
            token_address='0x' + '0' * 40,
            owner_address='0x' + 'a' * 40,
            total_supply=Decimal('1000000000000000000'),  # 1M tokens
        )

    def test_company_creation(self):
        """Test creating a company."""
        self.assertEqual(self.company.name, 'Test Corp')
        self.assertIsNotNone(self.company.created_at)


class LargeHolderTestCase(TestCase):
    """Test large holder threshold (5%)."""

    def setUp(self):
        """Create test data."""
        self.company = Company.objects.create(
            name='Test Corp',
            token_address='0x' + '0' * 40,
            owner_address='0x' + 'a' * 40,
            total_supply=Decimal('1000000000000000000'),  # 1M tokens
        )
        self.holder_address = '0x' + 'b' * 40
        self.small_holder = '0x' + 'c' * 40

    @patch('discussion.services.governance.blockchain_service.get_balance_at_block')
    def test_large_holder_exactly_five_percent(self, mock_balance):
        """Test holder with exactly 5% (edge case)."""
        # 5% of 1M = 50k
        mock_balance.return_value = Decimal('50000000000000000000000')
        
        result = GovernanceService.is_large_holder(
            self.holder_address,
            self.company
        )
        
        self.assertTrue(result)

    @patch('discussion.services.governance.blockchain_service.get_balance_at_block')
    def test_non_large_holder(self, mock_balance):
        """Test holder with less than 5%."""
        mock_balance.return_value = Decimal('49999999999999999999999')
        
        result = GovernanceService.is_large_holder(
            self.small_holder,
            self.company
        )
        
        self.assertFalse(result)

    @patch('discussion.services.governance.blockchain_service.get_balance_at_block')
    def test_large_holder_at_specific_block(self, mock_balance):
        """Test large holder check at specific block number."""
        mock_balance.return_value = Decimal('100000000000000000000000')
        
        result = GovernanceService.is_large_holder(
            self.holder_address,
            self.company,
            at_block=12345
        )
        
        self.assertTrue(result)
        # Verify block number was passed
        mock_balance.assert_called_with(
            self.company.token_address,
            self.holder_address,
            12345
        )


class ProposalLifecycleTestCase(TransactionTestCase):
    """Test proposal status transitions."""

    def setUp(self):
        """Create test data."""
        self.company = Company.objects.create(
            name='Test Corp',
            token_address='0x' + '0' * 40,
            owner_address='0x' + 'a' * 40,
            total_supply=Decimal('1000000000000000000'),
        )
        
        self.proposal = Proposal.objects.create(
            company=self.company,
            title='Test Proposal',
            description='Test description',
            proposer_address='0x' + 'b' * 40,
            status='DRAFT',
        )

    def test_proposal_draft_to_discussion(self):
        """Test transitioning from DRAFT to DISCUSSION."""
        self.proposal.status = 'DISCUSSION'
        self.proposal.discussion_end = timezone.now() + timedelta(days=3)
        self.proposal.save()
        
        self.assertEqual(self.proposal.status, 'DISCUSSION')

    @patch('discussion.services.governance.blockchain_service.get_current_block')
    def test_start_voting(self, mock_block):
        """Test transitioning to VOTING status."""
        mock_block.return_value = 12345
        
        self.proposal.status = 'DISCUSSION'
        self.proposal.discussion_end = timezone.now() - timedelta(hours=1)
        self.proposal.save()
        
        result = GovernanceService.start_voting(self.proposal)
        
        self.assertTrue(result)
        self.assertEqual(self.proposal.status, 'VOTING')
        self.assertEqual(self.proposal.snapshot_block, 12345)


class QuorumTestCase(TransactionTestCase):
    """Test quorum calculations."""

    def setUp(self):
        """Create test data."""
        self.company = Company.objects.create(
            name='Test Corp',
            token_address='0x' + '0' * 40,
            owner_address='0x' + 'a' * 40,
            total_supply=Decimal('1000000000000000000'),  # 1M
        )
        
        self.proposal = Proposal.objects.create(
            company=self.company,
            title='Test Proposal',
            description='Test',
            proposer_address='0x' + 'b' * 40,
            status='VOTING',
            snapshot_block=12345,
            voting_start=timezone.now() - timedelta(days=1),
            voting_end=timezone.now() + timedelta(days=6),
        )

    def test_quorum_not_reached(self):
        """Test when voting doesn't reach quorum."""
        # Create votes totaling less than 16%
        VoteRecord.objects.create(
            proposal=self.proposal,
            voter_address='0x' + 'c' * 40,
            choice='YES',
            weight=Decimal('100000000000000000000000'),  # 10%
        )
        
        result = GovernanceService.calculate_quorum(self.proposal)
        
        self.assertFalse(result)
        self.assertFalse(self.proposal.quorum_reached)

    def test_quorum_reached(self):
        """Test when voting reaches quorum."""
        # 16% quorum = 160k tokens
        VoteRecord.objects.create(
            proposal=self.proposal,
            voter_address='0x' + 'c' * 40,
            choice='YES',
            weight=Decimal('160000000000000000000000'),  # 16%
        )
        
        result = GovernanceService.calculate_quorum(self.proposal)
        
        self.assertTrue(result)
        self.assertTrue(self.proposal.quorum_reached)

    def test_quorum_mix_of_yes_and_no(self):
        """Test quorum with mixed votes."""
        # 10% YES + 8% NO = 18% total
        VoteRecord.objects.create(
            proposal=self.proposal,
            voter_address='0x' + 'c' * 40,
            choice='YES',
            weight=Decimal('100000000000000000000000'),  # 10%
        )
        
        VoteRecord.objects.create(
            proposal=self.proposal,
            voter_address='0x' + 'd' * 40,
            choice='NO',
            weight=Decimal('80000000000000000000000'),  # 8%
        )
        
        result = GovernanceService.calculate_quorum(self.proposal)
        
        self.assertTrue(result)
        self.assertTrue(self.proposal.quorum_reached)


class VetoTestCase(TransactionTestCase):
    """Test veto functionality."""

    def setUp(self):
        """Create test data."""
        self.owner_address = '0x' + 'a' * 40
        
        self.company = Company.objects.create(
            name='Test Corp',
            token_address='0x' + '0' * 40,
            owner_address=self.owner_address,
            total_supply=Decimal('1000000000000000000'),
        )
        
        self.proposal = Proposal.objects.create(
            company=self.company,
            title='Test Proposal',
            description='Test',
            proposer_address='0x' + 'b' * 40,
            status='VOTING',
            voting_end=timezone.now() - timedelta(hours=1),
        )

    def test_owner_can_veto_within_window(self):
        """Test owner can veto within 7-day window."""
        can_veto, reason = GovernanceService.owner_can_veto(
            self.owner_address,
            self.proposal
        )
        
        self.assertTrue(can_veto)

    def test_non_owner_cannot_veto(self):
        """Test non-owner cannot veto."""
        can_veto, reason = GovernanceService.owner_can_veto(
            '0x' + 'c' * 40,
            self.proposal
        )
        
        self.assertFalse(can_veto)

    def test_veto_outside_window(self):
        """Test veto window restriction."""
        # Set voting_end to 8 days ago (outside 7-day window)
        self.proposal.voting_end = timezone.now() - timedelta(days=8)
        self.proposal.save()
        
        can_veto, reason = GovernanceService.owner_can_veto(
            self.owner_address,
            self.proposal
        )
        
        self.assertFalse(can_veto)

    def test_veto_count_per_year(self):
        """Test max 2 vetoes per calendar year."""
        current_year = timezone.now().year
        
        # Create 2 vetoed proposals this year
        for i in range(2):
            Proposal.objects.create(
                company=self.company,
                title=f'Vetoed {i}',
                description='Test',
                proposer_address='0x' + chr(98 + i) * 40,
                status='VETOED',
                veto_date=timezone.now(),
            )
        
        # Try to veto a third proposal
        can_veto, reason = GovernanceService.owner_can_veto(
            self.owner_address,
            self.proposal
        )
        
        self.assertFalse(can_veto)


class VoteRecordTestCase(TransactionTestCase):
    """Test vote record tracking."""

    def setUp(self):
        """Create test data."""
        self.company = Company.objects.create(
            name='Test Corp',
            token_address='0x' + '0' * 40,
            owner_address='0x' + 'a' * 40,
            total_supply=Decimal('1000000000000000000'),
        )
        
        self.proposal = Proposal.objects.create(
            company=self.company,
            title='Test Proposal',
            description='Test',
            proposer_address='0x' + 'b' * 40,
            status='VOTING',
            snapshot_block=12345,
        )

    def test_one_vote_per_user(self):
        """Test that each user can only vote once."""
        voter = '0x' + 'c' * 40
        
        # First vote should succeed
        vote1 = VoteRecord.objects.create(
            proposal=self.proposal,
            voter_address=voter,
            choice='YES',
            weight=Decimal('100'),
            tx_hash='0x' + 'a' * 64,
        )
        self.assertIsNotNone(vote1.id)
        
        # Second vote for same voter should be prevented (unique_together constraint)
        with self.assertRaises(Exception):
            VoteRecord.objects.create(
                proposal=self.proposal,
                voter_address=voter,
                choice='NO',
                weight=Decimal('100'),
                tx_hash='0x' + 'b' * 64,
            )

    def test_vote_weight_tracking(self):
        """Test that vote weights are properly recorded."""
        weight = Decimal('500000000000000000000000')
        
        vote = VoteRecord.objects.create(
            proposal=self.proposal,
            voter_address='0x' + 'c' * 40,
            choice='YES',
            weight=weight,
            tx_hash='0x' + 'a' * 64,
        )
        
        self.assertEqual(vote.weight, weight)


class ExtensionTestCase(TransactionTestCase):
    """Test proposal extensions."""

    def setUp(self):
        """Create test data."""
        self.company = Company.objects.create(
            name='Test Corp',
            token_address='0x' + '0' * 40,
            owner_address='0x' + 'a' * 40,
            total_supply=Decimal('1000000000000000000'),
        )
        
        self.proposal = Proposal.objects.create(
            company=self.company,
            title='Test Proposal',
            description='Test',
            proposer_address='0x' + 'b' * 40,
            status='VOTING',
            voting_end=timezone.now() - timedelta(hours=1),
            extension_count=0,
        )

    def test_extension_increases_voting_period(self):
        """Test that extension adds 3 days."""
        original_end = self.proposal.voting_end
        
        result = GovernanceService.apply_extensions(self.proposal)
        
        self.assertTrue(result)
        self.assertEqual(self.proposal.extension_count, 1)
        self.assertEqual(
            self.proposal.voting_end,
            original_end + timedelta(days=3)
        )

    def test_max_extensions_limit(self):
        """Test maximum of 2 extensions."""
        self.proposal.extension_count = 2
        self.proposal.save()
        
        result = GovernanceService.apply_extensions(self.proposal)
        
        self.assertFalse(result)

    def test_multiple_extensions(self):
        """Test applying extensions twice."""
        original_end = self.proposal.voting_end
        
        result1 = GovernanceService.apply_extensions(self.proposal)
        result2 = GovernanceService.apply_extensions(self.proposal)
        
        self.assertTrue(result1)
        self.assertTrue(result2)
        self.assertEqual(self.proposal.extension_count, 2)
        self.assertEqual(
            self.proposal.voting_end,
            original_end + timedelta(days=6)
        )
