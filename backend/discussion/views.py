"""
Django REST Framework views for governance API.
"""
from decimal import Decimal

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.utils import timezone

from discussion.models import Company, Proposal, Comment, VoteRecord, Notification
from discussion.serializers import (
    CompanySerializer,
    ProposalDetailSerializer,
    ProposalListSerializer,
    ProposalCreateSerializer,
    CommentSerializer,
    VoteInputSerializer,
    VetoInputSerializer,
    NotificationSerializer,
    HolderListSerializer,
)
from discussion.services.governance import GovernanceService
from discussion.services.blockchain import blockchain_service


class CompanyViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoints for companies.
    """
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=['get'])
    def holders(self, request, pk=None):
        """
        List addresses with ≥5% token balance.
        
        Note: In production, this would query blockchain data.
        This is a simplified response showing the method.
        """
        company = self.get_object()
        
        # In a real implementation, you'd:
        # 1. Query all token holders from blockchain
        # 2. Filter those with >= 5% of total supply
        # 3. Return paginated list
        
        holders = []
        # Placeholder implementation
        
        return Response({
            'company_id': company.id,
            'company_name': company.name,
            'total_supply': str(company.total_supply),
            'large_holders': holders,
            'note': 'Requires blockchain indexing or Moralis/similar API',
        })


class ProposalViewSet(viewsets.ModelViewSet):
    """
    API endpoints for proposals.
    CRUD operations with custom actions for voting, veto, and transitions.
    """
    queryset = Proposal.objects.all()
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action == 'create':
            return ProposalCreateSerializer
        elif self.action == 'list':
            return ProposalListSerializer
        else:
            return ProposalDetailSerializer

    def get_proposer_address(self):
        """Extract wallet address from authenticated user."""
        # Assumes user has wallet_address field
        if hasattr(self.request.user, 'wallet_address'):
            return self.request.user.wallet_address
        
        # Fallback from request data
        return self.request.data.get('proposer_address')

    def create(self, request, *args, **kwargs):
        """
        POST /api/proposals/
        Create a new proposal (DRAFT status).
        Requires user to be a large token holder (≥5%).
        """
        company_id = request.data.get('company')
        proposer = self.get_proposer_address()
        
        if not proposer:
            return Response(
                {'error': 'No wallet address found'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        company = get_object_or_404(Company, id=company_id)
        
        # Check if proposer is large holder
        if not GovernanceService.is_large_holder(proposer, company):
            return Response(
                {'error': 'Must hold ≥5% of total supply to create proposals'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Create proposal
        serializer = self.get_serializer(data=request.data)
        serializer.initial_data['proposer_address'] = proposer
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def start_discussion(self, request, pk=None):
        """
        POST /api/proposals/<id>/start_discussion/
        Transition proposal from DRAFT to DISCUSSION.
        Sets discussion_end to current time + discussion period (e.g., 3 days).
        """
        proposal = self.get_object()
        
        if proposal.status != 'DRAFT':
            return Response(
                {'error': f'Cannot transition from {proposal.status}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Set discussion period
        proposal.status = 'DISCUSSION'
        proposal.discussion_end = timezone.now() + timezone.timedelta(days=3)
        proposal.save()
        
        return Response(
            ProposalDetailSerializer(proposal).data,
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['post'])
    def start_voting(self, request, pk=None):
        """
        POST /api/proposals/<id>/start_voting/
        Transition proposal from DISCUSSION to VOTING.
        Fetches and stores snapshot block number.
        """
        proposal = self.get_object()
        
        if proposal.status != 'DISCUSSION':
            return Response(
                {'error': f'Cannot transition from {proposal.status}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if discussion period has ended
        if timezone.now() < proposal.discussion_end:
            return Response(
                {'error': 'Discussion period has not ended'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if GovernanceService.start_voting(proposal):
            return Response(
                ProposalDetailSerializer(proposal).data,
                status=status.HTTP_200_OK
            )
        
        return Response(
            {'error': 'Failed to start voting'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    @action(detail=True, methods=['post'])
    def finalize(self, request, pk=None):
        """
        POST /api/proposals/<id>/finalize/
        Finalize proposal after voting ends.
        Sets appropriate status (PASSED/FAILED/DIED).
        """
        proposal = self.get_object()
        
        if proposal.status != 'VOTING':
            return Response(
                {'error': f'Cannot finalize proposal in {proposal.status} status'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if GovernanceService.finalize_proposal(proposal):
            return Response(
                ProposalDetailSerializer(proposal).data,
                status=status.HTTP_200_OK
            )
        
        return Response(
            {'error': 'Proposal not yet ready for finalization'},
            status=status.HTTP_400_BAD_REQUEST
        )

    @action(detail=True, methods=['post'])
    def comment(self, request, pk=None):
        """
        POST /api/proposals/<id>/comments/
        Add a comment to a proposal.
        Requires user to be a large token holder.
        """
        proposal = self.get_object()
        author = self.get_proposer_address()
        
        if not author:
            return Response(
                {'error': 'No wallet address found'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if user can comment
        if not GovernanceService.can_comment(author, proposal):
            return Response(
                {
                    'error': 'Must hold ≥5% of total supply and proposal must be in DISCUSSION phase'
                },
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Create comment
        serializer = CommentSerializer(
            data=request.data,
            context={'proposal_id': proposal.id}
        )
        serializer.initial_data['author_address'] = author
        serializer.initial_data['proposal'] = proposal.id
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def vote(self, request, pk=None):
        """
        POST /api/proposals/<id>/vote/
        Cast a vote (YES/NO).
        Requires:
        - User is large holder at snapshot block
        - Proposal in VOTING phase
        - User hasn't already voted
        
        Request body:
        {
            "choice": "YES" or "NO",
            "tx_hash": "0x..." (optional, if already on-chain)
        }
        """
        proposal = self.get_object()
        voter = self.get_proposer_address()
        
        if not voter:
            return Response(
                {'error': 'No wallet address found'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate input
        serializer = VoteInputSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if user can vote
        if not GovernanceService.can_vote(voter, proposal):
            return Response(
                {
                    'error': 'Cannot vote: must be large holder, proposal must be in VOTING phase, and you cannot have already voted'
                },
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            choice = serializer.validated_data['choice']
            tx_hash = serializer.validated_data.get('tx_hash', '')
            
            # Get voter balance at snapshot block
            balance = blockchain_service.get_balance_at_block(
                proposal.company.token_address,
                voter,
                proposal.snapshot_block
            )
            
            # Create vote record
            vote_record = VoteRecord.objects.create(
                proposal=proposal,
                voter_address=voter,
                choice=choice,
                weight=balance,
                tx_hash=tx_hash or f"local_{proposal.id}_{voter}"
            )
            
            # Update proposal vote counts
            GovernanceService.calculate_quorum(proposal)
            
            return Response(
                {
                    'success': True,
                    'message': f'Vote recorded: {choice}',
                    'weight': str(balance),
                },
                status=status.HTTP_201_CREATED
            )
        
        except Exception as e:
            return Response(
                {'error': f'Failed to record vote: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['get'])
    def results(self, request, pk=None):
        """
        GET /api/proposals/<id>/results/
        Get current voting results and quorum status.
        """
        proposal = self.get_object()
        
        # Calculate current state
        GovernanceService.calculate_quorum(proposal)
        
        # Calculate quorum requirement
        quorum_threshold = (
            proposal.company.total_supply * Decimal('16')
        ) / Decimal('100')
        
        current_votes = proposal.yes_votes_weight + proposal.no_votes_weight
        
        # Calculate if voting started
        voting_active = (
            proposal.status == 'VOTING' and
            proposal.voting_end and
            timezone.now() < proposal.voting_end
        )
        
        return Response({
            'proposal_id': proposal.id,
            'status': proposal.status,
            'yes_votes': str(proposal.yes_votes_weight),
            'no_votes': str(proposal.no_votes_weight),
            'total_votes': str(current_votes),
            'quorum_threshold': str(quorum_threshold),
            'quorum_reached': proposal.quorum_reached,
            'percentage_of_quorum': str(
                (current_votes / quorum_threshold * 100) if quorum_threshold > 0 else 0
            ),
            'voting_active': voting_active,
            'voting_end': proposal.voting_end,
            'extensions_used': proposal.extension_count,
            'max_extensions': 2,
        })

    @action(detail=True, methods=['post'])
    def veto(self, request, pk=None):
        """
        POST /api/proposals/<id>/veto/
        Execute owner veto on a proposal.
        Requires:
        - Caller is company owner
        - Within 7 days of voting end
        - Max 2 vetoes per calendar year
        
        Request body:
        {
            "owner_signature": "0x..." (optional, for verification)
        }
        """
        proposal = self.get_object()
        owner = self.get_proposer_address()
        
        if not owner:
            return Response(
                {'error': 'No wallet address found'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check veto permissions
        can_veto, reason = GovernanceService.owner_can_veto(
            owner,
            proposal
        )
        
        if not can_veto:
            return Response(
                {'error': reason},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # In production, you'd get owner_key from secure storage
        # For now, demonstrate the flow
        try:
            if GovernanceService.execute_veto(proposal, owner):
                return Response(
                    {
                        'success': True,
                        'message': f'Proposal {proposal.id} vetoed',
                        'status': proposal.status,
                    },
                    status=status.HTTP_200_OK
                )
            else:
                return Response(
                    {'error': 'Veto execution failed'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        
        except Exception as e:
            return Response(
                {'error': f'Veto failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoints for notifications.
    """
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Return notifications for authenticated user's wallet."""
        wallet = getattr(self.request.user, 'wallet_address', None)
        if wallet:
            return Notification.objects.filter(recipient_address=wallet)
        return Notification.objects.none()

    @action(detail=False, methods=['post'])
    def mark_all_as_read(self, request):
        """Mark all user notifications as read."""
        wallet = getattr(request.user, 'wallet_address', None)
        if not wallet:
            return Response(
                {'error': 'No wallet address found'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        count = Notification.objects.filter(
            recipient_address=wallet,
            read=False
        ).update(read=True)
        
        return Response({
            'success': True,
            'updated_count': count,
        })

    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        """Mark a single notification as read."""
        notification = self.get_object()
        notification.read = True
        notification.save()
        
        return Response(NotificationSerializer(notification).data)
