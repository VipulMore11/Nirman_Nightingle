from django.db import models
from django.utils import timezone
from .managers import CustomUserManager
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):

    ROLE_CHOICES = (
        ('user', 'User'),
        ('admin', 'Admin'),
    )

    username = models.CharField(max_length=100, null=True, blank=True)
    first_name = models.CharField(max_length=255, null=True, blank=True)
    last_name = models.CharField(max_length=255, null=True, blank=True)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=100)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='user')


    phone_no = models.CharField(max_length=10, blank=True, null=True)
    profile_pic = models.TextField(blank=True, null=True)
    age = models.IntegerField(null=True, blank=True)
    sex = models.CharField(max_length=10, blank=True, null=True)
    dob = models.CharField(max_length=11, blank=True, null=True)

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

    # Address Proof
    address_line = models.TextField(blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)
    pincode = models.CharField(max_length=10, blank=True, null=True)

    selfie_url = models.TextField(blank=True, null=True)

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
    title = models.CharField(max_length=255)
    description = models.TextField()
    photo = models.TextField(blank=True, null=True)  # Store as base64 or URL
    
    # Asset-specific fields
    asa_id = models.BigIntegerField(unique=True, null=True, blank=True)  # Algorand ASA ID
    total_supply = models.DecimalField(max_digits=20, decimal_places=2)  # Total fractional units
    available_supply = models.DecimalField(max_digits=20, decimal_places=2)  # Remaining units
    unit_price = models.DecimalField(max_digits=15, decimal_places=4)  # Price per fractional unit
    
    # Legal & metadata
    legal_documents = models.TextField(blank=True, null=True)  # Store JSON or file path
    metadata_json = models.TextField(blank=True, null=True)  # Additional metadata
    
    # Status & tracking
    listing_status = models.CharField(
        max_length=20,
        choices=LISTING_STATUS_CHOICES,
        default='inactive'
    )
    is_verified = models.BooleanField(default=False)  # Admin verification
    
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
    Maintains transaction trail for auditing and history.
    """
    TRANSACTION_STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('failed', 'Failed'),
    )

    buyer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='purchases')
    seller = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='sales')
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE, related_name='transactions')
    listing = models.ForeignKey(Listing, on_delete=models.SET_NULL, null=True, blank=True, related_name='transactions')
    
    quantity = models.DecimalField(max_digits=20, decimal_places=2)
    unit_price = models.DecimalField(max_digits=15, decimal_places=4)
    total_amount = models.DecimalField(max_digits=20, decimal_places=2)
    
    # Algorand-specific fields
    group_transaction_id = models.CharField(max_length=255, unique=True, null=True, blank=True)
    payment_txn_id = models.CharField(max_length=255, null=True, blank=True)  # Payment transaction
    asset_transfer_txn_id = models.CharField(max_length=255, null=True, blank=True)  # Asset transfer
    
    status = models.CharField(
        max_length=20,
        choices=TRANSACTION_STATUS_CHOICES,
        default='pending'
    )
    
    # Validation & metadata
    buyer_opt_in_validated = models.BooleanField(default=False)
    buyer_balance_validated = models.BooleanField(default=False)
    error_message = models.TextField(blank=True, null=True)
    
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
        ]

    def __str__(self):
        return f"Transaction: {self.buyer.email} bought {self.quantity} units from {self.seller.email if self.seller else 'issuer'}"