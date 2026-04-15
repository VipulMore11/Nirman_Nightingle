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