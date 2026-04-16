"""
Django REST Framework serializers for governance API.
"""
from rest_framework import serializers
from discussion.models import Company, Proposal, Comment, VoteRecord, Notification


class CompanySerializer(serializers.ModelSerializer):
    """Serializer for Company model."""
    
    class Meta:
        model = Company
        fields = [
            'id',
            'name',
            'token_address',
            'owner_address',
            'total_supply',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class CommentSerializer(serializers.ModelSerializer):
    """Serializer for Comment model."""
    
    class Meta:
        model = Comment
        fields = [
            'id',
            'proposal',
            'author_address',
            'content',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at', 'proposal']

    def create(self, validated_data):
        """Set proposal from context."""
        validated_data['proposal_id'] = self.context.get('proposal_id')
        return super().create(validated_data)


class VoteRecordSerializer(serializers.ModelSerializer):
    """Serializer for VoteRecord model (read-only for transparency)."""
    
    class Meta:
        model = VoteRecord
        fields = [
            'id',
            'voter_address',
            'choice',
            'weight',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class ProposalDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for Proposal including comments and votes."""
    
    comments = CommentSerializer(many=True, read_only=True)
    vote_records = VoteRecordSerializer(many=True, read_only=True)
    company_name = serializers.CharField(
        source='company.name',
        read_only=True
    )
    quorum_threshold = serializers.SerializerMethodField()
    time_remaining = serializers.SerializerMethodField()

    class Meta:
        model = Proposal
        fields = [
            'id',
            'company',
            'company_name',
            'title',
            'description',
            'proposer_address',
            'status',
            'discussion_end',
            'voting_start',
            'voting_end',
            'snapshot_block',
            'yes_votes_weight',
            'no_votes_weight',
            'quorum_reached',
            'extension_count',
            'veto_count_year',
            'veto_date',
            'created_at',
            'updated_at',
            'comments',
            'vote_records',
            'quorum_threshold',
            'time_remaining',
        ]
        read_only_fields = [
            'id',
            'snapshot_block',
            'yes_votes_weight',
            'no_votes_weight',
            'quorum_reached',
            'extension_count',
            'veto_count_year',
            'veto_date',
            'created_at',
            'updated_at',
        ]

    def get_quorum_threshold(self, obj) -> str:
        """Calculate quorum threshold (16% of total supply)."""
        from decimal import Decimal
        threshold = (obj.company.total_supply * Decimal('16')) / Decimal('100')
        return str(threshold)

    def get_time_remaining(self, obj) -> dict:
        """Calculate time remaining in voting period."""
        from django.utils import timezone
        if obj.status != 'VOTING' or not obj.voting_end:
            return None
        
        now = timezone.now()
        remaining = obj.voting_end - now
        
        if remaining.total_seconds() < 0:
            return {'days': 0, 'hours': 0, 'minutes': 0, 'expired': True}
        
        days = remaining.days
        hours, remainder = divmod(remaining.seconds, 3600)
        minutes = remainder // 60
        
        return {
            'days': days,
            'hours': hours,
            'minutes': minutes,
            'expired': False,
        }


class ProposalListSerializer(serializers.ModelSerializer):
    """List view serializer for Proposals (lighter than detail)."""
    
    company_name = serializers.CharField(
        source='company.name',
        read_only=True
    )
    comment_count = serializers.SerializerMethodField()
    vote_count = serializers.SerializerMethodField()

    class Meta:
        model = Proposal
        fields = [
            'id',
            'company',
            'company_name',
            'title',
            'proposer_address',
            'status',
            'voting_start',
            'voting_end',
            'yes_votes_weight',
            'no_votes_weight',
            'quorum_reached',
            'created_at',
            'comment_count',
            'vote_count',
        ]
        read_only_fields = fields

    def get_comment_count(self, obj) -> int:
        return obj.comments.count()

    def get_vote_count(self, obj) -> int:
        return obj.vote_records.count()


class ProposalCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new proposals."""
    
    class Meta:
        model = Proposal
        fields = [
            'company',
            'title',
            'description',
        ]

    def create(self, validated_data):
        """Set proposer_address from context and initial status."""
        validated_data['proposer_address'] = self.context.get('proposer_address')
        validated_data['status'] = 'DRAFT'
        return super().create(validated_data)


class VoteInputSerializer(serializers.Serializer):
    """Serializer for vote input (choice and optional signature)."""
    
    choice = serializers.ChoiceField(choices=['YES', 'NO'])
    tx_hash = serializers.CharField(
        required=False,
        help_text="Transaction hash if vote already submitted on-chain"
    )


class VetoInputSerializer(serializers.Serializer):
    """Serializer for veto input."""
    
    owner_signature = serializers.CharField(
        help_text="EIP-712 signature from owner wallet",
        required=False
    )


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer for Notification model."""
    
    proposal_title = serializers.CharField(
        source='proposal.title',
        read_only=True
    )

    class Meta:
        model = Notification
        fields = [
            'id',
            'proposal',
            'proposal_title',
            'notification_type',
            'message',
            'read',
            'created_at',
        ]
        read_only_fields = [
            'id',
            'created_at',
            'proposal_title',
        ]


class HolderListSerializer(serializers.Serializer):
    """Serializer for listing large token holders."""
    
    address = serializers.CharField()
    balance = serializers.CharField()
    percentage = serializers.CharField()
