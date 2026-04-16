from django.db import models
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator
from decimal import Decimal


class Company(models.Model):
    """
    Represents a company with blockchain governance.
    """
    name = models.CharField(max_length=255)
    token_address = models.CharField(
        max_length=42,
        help_text="ERC-20 contract address (42 chars including 0x)"
    )
    owner_address = models.CharField(
        max_length=42,
        help_text="Wallet address of company owner with veto power"
    )
    total_supply = models.DecimalField(
        max_digits=30,
        decimal_places=18,
        validators=[MinValueValidator(Decimal('0'))],
        help_text="Total token supply (cached from blockchain)"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'discussion_company'
        verbose_name_plural = 'Companies'

    def __str__(self):
        return self.name


class Proposal(models.Model):
    """
    Represents a governance proposal with voting and veto capabilities.
    """
    STATUS_CHOICES = (
        ('DRAFT', 'Draft'),
        ('DISCUSSION', 'Discussion'),
        ('VOTING', 'Voting'),
        ('PASSED', 'Passed'),
        ('FAILED', 'Failed'),
        ('DIED', 'Died'),
        ('VETOED', 'Vetoed'),
    )

    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name='proposals'
    )
    title = models.CharField(max_length=500)
    description = models.TextField()
    proposer_address = models.CharField(
        max_length=42,
        help_text="Wallet address of proposal creator"
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='DRAFT'
    )
    
    # Timeline fields
    discussion_end = models.DateTimeField(null=True, blank=True)
    voting_start = models.DateTimeField(null=True, blank=True)
    voting_end = models.DateTimeField(null=True, blank=True)
    
    # Blockchain data
    snapshot_block = models.BigIntegerField(
        null=True,
        blank=True,
        help_text="Block number for voting weight snapshot"
    )
    
    # Vote aggregates
    yes_votes_weight = models.DecimalField(
        max_digits=30,
        decimal_places=18,
        default=Decimal('0'),
        validators=[MinValueValidator(Decimal('0'))]
    )
    no_votes_weight = models.DecimalField(
        max_digits=30,
        decimal_places=18,
        default=Decimal('0'),
        validators=[MinValueValidator(Decimal('0'))]
    )
    quorum_reached = models.BooleanField(default=False)
    
    # Extension tracking
    extension_count = models.IntegerField(default=0)
    
    # Veto tracking
    veto_count_year = models.IntegerField(
        default=0,
        help_text="Number of vetoes in current calendar year"
    )
    veto_date = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Date when proposal was vetoed"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'discussion_proposal'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['company', 'status']),
            models.Index(fields=['proposer_address']),
            models.Index(fields=['voting_end']),
        ]

    def __str__(self):
        return f"{self.title} ({self.status})"


class Comment(models.Model):
    """
    Discussion comments on a proposal.
    Only users with ≥5% token balance can comment.
    """
    proposal = models.ForeignKey(
        Proposal,
        on_delete=models.CASCADE,
        related_name='comments'
    )
    author_address = models.CharField(max_length=42)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'discussion_comment'
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['proposal', 'created_at']),
        ]

    def __str__(self):
        return f"Comment by {self.author_address[:8]}... on {self.proposal.title}"


class VoteRecord(models.Model):
    """
    Cache of on-chain votes for quick local access.
    """
    CHOICE_CHOICES = (
        ('YES', 'Yes'),
        ('NO', 'No'),
    )

    proposal = models.ForeignKey(
        Proposal,
        on_delete=models.CASCADE,
        related_name='vote_records'
    )
    voter_address = models.CharField(max_length=42)
    choice = models.CharField(max_length=3, choices=CHOICE_CHOICES)
    weight = models.DecimalField(
        max_digits=30,
        decimal_places=18,
        validators=[MinValueValidator(Decimal('0'))]
    )
    tx_hash = models.CharField(max_length=66, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'discussion_vote_record'
        unique_together = ('proposal', 'voter_address')
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['proposal', 'voter_address']),
            models.Index(fields=['tx_hash']),
        ]

    def __str__(self):
        return f"{self.voter_address[:8]}... voted {self.choice} on {self.proposal.title}"


class Notification(models.Model):
    """
    In-app notifications sent to users about proposal events.
    """
    NOTIFICATION_TYPES = (
        ('PROPOSAL_CREATED', 'Proposal Created'),
        ('VOTING_STARTED', 'Voting Started'),
        ('PROPOSAL_DIED', 'Proposal Died'),
        ('PROPOSAL_PASSED', 'Proposal Passed'),
        ('PROPOSAL_FAILED', 'Proposal Failed'),
        ('PROPOSAL_VETOED', 'Proposal Vetoed'),
        ('EXTENSION_GRANTED', 'Voting Extended'),
    )

    recipient_address = models.CharField(
        max_length=42,
        help_text="Wallet address of notification recipient"
    )
    proposal = models.ForeignKey(
        Proposal,
        on_delete=models.CASCADE,
        related_name='notifications',
        null=True,
        blank=True
    )
    notification_type = models.CharField(
        max_length=30,
        choices=NOTIFICATION_TYPES
    )
    message = models.TextField()
    read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'discussion_notification'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['recipient_address', 'read']),
        ]

    def __str__(self):
        return f"{self.notification_type} - {self.recipient_address[:8]}..."
