from django.db import models
from django.utils import timezone
from .managers import CustomUserManager
from django.contrib.auth.models import AbstractUser
import json

class User(AbstractUser):

    ROLE_CHOICES = (
        ('user', 'User'),
        ('admin', 'Admin'),
    )

    username = models.CharField(max_length=100, null=True, blank=True)
    first_name = models.CharField(max_length=255, null=True, blank=True)
    last_name = models.CharField(max_length=255, null=True, blank=True)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='user')


    phone_no = models.CharField(max_length=10, blank=True, null=True)
    profile_pic = models.TextField(blank=True, null=True)
    wallet_address = models.TextField(max_length=255, null=True, blank=True)
    age = models.IntegerField(null=True, blank=True)
    sex = models.CharField(max_length=10, blank=True, null=True)
    dob = models.CharField(max_length=11, blank=True, null=True)
    wallet_address = models.CharField(
        max_length=42,
        unique=True,
        null=True,
        blank=True,
        help_text="Ethereum wallet address (42 chars including 0x)"
    )

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = CustomUserManager()

    class Meta:
        db_table ='User'


class KYC(models.Model):

    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('verified', 'Verified'),
        ('rejected', 'Rejected'),
    )

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='kyc')

    # Identity Proofs
    aadhaar_number = models.CharField(max_length=12, blank=True, null=True)
    aadhaar_card_url = models.TextField(blank=True, null=True)

    pan_number = models.CharField(max_length=10, blank=True, null=True)
    pan_card_url = models.TextField(blank=True, null=True)

    passport_number = models.CharField(max_length=20, blank=True, null=True)
    passport_url = models.TextField(blank=True, null=True)

    # Address Proof
    address_line = models.TextField(blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)
    pincode = models.CharField(max_length=10, blank=True, null=True)

    selfie_url = models.TextField(blank=True, null=True)

    # Document submission tracking
    documents_submitted_at = models.DateTimeField(null=True, blank=True)

    # Verification status
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')

    # Admin verification
    verified_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='verified_kyc'
    )

    verified_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'KYC'


class Asset(models.Model):
    """
    Represents a tokenized asset (ASA) in the marketplace.
    Each asset can be fractionally owned through ASA transfers.
    """
    LISTING_STATUS_CHOICES = (
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('sold_out', 'Sold Out'),
        ('delisted', 'Delisted'),
    )

    # Core fields
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='owned_assets')
    creator_wallet = models.TextField(max_length=255)
    title = models.CharField(max_length=255)
    description = models.TextField()
    
    # Property Images - JSON array: [{name, url, file_type}, ...]
    property_images = models.JSONField(default=list, blank=True)
    
    # Asset-specific fields
    asa_id = models.BigIntegerField(unique=True, null=True, blank=True)  # Algorand ASA ID
    total_supply = models.DecimalField(max_digits=20, decimal_places=2)  # Total fractional units
    available_supply = models.DecimalField(max_digits=20, decimal_places=2)  # Remaining units
    unit_price = models.DecimalField(max_digits=15, decimal_places=4)  # Price per fractional unit
    
    # Legal & metadata
    legal_documents = models.JSONField(default=dict, blank=True)  # JSON object mapping: {document_name: url}
    certificates = models.JSONField(default=list, blank=True)  # JSON array: [{name, url, file_type}, ...]
    metadata_json = models.TextField(blank=True, null=True)  # Additional metadata
    
    # Status & tracking
    listing_status = models.CharField(
        max_length=20,
        choices=LISTING_STATUS_CHOICES,
        default='inactive'
    )
    is_verified = models.BooleanField(default=False)  # Admin verification
    
    # Approval workflow
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_assets', limit_choices_to={'role': 'admin'})
    approved_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    listed_at = models.DateTimeField(null=True, blank=True)
    delisted_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'Asset'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['owner', '-created_at']),
            models.Index(fields=['listing_status', '-created_at']),
            models.Index(fields=['asa_id']),
        ]

    def __str__(self):
        return f"{self.title} - {self.available_supply} units available"


class WalletHolding(models.Model):
    """
    Tracks fractional ownership for each user.
    Represents how many fractional units each user holds of a specific asset.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='holdings')
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE, related_name='holders')
    
    quantity = models.DecimalField(max_digits=20, decimal_places=2)  # Fractional units owned
    wallet_address = models.CharField(max_length=255, blank=True, null=True)  # Algorand wallet
    opt_in_status = models.BooleanField(default=False)  # On-chain opt-in status
    
    acquired_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'WalletHolding'
        unique_together = ('user', 'asset')
        indexes = [
            models.Index(fields=['user', 'asset']),
        ]

    def __str__(self):
        return f"{self.user.email} holds {self.quantity} units of {self.asset.title}"


class Listing(models.Model):
    """
    Represents a marketplace listing for an asset.
    Handles the buy/sell flow with grouped transactions.
    """
    TRANSACTION_TYPE_CHOICES = (
        ('buy', 'Buy'),
        ('sell', 'Sell'),
    )

    seller = models.ForeignKey(User, on_delete=models.CASCADE, related_name='listings_as_seller')
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE, related_name='listings')
    
    quantity_available = models.DecimalField(max_digits=20, decimal_places=2)
    price_per_unit = models.DecimalField(max_digits=15, decimal_places=4)
    total_price = models.DecimalField(max_digits=20, decimal_places=2)
    
    listing_type = models.CharField(max_length=10, choices=TRANSACTION_TYPE_CHOICES, default='sell')
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'Listing'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['asset', 'is_active', '-created_at']),
        ]

    def __str__(self):
        return f"{self.seller.email} listing {self.quantity_available} units at {self.price_per_unit}"


class Transaction(models.Model):
    """
    Records all buy/sell transactions in the marketplace.
    Maintains transaction trail for auditing and blockchain sync.
    """

    TRANSACTION_STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('failed', 'Failed'),
    )

    buyer = models.ForeignKey(
        'User',
        on_delete=models.CASCADE,
        related_name='purchases'
    )

    seller = models.ForeignKey(
        'User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='sales'
    )

    asset = models.ForeignKey(
        'Asset',
        on_delete=models.CASCADE,
        related_name='transactions'
    )

    listing = models.ForeignKey(
        'Listing',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='transactions'
    )

    # Quantity (fractional units)
    quantity = models.DecimalField(max_digits=20, decimal_places=2)

    # 💰 Pricing
    unit_price = models.DecimalField(max_digits=15, decimal_places=4)
    total_amount = models.DecimalField(max_digits=20, decimal_places=2)

    # Blockchain fields (IMPORTANT)
    tx_id = models.CharField(max_length=255, null=True, blank=True)  # main txn id

    group_transaction_id = models.CharField(
        max_length=255,
        unique=True,
        null=True,
        blank=True
    )

    payment_txn_id = models.CharField(max_length=255, null=True, blank=True)
    asset_transfer_txn_id = models.CharField(max_length=255, null=True, blank=True)

    # ASA reference (useful for debugging & queries)
    asa_id = models.BigIntegerField(null=True, blank=True)

    # Status tracking
    status = models.CharField(
        max_length=20,
        choices=TRANSACTION_STATUS_CHOICES,
        default='pending'
    )

    # Validation flags
    buyer_opt_in_validated = models.BooleanField(default=False)
    buyer_balance_validated = models.BooleanField(default=False)

    # Error handling
    error_message = models.TextField(blank=True, null=True)

    #  Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    confirmed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'Transaction'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['buyer', '-created_at']),
            models.Index(fields=['seller', '-created_at']),
            models.Index(fields=['asset', '-created_at']),
            models.Index(fields=['status']),
            models.Index(fields=['tx_id']),  # 🔥 fast blockchain lookup
        ]

    def __str__(self):
        return f"{self.buyer.email} bought {self.quantity} units of {self.asset.title}"

    # 🔥 Helper method (VERY USEFUL)
    def mark_confirmed(self, tx_id):
        self.tx_id = tx_id
        self.status = 'confirmed'
        self.confirmed_at = timezone.now()
        self.save()

    def mark_failed(self, error_msg=None):
        self.status = 'failed'
        self.error_message = error_msg
        self.save()