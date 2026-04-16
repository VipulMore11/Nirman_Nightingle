from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from rest_framework.parsers import MultiPartParser, FormParser
from .models import KYC, User  
from django.contrib.auth import authenticate
from rest_framework.exceptions import ValidationError
from django.contrib.auth import get_user_model

class Base64ImageField(serializers.ImageField):
    """
    A Django REST framework field for handling image-uploads through raw post data.
    It uses base64 for encoding and decoding the contents of the file.

    Heavily based on
    https://github.com/tomchristie/django-rest-framework/pull/1268

    Updated for Django REST framework 3.
    """

    def to_internal_value(self, data):
        from django.core.files.base import ContentFile
        import base64
        import six
        import uuid

        # Check if this is a base64 string
        if isinstance(data, six.string_types):
            # Check if the base64 string is in the "data:" format
            if 'data:' in data and ';base64,' in data:
                # Break out the header from the base64 content
                header, data = data.split(';base64,')

            # Try to decode the file. Return validation error if it fails.
            try:
                decoded_file = base64.b64decode(data)
            except TypeError:
                self.fail('invalid_image')

            # Generate file name:
            file_name = str(uuid.uuid4())[:12] # 12 characters are more than enough.
            # Get the file name extension:
            file_extension = self.get_file_extension(file_name, decoded_file)

            complete_file_name = "%s.%s" % (file_name, file_extension, )

            data = ContentFile(decoded_file, name=complete_file_name)

        return super(Base64ImageField, self).to_internal_value(data)

    def get_file_extension(self, file_name, decoded_file):
        import imghdr

        extension = imghdr.what(file_name, decoded_file)
        extension = "jpg" if extension == "jpeg" else extension

        return extension

class UserSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'email', 'username','first_name','last_name', 'password','sex', 'role', 'profile_pic')

    def get_role(self, obj):
        return obj.role

    def create(self, validated_data):
        email = validated_data.get('email')
        username = validated_data.get('username')
        first_name = validated_data.get('first_name')
        last_name = validated_data.get('last_name')
        sex = validated_data.get('sex')
        password = validated_data.get('password')
        profile_pic = validated_data.get('profile_pic', None)
        if not email:
            raise ValueError(_('The Email must be set'))
        User = get_user_model()
        # Force role to 'user' on signup - admins can only be created via Django admin
        user = User(email=email, username=username, first_name=first_name, last_name=last_name, sex=sex, role='user', profile_pic=profile_pic)
        user.set_password(password)
        user.is_active= True
        user.save()
        return user

from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from django.contrib.auth import authenticate

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(write_only=True)
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data.get('email')
        password = data.get('password')
        if email and password:
            user = authenticate(request=self.context.get('request'), email=email, password=password)
            if user is not None:
                if user.is_active:
                    return user
                else:
                    raise ValidationError("User account is not active.")
            else:
                raise ValidationError("Invalid credentials. Please try again.")
        raise ValidationError("Both email and password are required.")

class ProfileSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ['first_name','last_name', 'email', 'phone_no', 'profile_pic', 'age','sex', 'dob', ]

class KYCSerializer(serializers.ModelSerializer):
    # File upload fields (input only, not stored in database)
    aadhaar_file = serializers.FileField(write_only=True, required=False, allow_null=True)
    pan_file = serializers.FileField(write_only=True, required=False, allow_null=True)
    passport_file = serializers.FileField(write_only=True, required=False, allow_null=True)
    selfie_file = serializers.FileField(write_only=True, required=False, allow_null=True)
    
    class Meta:
        model = KYC
        fields = [
            'id', 'user', 'aadhaar_number', 'aadhaar_card_url',
            'pan_number', 'pan_card_url', 'passport_number', 'passport_url',
            'address_line', 'city', 'state', 'pincode', 'selfie_url',
            'status', 'verified_by', 'verified_at', 'documents_submitted_at', 'created_at',
            'aadhaar_file', 'pan_file', 'passport_file', 'selfie_file'
        ]
        read_only_fields = ['status', 'verified_by', 'verified_at', 'created_at', 'documents_submitted_at']
    
    def validate(self, data):
        """
        Validate that at least one identity document and a selfie are provided.
        """
        # Check file inputs
        has_aadhaar_file = data.get('aadhaar_file') is not None
        has_pan_file = data.get('pan_file') is not None
        has_passport_file = data.get('passport_file') is not None
        has_selfie_file = data.get('selfie_file') is not None
        
        # Check if files are being uploaded
        files_being_uploaded = any([has_aadhaar_file, has_pan_file, has_passport_file, has_selfie_file])
        
        if files_being_uploaded:
            # If uploading files, require at least one ID and a selfie
            has_id_document = has_aadhaar_file or has_pan_file or has_passport_file
            if not has_id_document or not has_selfie_file:
                raise ValidationError(
                    "At least one identity document (Aadhaar, PAN, or Passport) and a selfie are required."
                )
        
        return data
    
    def create(self, validated_data):
        """
        Create a new KYC record with file uploads.
        """
        from .services.cloudinary_service import upload_kyc_documents
        from django.utils import timezone
        
        # Extract file objects from validated data
        aadhaar_file = validated_data.pop('aadhaar_file', None)
        pan_file = validated_data.pop('pan_file', None)
        passport_file = validated_data.pop('passport_file', None)
        selfie_file = validated_data.pop('selfie_file', None)
        
        # Upload files to Cloudinary if provided
        if any([aadhaar_file, pan_file, passport_file, selfie_file]):
            try:
                uploaded_urls = upload_kyc_documents(
                    kyc_obj=None,  # Not used in the function
                    aadhaar_file=aadhaar_file,
                    pan_file=pan_file,
                    passport_file=passport_file,
                    selfie_file=selfie_file
                )
                # Update validated_data with the Cloudinary URLs
                validated_data.update(uploaded_urls)
                validated_data['documents_submitted_at'] = timezone.now()
            except Exception as e:
                raise ValidationError(f"Document upload failed: {str(e)}")
        
        # Create the KYC record
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        """
        Update a KYC record with file uploads.
        """
        from .services.cloudinary_service import upload_kyc_documents
        from django.utils import timezone
        
        # Extract file objects from validated data
        aadhaar_file = validated_data.pop('aadhaar_file', None)
        pan_file = validated_data.pop('pan_file', None)
        passport_file = validated_data.pop('passport_file', None)
        selfie_file = validated_data.pop('selfie_file', None)
        
        # Upload files to Cloudinary if provided
        if any([aadhaar_file, pan_file, passport_file, selfie_file]):
            try:
                uploaded_urls = upload_kyc_documents(
                    kyc_obj=instance,
                    aadhaar_file=aadhaar_file,
                    pan_file=pan_file,
                    passport_file=passport_file,
                    selfie_file=selfie_file
                )
                # Update validated_data with the Cloudinary URLs
                validated_data.update(uploaded_urls)
                validated_data['documents_submitted_at'] = timezone.now()
            except Exception as e:
                raise ValidationError(f"Document upload failed: {str(e)}")
        
        # Update the KYC record
        return super().update(instance, validated_data)


# ===== Tokenized Asset Marketplace Serializers =====

from .models import Asset, WalletHolding, Listing, Transaction


class AssetListingSerializer(serializers.ModelSerializer):
    """Minimal serializer for asset listings"""
    owner_email = serializers.CharField(source='owner.email', read_only=True)
    
    class Meta:
        model = Asset
        fields = [
            'id', 'asa_id', 'title', 'description', 'photo',
            'total_supply', 'available_supply', 'unit_price',
            'listing_status', 'is_verified', 'owner_email',
            'created_at', 'listed_at'
        ]


class AssetDetailSerializer(serializers.ModelSerializer):
    """Full serializer for asset details"""
    owner_email = serializers.CharField(source='owner.email', read_only=True)
    total_holders = serializers.SerializerMethodField()
    total_value = serializers.SerializerMethodField()
    
    class Meta:
        model = Asset
        fields = [
            'id', 'owner', 'owner_email', 'asa_id', 'title', 'description',
            'photo', 'total_supply', 'available_supply', 'unit_price',
            'legal_documents', 'metadata_json', 'listing_status',
            'is_verified', 'total_holders', 'total_value',
            'created_at', 'updated_at', 'listed_at', 'delisted_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'owner']

    def get_total_holders(self, obj):
        """Get number of unique holders"""
        return obj.holders.filter(quantity__gt=0).count()

    def get_total_value(self, obj):
        """Calculate total market value"""
        return float(obj.available_supply * obj.unit_price)


class AssetCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating assets"""
    
    class Meta:
        model = Asset
        fields = [
            'title', 'description', 'photo', 'total_supply',
            'unit_price', 'legal_documents', 'metadata_json'
        ]

    def validate_total_supply(self, value):
        if value <= 0:
            raise serializers.ValidationError("Total supply must be greater than 0")
        return value

    def validate_unit_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Unit price must be greater than 0")
        return value

    def create(self, validated_data):
        validated_data['owner'] = self.context['request'].user
        validated_data['available_supply'] = validated_data['total_supply']
        return super().create(validated_data)


class WalletHoldingSerializer(serializers.ModelSerializer):
    """Serializer for wallet holdings"""
    asset_title = serializers.CharField(source='asset.title', read_only=True)
    asset_id = serializers.IntegerField(source='asset.id', read_only=True)
    holding_value = serializers.SerializerMethodField()
    
    class Meta:
        model = WalletHolding
        fields = [
            'id', 'asset_id', 'asset_title', 'quantity',
            'wallet_address', 'opt_in_status', 'holding_value',
            'acquired_at', 'updated_at'
        ]
        read_only_fields = ['id', 'acquired_at', 'updated_at']

    def get_holding_value(self, obj):
        """Calculate total value of holding"""
        return float(obj.quantity * obj.asset.unit_price)


class ListingSerializer(serializers.ModelSerializer):
    """Serializer for marketplace listings"""
    seller_email = serializers.CharField(source='seller.email', read_only=True)
    asset_title = serializers.CharField(source='asset.title', read_only=True)
    
    class Meta:
        model = Listing
        fields = [
            'id', 'seller', 'seller_email', 'asset', 'asset_title',
            'quantity_available', 'price_per_unit', 'total_price',
            'listing_type', 'is_active', 'created_at', 'expires_at'
        ]
        read_only_fields = ['id', 'seller', 'created_at', 'total_price']

    def validate(self, data):
        """Validate listing data"""
        if data['quantity_available'] <= 0:
            raise serializers.ValidationError("Quantity must be greater than 0")
        
        if data['price_per_unit'] <= 0:
            raise serializers.ValidationError("Price must be greater than 0")
        
        # Check seller has sufficient holdings
        asset = data['asset']
        seller = self.context['request'].user
        try:
            holding = WalletHolding.objects.get(asset=asset, user=seller)
            if holding.quantity < data['quantity_available']:
                raise serializers.ValidationError(
                    f"Insufficient holdings. You have {holding.quantity} units."
                )
        except WalletHolding.DoesNotExist:
            raise serializers.ValidationError("You do not hold this asset.")
        
        return data

    def create(self, validated_data):
        validated_data['seller'] = self.context['request'].user
        validated_data['total_price'] = (
            validated_data['quantity_available'] * validated_data['price_per_unit']
        )
        return super().create(validated_data)


class TransactionSerializer(serializers.ModelSerializer):
    """Serializer for transactions"""
    buyer_email = serializers.CharField(source='buyer.email', read_only=True)
    seller_email = serializers.CharField(source='seller.email', read_only=True, allow_null=True)
    asset_title = serializers.CharField(source='asset.title', read_only=True)
    
    class Meta:
        model = Transaction
        fields = [
            'id', 'buyer', 'buyer_email', 'seller', 'seller_email',
            'asset', 'asset_title', 'listing', 'quantity', 'unit_price',
            'total_amount', 'group_transaction_id', 'payment_txn_id',
            'asset_transfer_txn_id', 'status', 'buyer_opt_in_validated',
            'buyer_balance_validated', 'error_message',
            'created_at', 'confirmed_at'
        ]
        read_only_fields = [
            'id', 'buyer', 'created_at', 'confirmed_at',
            'group_transaction_id', 'payment_txn_id', 'asset_transfer_txn_id'
        ]


class TransactionCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new transactions (buy flow)"""
    
    class Meta:
        model = Transaction
        fields = ['listing', 'quantity']

    def validate(self, data):
        """Validate transaction data"""
        listing = data['listing']
        quantity = data['quantity']
        
        # Validate quantity
        if quantity <= 0:
            raise serializers.ValidationError("Quantity must be greater than 0")
        
        if quantity > listing.quantity_available:
            raise serializers.ValidationError(
                f"Insufficient available quantity. Only {listing.quantity_available} available."
            )
        
        if not listing.is_active:
            raise serializers.ValidationError("This listing is no longer active.")
        
        return data

    def create(self, validated_data):
        listing = validated_data['listing']
        quantity = validated_data['quantity']
        
        # Create transaction
        transaction = Transaction.objects.create(
            buyer=self.context['request'].user,
            seller=listing.seller,
            asset=listing.asset,
            listing=listing,
            quantity=quantity,
            unit_price=listing.price_per_unit,
            total_amount=quantity * listing.price_per_unit,
            status='pending'
        )
        
        return transaction


class SellTransactionCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new transactions (sell flow)"""
    
    class Meta:
        model = Transaction
        fields = ['listing', 'quantity']

    def validate(self, data):
        """Validate sell transaction data"""
        listing = data['listing']
        quantity = data['quantity']
        seller = self.context['request'].user
        
        # Validate quantity
        if quantity <= 0:
            raise serializers.ValidationError("Quantity must be greater than 0")
        
        if quantity > listing.quantity_available:
            raise serializers.ValidationError(
                f"Insufficient available quantity. Only {listing.quantity_available} available."
            )
        
        if not listing.is_active:
            raise serializers.ValidationError("This listing is no longer active.")
        
        # For sell, the seller must be the listing creator
        if listing.seller != seller:
            raise serializers.ValidationError("You can only sell from your own listings.")
        
        # Verify seller has sufficient holdings
        try:
            holding = WalletHolding.objects.get(asset=listing.asset, user=seller)
            if holding.quantity < quantity:
                raise serializers.ValidationError(
                    f"Insufficient holdings. You have {holding.quantity} units but trying to sell {quantity}."
                )
        except WalletHolding.DoesNotExist:
            raise serializers.ValidationError("You do not hold this asset.")
        
        return data

    def create(self, validated_data):
        listing = validated_data['listing']
        quantity = validated_data['quantity']
        seller = self.context['request'].user
        buyer_id = self.context.get('buyer_id')  # Should be provided in context
        
        if not buyer_id:
            raise serializers.ValidationError("Buyer ID is required for sell transactions.")
        
        from django.shortcuts import get_object_or_404
        buyer = get_object_or_404(User, id=buyer_id)
        
        # Create transaction
        transaction = Transaction.objects.create(
            buyer=buyer,
            seller=seller,
            asset=listing.asset,
            listing=listing,
            quantity=quantity,
            unit_price=listing.price_per_unit,
            total_amount=quantity * listing.price_per_unit,
            status='pending'
        )
        
        return transaction