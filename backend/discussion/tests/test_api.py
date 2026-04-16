"""
Integration tests for discussion API endpoints.
Tests all viewsets with mocked blockchain interactions.
"""
from datetime import datetime, timedelta
from decimal import Decimal
from unittest.mock import patch, MagicMock
from django.test import TestCase
from django.utils import timezone
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from freezegun import freeze_time

from discussion.models import (
    Company,
    Proposal,
    Comment,
    VoteRecord,
    Notification,
)
from discussion.serializers import (
    ProposalDetailSerializer,
    CommentSerializer,
)
from discussion.tests.factories import (
    UserFactory,
    CompanyFactory,
    DraftProposalFactory,
    DiscussionProposalFactory,
    VotingProposalFactory,
    PassedProposalFactory,
    FailedProposalFactory,
    DiedProposalFactory,
    VetoedProposalFactory,
    CommentFactory,
    YesVoteFactory,
    NoVoteFactory,
    create_large_holder_user,
    create_small_holder_user,
    create_owner_user,
)

User = get_user_model()


class ProposalCreateTestCase(APITestCase):
    """Test creating new proposals."""

    def setUp(self):
        """Set up test data."""
        self.company = CompanyFactory()
        self.large_holder = create_large_holder_user(self.company)
        self.small_holder = create_small_holder_user(self.company)
        self.client = APIClient()

    def test_create_proposal_as_large_holder_succeeds(self):
        """Test that 5%+ holder can create proposal."""
        self.client.force_authenticate(user=self.large_holder)
        
        payload = {
            'company': self.company.id,
            'title': 'Test Proposal',
            'description': 'Test description',
            'discussion_days': 3,
            'voting_days': 7,
        }
        
        response = self.client.post('/api/governance/proposals/', payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Proposal.objects.count(), 1)
        self.assertEqual(Proposal.objects.first().status, 'DRAFT')

    def test_create_proposal_as_small_holder_fails(self):
        """Test that <5% holder cannot create proposal."""
        self.client.force_authenticate(user=self.small_holder)
        
        with patch(
            'discussion.views.blockchain_service.get_balance_at_block',
            return_value=(self.company.total_supply * Decimal('2')) / Decimal('100')
        ):
            payload = {
                'company': self.company.id,
                'title': 'Test Proposal',
                'description': 'Test description',
                'discussion_days': 3,
                'voting_days': 7,
            }
            
            response = self.client.post('/api/governance/proposals/', payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(Proposal.objects.count(), 0)

    def test_create_proposal_unauthenticated_fails(self):
        """Test that unauthenticated requests fail."""
        payload = {
            'company': self.company.id,
            'title': 'Test Proposal',
            'description': 'Test description',
        }
        
        response = self.client.post('/api/governance/proposals/', payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_proposal_sets_creator(self):
        """Test that creator is set from authenticated user."""
        self.client.force_authenticate(user=self.large_holder)
        
        payload = {
            'company': self.company.id,
            'title': 'Test Proposal',
            'description': 'Test description',
            'discussion_days': 3,
            'voting_days': 7,
        }
        
        response = self.client.post('/api/governance/proposals/', payload, format='json')

        proposal = Proposal.objects.first()
        self.assertEqual(proposal.creator, self.large_holder)


class ProposalTransitionTestCase(APITestCase):
    """Test proposal status transitions."""

    def setUp(self):
        """Set up test data."""
        self.company = CompanyFactory()
        self.owner = create_owner_user(self.company)
        self.other_user = UserFactory()
        self.client = APIClient()

    def test_start_discussion_from_draft(self):
        """Test transitioning from DRAFT to DISCUSSION."""
        proposal = DraftProposalFactory(company=self.company)
        self.client.force_authenticate(user=self.owner)
        
        response = self.client.post(
            f'/api/governance/proposals/{proposal.id}/start_discussion/',
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        proposal.refresh_from_db()
        self.assertEqual(proposal.status, 'DISCUSSION')
        self.assertIsNotNone(proposal.discussion_start)

    def test_start_voting_from_discussion(self):
        """Test transitioning from DISCUSSION to VOTING."""
        proposal = DiscussionProposalFactory(
            company=self.company,
            discussion_end=timezone.now() - timedelta(days=1)
        )
        self.client.force_authenticate(user=self.owner)
        
        response = self.client.post(
            f'/api/governance/proposals/{proposal.id}/start_voting/',
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        proposal.refresh_from_db()
        self.assertEqual(proposal.status, 'VOTING')
        self.assertIsNotNone(proposal.voting_start)

    def test_start_voting_too_early_fails(self):
        """Test that starting voting in discussion phase fails if < min days."""
        proposal = DiscussionProposalFactory(
            company=self.company,
            discussion_end=timezone.now() + timedelta(days=2)  # Still ongoing
        )
        self.client.force_authenticate(user=self.owner)
        
        response = self.client.post(
            f'/api/governance/proposals/{proposal.id}/start_voting/',
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_finalize_proposal(self):
        """Test finalizing a proposal from VOTING."""
        proposal = VotingProposalFactory(
            company=self.company,
            voting_end=timezone.now() - timedelta(hours=1)
        )
        # Add votes to reach quorum with YES winning
        YesVoteFactory(
            proposal=proposal,
            weight=(self.company.total_supply * Decimal('20')) / Decimal('100')
        )
        
        self.client.force_authenticate(user=self.owner)
        
        response = self.client.post(
            f'/api/governance/proposals/{proposal.id}/finalize/',
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        proposal.refresh_from_db()
        self.assertEqual(proposal.status, 'PASSED')

    def test_non_owner_cannot_transition(self):
        """Test that non-owner cannot transition proposal."""
        proposal = DraftProposalFactory(company=self.company)
        self.client.force_authenticate(user=self.other_user)
        
        response = self.client.post(
            f'/api/governance/proposals/{proposal.id}/start_discussion/',
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class ProposalVotingTestCase(APITestCase):
    """Test voting on proposals."""

    def setUp(self):
        """Set up test data."""
        self.company = CompanyFactory()
        self.large_holder = create_large_holder_user(self.company)
        self.small_holder = create_small_holder_user(self.company)
        self.proposal = VotingProposalFactory(company=self.company)
        self.client = APIClient()

    def test_vote_yes_as_large_holder_succeeds(self):
        """Test voting YES as large holder."""
        self.client.force_authenticate(user=self.large_holder)
        
        with patch(
            'discussion.views.blockchain_service'
        ) as mock_service:
            mock_service.get_balance_at_block.return_value = Decimal('100000')
            mock_service.record_vote.return_value = None
            
            payload = {
                'choice': 'YES',
                'tx_hash': '0x' + 'a' * 64,
            }
            
            response = self.client.post(
                f'/api/governance/proposals/{self.proposal.id}/vote/',
                payload,
                format='json'
            )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(VoteRecord.objects.count(), 1)
        self.assertEqual(VoteRecord.objects.first().choice, 'YES')

    def test_vote_no_succeeds(self):
        """Test voting NO."""
        self.client.force_authenticate(user=self.large_holder)
        
        with patch(
            'discussion.views.blockchain_service'
        ) as mock_service:
            mock_service.get_balance_at_block.return_value = Decimal('100000')
            
            payload = {
                'choice': 'NO',
                'tx_hash': '0x' + 'a' * 64,
            }
            
            response = self.client.post(
                f'/api/governance/proposals/{self.proposal.id}/vote/',
                payload,
                format='json'
            )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(VoteRecord.objects.first().choice, 'NO')

    def test_vote_as_non_holder_fails(self):
        """Test that <5% holder cannot vote."""
        self.client.force_authenticate(user=self.small_holder)
        
        with patch(
            'discussion.views.blockchain_service.get_balance_at_block',
            return_value=(self.company.total_supply * Decimal('2')) / Decimal('100')
        ):
            payload = {
                'choice': 'YES',
                'tx_hash': '0x' + 'a' * 64,
            }
            
            response = self.client.post(
                f'/api/governance/proposals/{self.proposal.id}/vote/',
                payload,
                format='json'
            )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_vote_twice_fails(self):
        """Test that voting twice from same address fails."""
        # Record first vote
        YesVoteFactory(
            proposal=self.proposal,
            voter_address=self.large_holder.wallet_address
        )
        
        self.client.force_authenticate(user=self.large_holder)
        
        with patch(
            'discussion.views.blockchain_service.get_balance_at_block',
            return_value=Decimal('100000')
        ):
            payload = {
                'choice': 'NO',
                'tx_hash': '0x' + 'b' * 64,
            }
            
            response = self.client.post(
                f'/api/governance/proposals/{self.proposal.id}/vote/',
                payload,
                format='json'
            )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_vote_uses_snapshot_block(self):
        """Test that vote weight is calculated at proposal's snapshot block."""
        self.client.force_authenticate(user=self.large_holder)
        
        with patch(
            'discussion.views.blockchain_service.get_balance_at_block'
        ) as mock_balance:
            mock_balance.return_value = Decimal('100000')
            
            payload = {
                'choice': 'YES',
                'tx_hash': '0x' + 'a' * 64,
            }
            
            self.client.post(
                f'/api/governance/proposals/{self.proposal.id}/vote/',
                payload,
                format='json'
            )

        # Verify it was called with the proposal's snapshot block
        mock_balance.assert_called_with(
            self.company.token_address,
            self.large_holder.wallet_address,
            self.proposal.snapshot_block
        )

    def test_vote_not_in_voting_phase_fails(self):
        """Test that voting fails if proposal not in VOTING phase."""
        proposal = DraftProposalFactory(company=self.company)
        self.client.force_authenticate(user=self.large_holder)
        
        payload = {
            'choice': 'YES',
            'tx_hash': '0x' + 'a' * 64,
        }
        
        response = self.client.post(
            f'/api/governance/proposals/{proposal.id}/vote/',
            payload,
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class VoteResultsTestCase(APITestCase):
    """Test retrieving vote results."""

    def setUp(self):
        """Set up test data."""
        self.company = CompanyFactory()
        self.proposal = VotingProposalFactory(company=self.company)
        self.client = APIClient()

    def test_get_vote_results(self):
        """Test retrieving vote results."""
        # Create votes
        yes_weight = (self.company.total_supply * Decimal('60')) / Decimal('100')
        no_weight = (self.company.total_supply * Decimal('20')) / Decimal('100')
        
        YesVoteFactory(proposal=self.proposal, weight=yes_weight)
        NoVoteFactory(proposal=self.proposal, weight=no_weight)
        
        response = self.client.get(
            f'/api/governance/proposals/{self.proposal.id}/vote_results/',
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['yes_weight'], str(yes_weight))
        self.assertEqual(response.data['no_weight'], str(no_weight))
        self.assertEqual(response.data['yes_percentage'], '60.00')
        self.assertEqual(response.data['no_percentage'], '20.00')

    def test_vote_results_with_no_votes(self):
        """Test vote results when there are no votes."""
        response = self.client.get(
            f'/api/governance/proposals/{self.proposal.id}/vote_results/',
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['yes_weight'], '0')
        self.assertEqual(response.data['no_weight'], '0')


class ProposalCommentTestCase(APITestCase):
    """Test commenting on proposals."""

    def setUp(self):
        """Set up test data."""
        self.company = CompanyFactory()
        self.large_holder = create_large_holder_user(self.company)
        self.small_holder = create_small_holder_user(self.company)
        self.proposal = DiscussionProposalFactory(company=self.company)
        self.client = APIClient()

    def test_comment_as_large_holder_in_discussion_succeeds(self):
        """Test commenting in DISCUSSION phase as large holder."""
        self.client.force_authenticate(user=self.large_holder)
        
        with patch(
            'discussion.views.blockchain_service.get_balance_at_block',
            return_value=Decimal('100000')
        ):
            payload = {
                'proposal': self.proposal.id,
                'content': 'This is a test comment.',
            }
            
            response = self.client.post(
                '/api/governance/comments/',
                payload,
                format='json'
            )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Comment.objects.count(), 1)

    def test_comment_as_small_holder_fails(self):
        """Test that <5% holder cannot comment."""
        self.client.force_authenticate(user=self.small_holder)
        
        with patch(
            'discussion.views.blockchain_service.get_balance_at_block',
            return_value=(self.company.total_supply * Decimal('2')) / Decimal('100')
        ):
            payload = {
                'proposal': self.proposal.id,
                'content': 'This is a test comment.',
            }
            
            response = self.client.post(
                '/api/governance/comments/',
                payload,
                format='json'
            )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_comment_outside_discussion_phase_fails(self):
        """Test that commenting fails if proposal not in DISCUSSION phase."""
        proposal = VotingProposalFactory(company=self.company)
        self.client.force_authenticate(user=self.large_holder)
        
        with patch(
            'discussion.views.blockchain_service.get_balance_at_block',
            return_value=Decimal('100000')
        ):
            payload = {
                'proposal': proposal.id,
                'content': 'This is a test comment.',
            }
            
            response = self.client.post(
                '/api/governance/comments/',
                payload,
                format='json'
            )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_get_proposal_comments(self):
        """Test retrieving comments for a proposal."""
        CommentFactory(proposal=self.proposal, content='Comment 1')
        CommentFactory(proposal=self.proposal, content='Comment 2')
        
        response = self.client.get(
            f'/api/governance/proposals/{self.proposal.id}/comments/',
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)


class ProposalVetoTestCase(APITestCase):
    """Test proposal veto by owner."""

    def setUp(self):
        """Set up test data."""
        self.company = CompanyFactory()
        self.owner = create_owner_user(self.company)
        self.other_user = UserFactory()
        self.proposal = VotingProposalFactory(
            company=self.company,
            voting_end=timezone.now() - timedelta(hours=1)
        )
        self.client = APIClient()

    def test_owner_can_veto_within_window(self):
        """Test that owner can veto within 7 days."""
        self.client.force_authenticate(user=self.owner)
        
        payload = {
            'reason': 'Veto reason',
            'tx_hash': '0x' + 'a' * 64,
        }
        
        response = self.client.post(
            f'/api/governance/proposals/{self.proposal.id}/veto/',
            payload,
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.proposal.refresh_from_db()
        self.assertEqual(self.proposal.status, 'VETOED')
        self.assertIsNotNone(self.proposal.veto_date)

    def test_non_owner_cannot_veto(self):
        """Test that non-owner cannot veto."""
        self.client.force_authenticate(user=self.other_user)
        
        payload = {
            'reason': 'Veto reason',
            'tx_hash': '0x' + 'a' * 64,
        }
        
        response = self.client.post(
            f'/api/governance/proposals/{self.proposal.id}/veto/',
            payload,
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_veto_after_7_days_fails(self):
        """Test that veto fails after 7-day window."""
        self.proposal.voting_end = timezone.now() - timedelta(days=8)
        self.proposal.save()
        
        self.client.force_authenticate(user=self.owner)
        
        payload = {
            'reason': 'Veto reason',
            'tx_hash': '0x' + 'a' * 64,
        }
        
        response = self.client.post(
            f'/api/governance/proposals/{self.proposal.id}/veto/',
            payload,
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @freeze_time("2024-04-16")
    def test_veto_limit_two_per_year_enforced(self):
        """Test that 2 vetoes per calendar year limit is enforced."""
        self.client.force_authenticate(user=self.owner)
        
        # Create 2 existing vetoed proposals
        for _ in range(2):
            VetoedProposalFactory(
                company=self.company,
                veto_date=timezone.now() - timedelta(days=10)
            )
        
        # Try to veto a third
        payload = {
            'reason': 'Veto reason',
            'tx_hash': '0x' + 'a' * 64,
        }
        
        response = self.client.post(
            f'/api/governance/proposals/{self.proposal.id}/veto/',
            payload,
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class CompanyLargeHoldersTestCase(APITestCase):
    """Test retrieving large holders for a company."""

    def setUp(self):
        """Set up test data."""
        self.company = CompanyFactory()
        self.large_holder = create_large_holder_user(self.company)
        self.small_holder = create_small_holder_user(self.company)
        self.client = APIClient()

    def test_get_large_holders(self):
        """Test retrieving large holders for company."""
        with patch(
            'discussion.views.blockchain_service.get_balance_at_block'
        ) as mock_balance:
            def mock_get_balance(token_addr, wallet, block):
                if wallet == self.large_holder.wallet_address:
                    return Decimal('100000')  # 5%+
                else:
                    return Decimal('10000')  # <5%
            
            mock_balance.side_effect = mock_get_balance
            
            response = self.client.get(
                f'/api/governance/companies/{self.company.id}/large_holders/',
                format='json'
            )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Large holder should be in results
        large_holder_ids = [holder['id'] for holder in response.data]
        self.assertIn(self.large_holder.id, large_holder_ids)

    def test_small_holders_excluded(self):
        """Test that holders <5% are excluded from large holders."""
        with patch(
            'discussion.views.blockchain_service.get_balance_at_block'
        ) as mock_balance:
            def mock_get_balance(token_addr, wallet, block):
                return Decimal('10000')  # <5%
            
            mock_balance.side_effect = mock_get_balance
            
            response = self.client.get(
                f'/api/governance/companies/{self.company.id}/large_holders/',
                format='json'
            )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0, "No small holders should be returned")


class NotificationTestCase(APITestCase):
    """Test notifications."""

    def setUp(self):
        """Set up test data."""
        self.company = CompanyFactory()
        self.user = UserFactory()
        self.proposal = VotingProposalFactory(company=self.company)
        self.client = APIClient()

    def test_get_user_notifications(self):
        """Test retrieving user's notifications."""
        # Create some notifications
        Notification.objects.create(
            recipient_address=self.user.wallet_address,
            proposal=self.proposal,
            notification_type='PROPOSAL_CREATED',
            message='Test notification 1',
        )
        Notification.objects.create(
            recipient_address=self.user.wallet_address,
            proposal=self.proposal,
            notification_type='PROPOSAL_CREATED',
            message='Test notification 2',
        )
        
        self.client.force_authenticate(user=self.user)
        
        response = self.client.get(
            '/api/governance/notifications/',
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_mark_notification_as_read(self):
        """Test marking notification as read."""
        notification = Notification.objects.create(
            recipient_address=self.user.wallet_address,
            proposal=self.proposal,
            notification_type='PROPOSAL_CREATED',
            message='Test notification',
            read=False,
        )
        
        self.client.force_authenticate(user=self.user)
        
        response = self.client.post(
            f'/api/governance/notifications/{notification.id}/mark_as_read/',
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        notification.refresh_from_db()
        self.assertTrue(notification.is_read)

    def test_cannot_mark_others_notification_as_read(self):
        """Test that user cannot mark others' notifications as read."""
        other_user = UserFactory()
        notification = Notification.objects.create(
            recipient_address=other_user.wallet_address,
            proposal=self.proposal,
            notification_type='PROPOSAL_CREATED',
            message='Test notification',
        )
        
        self.client.force_authenticate(user=self.user)
        
        response = self.client.post(
            f'/api/governance/notifications/{notification.id}/mark_as_read/',
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class ProposalListFilterTestCase(APITestCase):
    """Test proposal list filtering."""

    def setUp(self):
        """Set up test data."""
        self.company1 = CompanyFactory()
        self.company2 = CompanyFactory()
        self.client = APIClient()

    def test_filter_proposals_by_company(self):
        """Test filtering proposals by company."""
        DraftProposalFactory(company=self.company1)
        DraftProposalFactory(company=self.company1)
        DraftProposalFactory(company=self.company2)
        
        response = self.client.get(
            f'/api/governance/proposals/?company={self.company1.id}',
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_filter_proposals_by_status(self):
        """Test filtering proposals by status."""
        DraftProposalFactory(company=self.company1)
        VotingProposalFactory(company=self.company1)
        PassedProposalFactory(company=self.company1)
        
        response = self.client.get(
            '/api/governance/proposals/?status=VOTING',
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['status'], 'VOTING')

    def test_filter_proposals_by_multiple_statuses(self):
        """Test filtering proposals by multiple statuses."""
        DraftProposalFactory(company=self.company1)
        VotingProposalFactory(company=self.company1)
        PassedProposalFactory(company=self.company1)
        
        response = self.client.get(
            '/api/governance/proposals/?status=VOTING&status=PASSED',
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
