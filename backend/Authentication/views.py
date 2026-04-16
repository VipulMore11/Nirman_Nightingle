from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import AllowAny,IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .serializers import KYCSerializer, UserSerializer,LoginSerializer, ProfileSerializer, TransactionSerializer, ListingSerializer
from .models import KYC, User, Transaction, Listing, WalletHolding
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
from algosdk import encoding
from .services.transaction_service import create_atomic_buy, create_atomic_sell
from .services.algorand_service import algod_client

@api_view(['POST'])
@permission_classes([AllowAny])
# @authentication_classes([SessionAuthentication, BasicAuthentication])
def signup_view(request):
    if request.method == 'POST':
        reg_serializer = UserSerializer(data=request.data)
        if reg_serializer.is_valid():
            new_user = reg_serializer.save()
            refresh = RefreshToken.for_user(new_user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': {
                    'id': new_user.id,
                    'email': new_user.email,
                    'first_name': new_user.first_name,
                    'last_name': new_user.last_name,
                    'username': new_user.username,
                    'role': new_user.role
                }
            }, status=status.HTTP_200_OK)
        return Response(reg_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    return Response({'message': 'Method not allowed'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

@api_view(['POST'])
@csrf_exempt
@permission_classes([AllowAny])
# @authentication_classes([SessionAuthentication])
def login_view(request):
    if request.method == 'POST':
        mutable_data = request.data.copy()
        email = mutable_data.get('email')

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'error': 'User with this email does not exist.'}, status=status.HTTP_404_NOT_FOUND)

        mutable_data['username'] = user.username
        serializer = LoginSerializer(data=mutable_data, context={'request': request})

        if serializer.is_valid():
            user = serializer.validated_data
            refresh = RefreshToken.for_user(user)
            response = {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'username': user.username,
                    'role': user.role
                }
            }
            return Response(response, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    return Response({'message': 'Method not allowed'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

@api_view(['POST'])
@permission_classes([AllowAny])
def logout_view(request):
    try:
        refresh_token = request.data.get("refresh_token")
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response({'message': 'Logged out successfully'})
    except Exception as e:
        return Response(status=status.HTTP_200_OK)
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_profile(request):
    try:
        profile = User.objects.get(email=request.user.email)
        serializer = ProfileSerializer(profile)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({'Error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'Error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    try:
        instance = get_object_or_404(User, email=request.user.email)
        serializer = ProfileSerializer(instance=instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'Error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
@permission_classes([IsAuthenticated])
def submit_kyc(request):
    """
    Submit KYC documents (Aadhaar, PAN, Passport, and Selfie).
    
    Accepts multipart/form-data with the following optional fields:
    - aadhaar_file: JPG/PNG file (≤5MB)
    - pan_file: JPG/PNG file (≤5MB)
    - passport_file: JPG/PNG file (≤5MB)
    - selfie_file: JPG/PNG file (≤5MB) - REQUIRED
    - aadhaar_number: String (optional)
    - pan_number: String (optional)
    - passport_number: String (optional)
    - address_line: String (optional)
    - city: String (optional)
    - state: String (optional)
    - pincode: String (optional)
    
    At least one identity document (Aadhaar, PAN, or Passport) and a selfie are required.
    Files are uploaded to Cloudinary, and URLs are stored in the database.
    
    Returns: KYC record with document URLs
    """
    try:
        kyc = request.user.kyc
    except KYC.DoesNotExist:
        # Create a new KYC record if it doesn't exist
        kyc = KYC.objects.create(user=request.user)
    
    serializer = KYCSerializer(instance=kyc, data=request.data, partial=True)

    if serializer.is_valid():
        serializer.save(status='pending')
        return Response(serializer.data, status=status.HTTP_200_OK)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_kyc(request):
    user_id = request.data.get('user_id')
    kyc = get_object_or_404(KYC, user_id=user_id)

    kyc.status = 'verified'
    kyc.verified_by = request.user
    kyc.verified_at = timezone.now()
    kyc.save()

    return Response({"message": "KYC verified"})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_kyc(request):
    serializer = KYCSerializer(request.user.kyc)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def buy_asset(request):
    """
    Buyer creates a buy transaction against a sell listing.
    Buyer must have verified KYC status.
    """
    listing_id = request.data.get("listing_id")
    quantity = int(request.data.get("quantity"))

    user = request.user  # Buyer

    # 🔐 KYC check
    if user.kyc.status != 'verified':
        return Response({
            "error": "KYC not verified",
            "error_code": "kyc_incomplete"
        }, status=403)

    try:
        listing = Listing.objects.get(id=listing_id)
    except Listing.DoesNotExist:
        return Response({
            "error": "Listing not found",
            "error_code": "listing_not_found"
        }, status=404)

    if not listing.is_active:
        return Response({
            "error": "Listing not active",
            "error_code": "listing_inactive"
        }, status=400)

    if quantity > listing.quantity_available:
        return Response({
            "error": f"Not enough units available. Only {listing.quantity_available} available.",
            "error_code": "insufficient_units"
        }, status=400)

    # ✅ Check buyer has opted in to ASA (optional but recommended)
    try:
        buyer_holding = WalletHolding.objects.get(user=user, asset=listing.asset)
        if not buyer_holding.opt_in_status:
            return Response({
                "error": "You have not opted in to this asset. Please opt-in first.",
                "error_code": "asset_opt_in_required"
            }, status=400)
    except WalletHolding.DoesNotExist:
        # If no holding exists, buyer hasn't opted in yet
        return Response({
            "error": "You have not opted in to this asset. Please opt-in first.",
            "error_code": "asset_opt_in_required"
        }, status=400)

    total_price = quantity * listing.price_per_unit

    # 🔥 Create transaction record (pending)
    txn_obj = Transaction.objects.create(
        buyer=user,
        seller=listing.seller,
        asset=listing.asset,
        listing=listing,
        quantity=quantity,
        unit_price=listing.price_per_unit,
        total_amount=total_price,
        asa_id=listing.asset.asa_id,
        status='pending'
    )

    # 🔗 Create atomic txn
    txns = create_atomic_buy(
        buyer=user.wallet_address,
        seller=listing.seller.wallet_address,
        asset_id=listing.asset.asa_id,
        quantity=quantity,
        price=total_price
    )

    encoded_txns = [encoding.msgpack_encode(txn) for txn in txns]

    return Response({
        "txn_id": txn_obj.id,
        "txns": encoded_txns
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def confirm_buy(request):
    """
    Confirm a buy transaction on blockchain.
    Updates buyer's holdings and listing quantity.
    """
    txn_id = request.data.get("txn_id")
    blockchain_tx_id = request.data.get("blockchain_tx_id")

    try:
        txn = Transaction.objects.get(id=txn_id)
    except Transaction.DoesNotExist:
        return Response({
            "error": "Transaction not found",
            "error_code": "transaction_not_found"
        }, status=404)

    # 🔍 Verify on blockchain
    try:
        tx_info = algod_client.pending_transaction_info(blockchain_tx_id)
    except Exception as e:
        txn.mark_failed(f"Blockchain verification failed: {str(e)}")
        return Response({
            "error": "Failed to verify transaction on blockchain",
            "error_code": "blockchain_error"
        }, status=400)

    if not tx_info:
        txn.mark_failed("Transaction not found on blockchain")
        return Response({
            "error": "Invalid transaction - not found on blockchain",
            "error_code": "transaction_not_found"
        }, status=400)

    # ✅ Mark confirmed
    txn.mark_confirmed(blockchain_tx_id)

    # 🔄 Update Listing
    listing = txn.listing
    listing.quantity_available -= txn.quantity

    if listing.quantity_available <= 0:
        listing.is_active = False

    listing.save()

    # 🔄 Update Buyer Holdings
    holding, created = WalletHolding.objects.get_or_create(
        user=txn.buyer,
        asset=txn.asset,
        defaults={
            "quantity": txn.quantity,
            "wallet_address": txn.buyer.wallet_address,
            "opt_in_status": True
        }
    )

    if not created:
        holding.quantity += txn.quantity
        holding.save()

    return Response({
        "message": "Transaction confirmed",
        "tx_id": blockchain_tx_id
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def sell_asset(request):
    """
    Seller creates a sell transaction against a buy listing.
    Seller must own sufficient units of the asset.
    """
    listing_id = request.data.get("listing_id")
    quantity = int(request.data.get("quantity"))
    buyer_id = request.data.get("buyer_id")  # The user creating the buy listing

    user = request.user  # Seller

    # 🔐 KYC check
    if user.kyc.status != 'verified':
        return Response({
            "error": "KYC not verified",
            "error_code": "kyc_incomplete"
        }, status=403)

    try:
        listing = Listing.objects.get(id=listing_id)
    except Listing.DoesNotExist:
        return Response({"error": "Listing not found"}, status=404)

    if not listing.is_active:
        return Response({"error": "Listing not active"}, status=400)

    if quantity > listing.quantity_available:
        return Response({
            "error": f"Not enough units available. Only {listing.quantity_available} available.",
            "error_code": "insufficient_units"
        }, status=400)

    # ✅ Verify seller has sufficient holdings
    try:
        holding = WalletHolding.objects.get(asset=listing.asset, user=user)
        if holding.quantity < quantity:
            return Response({
                "error": f"Insufficient holdings. You have {holding.quantity} units but trying to sell {quantity}.",
                "error_code": "insufficient_funds"
            }, status=400)
    except WalletHolding.DoesNotExist:
        return Response({
            "error": "You do not hold this asset.",
            "error_code": "insufficient_funds"
        }, status=400)

    # ✅ Verify buyer exists
    try:
        buyer = User.objects.get(id=buyer_id)
    except User.DoesNotExist:
        return Response({"error": "Buyer not found"}, status=404)

    total_price = quantity * listing.price_per_unit

    # 🔥 Create transaction record (pending)
    txn_obj = Transaction.objects.create(
        buyer=buyer,
        seller=user,
        asset=listing.asset,
        listing=listing,
        quantity=quantity,
        unit_price=listing.price_per_unit,
        total_amount=total_price,
        asa_id=listing.asset.asa_id,
        status='pending'
    )

    # 🔗 Create atomic txn (buyer pays, seller transfers asset)
    txns = create_atomic_sell(
        seller=user.wallet_address,
        buyer=buyer.wallet_address,
        asset_id=listing.asset.asa_id,
        quantity=quantity,
        price=total_price
    )

    encoded_txns = [encoding.msgpack_encode(txn) for txn in txns]

    return Response({
        "txn_id": txn_obj.id,
        "txns": encoded_txns
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def confirm_sell(request):
    """
    Confirm a sell transaction on blockchain.
    Updates seller's holdings and listing quantity.
    """
    txn_id = request.data.get("txn_id")
    blockchain_tx_id = request.data.get("blockchain_tx_id")

    try:
        txn = Transaction.objects.get(id=txn_id)
    except Transaction.DoesNotExist:
        return Response({"error": "Transaction not found"}, status=404)

    # 🔍 Verify on blockchain
    try:
        tx_info = algod_client.pending_transaction_info(blockchain_tx_id)
    except:
        txn.mark_failed("Failed to verify transaction on blockchain")
        return Response({
            "error": "Failed to verify on blockchain",
            "error_code": "blockchain_error"
        }, status=400)

    if not tx_info:
        txn.mark_failed("Transaction not found on blockchain")
        return Response({
            "error": "Invalid transaction",
            "error_code": "transaction_not_found"
        }, status=400)

    # ✅ Mark confirmed
    txn.mark_confirmed(blockchain_tx_id)

    # 🔄 Update Listing
    listing = txn.listing
    listing.quantity_available -= txn.quantity

    if listing.quantity_available <= 0:
        listing.is_active = False

    listing.save()

    # 🔄 Update Seller Holdings (decrease)
    holding = WalletHolding.objects.get(user=txn.seller, asset=txn.asset)
    holding.quantity -= txn.quantity
    holding.save()

    # 🔄 Update Buyer Holdings (increase)
    buyer_holding, created = WalletHolding.objects.get_or_create(
        user=txn.buyer,
        asset=txn.asset,
        defaults={
            "quantity": txn.quantity,
            "wallet_address": txn.buyer.wallet_address,
            "opt_in_status": True
        }
    )

    if not created:
        buyer_holding.quantity += txn.quantity
        buyer_holding.save()

    return Response({
        "message": "Sell transaction confirmed",
        "tx_id": blockchain_tx_id
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def transaction_history(request):
    """
    Get transaction history for the current user.
    Supports filtering by asset_id, status, and date range.
    Returns both buy and sell transactions.
    """
    user = request.user
    
    # Filter transactions where user is either buyer or seller
    transactions = Transaction.objects.filter(
        buyer=user
    ) | Transaction.objects.filter(
        seller=user
    )

    # Optional filters
    asset_id = request.query_params.get('asset_id')
    if asset_id:
        transactions = transactions.filter(asset_id=asset_id)

    status_filter = request.query_params.get('status')
    if status_filter:
        transactions = transactions.filter(status=status_filter)

    date_from = request.query_params.get('date_from')
    if date_from:
        from datetime import datetime
        transactions = transactions.filter(created_at__gte=datetime.fromisoformat(date_from))

    date_to = request.query_params.get('date_to')
    if date_to:
        from datetime import datetime
        transactions = transactions.filter(created_at__lte=datetime.fromisoformat(date_to))

    # Order by date descending
    transactions = transactions.order_by('-created_at')

    # Pagination (optional: 20 per page)
    page = int(request.query_params.get('page', 1))
    per_page = int(request.query_params.get('per_page', 20))
    
    start = (page - 1) * per_page
    end = start + per_page
    
    total_count = transactions.count()
    transactions_paginated = transactions[start:end]

    serializer = TransactionSerializer(transactions_paginated, many=True)
    
    return Response({
        "total": total_count,
        "page": page,
        "per_page": per_page,
        "transactions": serializer.data
    })


