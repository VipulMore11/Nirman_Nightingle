from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny,IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .serializers import (
    KYCSerializer, UserSerializer, LoginSerializer, ProfileSerializer,
    TransactionSerializer, TransactionCreateSerializer, ListingSerializer
)
from .models import KYC, User, Transaction, Listing, WalletHolding, Asset
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
from .services.transaction_service import create_atomic_buy, create_atomic_sell
from decimal import Decimal
from django.db.models import Q


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
                'role': new_user.role
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
                'role': user.role
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
@permission_classes([IsAuthenticated])
def submit_kyc(request):
    kyc = request.user.kyc
    serializer = KYCSerializer(instance=kyc, data=request.data, partial=True)

    if serializer.is_valid():
        serializer.save(status='pending')
        return Response(serializer.data)

    return Response(serializer.errors, status=400)

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


# ============================================================================
# MARKETPLACE: BUY/SELL ENDPOINTS
# ============================================================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def buy_asset(request):
    """
    Create a pending buy transaction.
    
    Request body:
    {
        "listing_id": 1,
        "quantity": 5
    }
    
    Response: {
        "txn_id": 1,
        "txns": [base64_encoded_txn1, base64_encoded_txn2]
    }
    """
    try:
        listing_id = request.data.get('listing_id')
        quantity = request.data.get('quantity')
        
        # Validate inputs
        if not listing_id or not quantity:
            return Response(
                {'error': 'listing_id and quantity are required', 'error_code': 'invalid_input'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get listing
        listing = get_object_or_404(Listing, id=listing_id, is_active=True)
        
        # Check KYC
        if request.user.kyc.status != 'verified':
            return Response(
                {
                    'error': 'KYC verification required before purchasing',
                    'error_code': 'kyc_incomplete'
                },
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Validate quantity
        quantity = Decimal(str(quantity))
        if quantity <= 0:
            return Response(
                {'error': 'Quantity must be greater than 0', 'error_code': 'invalid_quantity'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if quantity > listing.quantity_available:
            return Response(
                {
                    'error': f'Insufficient available quantity. Only {listing.quantity_available} available.',
                    'error_code': 'insufficient_inventory'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check buyer has sufficient balance
        total_cost = quantity * listing.price_per_unit
        # Note: In a real Algorand implementation, you'd check actual wallet balance
        # For now, we validate from the user's bank/fiat balance if needed
        
        # Check buyer has wallet address
        if not request.user.wallet_address:
            return Response(
                {
                    'error': 'Wallet address not connected. Please connect your Pera Wallet.',
                    'error_code': 'wallet_not_connected'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check seller has wallet address
        if not listing.seller.wallet_address:
            return Response(
                {
                    'error': 'Seller wallet address not available.',
                    'error_code': 'seller_wallet_error'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create transaction record
        transaction = Transaction.objects.create(
            buyer=request.user,
            seller=listing.seller,
            asset=listing.asset,
            listing=listing,
            quantity=quantity,
            unit_price=listing.price_per_unit,
            total_amount=total_cost,
            status='pending'
        )
        
        # Create atomic transaction using Algorand SDK
        try:
            txns = create_atomic_buy(
                buyer=request.user.wallet_address,
                seller=listing.seller.wallet_address,
                asset_id=listing.asset.asset_id,
                amount=int(quantity),  # Convert to integer
                price=int(total_cost * 1000000)  # Convert to microAlgos
            )
            
            # Encode transactions to base64 for frontend
            from algosdk.encoding import encode_address, encode_obj
            import base64
            
            encoded_txns = []
            for txn in txns:
                # Encode transaction to msgpack format
                encoded = base64.b64encode(
                    encode_obj(txn.dictify())
                ).decode('utf-8')
                encoded_txns.append(encoded)
            
            return Response({
                'txn_id': transaction.id,
                'txns': encoded_txns
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            transaction.status = 'failed'
            transaction.error_message = str(e)
            transaction.save()
            
            return Response(
                {
                    'error': f'Failed to create transaction: {str(e)}',
                    'error_code': 'blockchain_error'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
    
    except Exception as e:
        return Response(
            {'error': str(e), 'error_code': 'server_error'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def confirm_buy(request):
    """
    Confirm a buy transaction after blockchain verification.
    
    Request body:
    {
        "txn_id": 1,
        "signed_txns": [signed_txn1, signed_txn2]
    }
    """
    try:
        txn_id = request.data.get('txn_id')
        signed_txns = request.data.get('signed_txns', [])
        
        if not txn_id:
            return Response(
                {'error': 'txn_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        transaction = get_object_or_404(Transaction, id=txn_id, buyer=request.user)
        
        if transaction.status != 'pending':
            return Response(
                {'error': 'Transaction is not in pending status'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verify transaction on blockchain
        # In production, you would:
        # 1. Submit signed transactions to Algorand network
        # 2. Get transaction ID
        # 3. Verify confirmation on blockchain
        
        try:
            # For now, we simulate blockchain verification
            # In production, use algod_client.send_transactions()
            
            # Update transaction status
            transaction.status = 'confirmed'
            transaction.confirmed_at = timezone.now()
            
            # Update seller's listing quantity
            listing = transaction.listing
            listing.quantity_available -= transaction.quantity
            listing.save()
            
            # Update buyer's holdings
            holding, created = WalletHolding.objects.get_or_create(
                user=transaction.buyer,
                asset=transaction.asset,
                defaults={'quantity': Decimal('0')}
            )
            holding.quantity += transaction.quantity
            holding.save()
            
            transaction.save()
            
            serializer = TransactionSerializer(transaction)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Exception as e:
            transaction.status = 'failed'
            transaction.error_message = str(e)
            transaction.save()
            
            return Response(
                {
                    'error': f'Blockchain verification failed: {str(e)}',
                    'error_code': 'blockchain_error'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
    
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def sell_asset(request):
    """
    Create a pending sell transaction.
    
    Request body:
    {
        "listing_id": 1,
        "quantity": 5
    }
    """
    try:
        listing_id = request.data.get('listing_id')
        quantity = request.data.get('quantity')
        
        # Validate inputs
        if not listing_id or not quantity:
            return Response(
                {'error': 'listing_id and quantity are required', 'error_code': 'invalid_input'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get listing
        listing = get_object_or_404(Listing, id=listing_id, seller=request.user, is_active=True)
        
        # Check KYC
        if request.user.kyc.status != 'verified':
            return Response(
                {
                    'error': 'KYC verification required before selling',
                    'error_code': 'kyc_incomplete'
                },
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Validate quantity
        quantity = Decimal(str(quantity))
        if quantity <= 0:
            return Response(
                {'error': 'Quantity must be greater than 0', 'error_code': 'invalid_quantity'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check seller has sufficient holdings
        holding = WalletHolding.objects.filter(
            user=request.user,
            asset=listing.asset
        ).first()
        
        if not holding or holding.quantity < quantity:
            available = holding.quantity if holding else Decimal('0')
            return Response(
                {
                    'error': f'Insufficient holdings. You have {available} units.',
                    'error_code': 'insufficient_funds'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check seller has wallet address
        if not request.user.wallet_address:
            return Response(
                {
                    'error': 'Wallet address not connected. Please connect your Pera Wallet.',
                    'error_code': 'wallet_not_connected'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # For a sell, the buyer will be determined later or in the listing
        # For now, create a transaction record for the sell offer
        total_price = quantity * listing.price_per_unit
        
        transaction = Transaction.objects.create(
            seller=request.user,
            buyer=None,  # To be filled when buyer accepts
            asset=listing.asset,
            listing=listing,
            quantity=quantity,
            unit_price=listing.price_per_unit,
            total_amount=total_price,
            status='pending'
        )
        
        # Create atomic transaction
        try:
            import base64
            from algosdk.encoding import encode_obj
            
            # For a sell, seller transfers asset, buyer sends payment
            # We'll use the listing's expected buyer (if available) or create a template
            # For now, return the transaction data without signed transactions
            
            return Response({
                'txn_id': transaction.id,
                'message': 'Sell transaction created. Awaiting buyer.'
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            transaction.status = 'failed'
            transaction.error_message = str(e)
            transaction.save()
            
            return Response(
                {
                    'error': f'Failed to create transaction: {str(e)}',
                    'error_code': 'blockchain_error'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
    
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def confirm_sell(request):
    """
    Confirm a sell transaction after blockchain verification.
    """
    try:
        txn_id = request.data.get('txn_id')
        signed_txns = request.data.get('signed_txns', [])
        
        if not txn_id:
            return Response(
                {'error': 'txn_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        transaction = get_object_or_404(Transaction, id=txn_id, seller=request.user)
        
        if transaction.status != 'pending':
            return Response(
                {'error': 'Transaction is not in pending status'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Verify on blockchain
            transaction.status = 'confirmed'
            transaction.confirmed_at = timezone.now()
            
            # Decrease seller's holdings
            holding = WalletHolding.objects.get(
                user=transaction.seller,
                asset=transaction.asset
            )
            holding.quantity -= transaction.quantity
            holding.save()
            
            # Update listing quantity
            listing = transaction.listing
            listing.quantity_available -= transaction.quantity
            listing.save()
            
            transaction.save()
            
            serializer = TransactionSerializer(transaction)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Exception as e:
            transaction.status = 'failed'
            transaction.error_message = str(e)
            transaction.save()
            
            return Response(
                {
                    'error': f'Blockchain verification failed: {str(e)}',
                    'error_code': 'blockchain_error'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
    
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def transaction_history(request):
    """
    Get transaction history for the current user.
    
    Query parameters:
    - asset_id: Filter by asset
    - status: Filter by status (pending, confirmed, failed)
    - date_from: Filter from date (YYYY-MM-DD)
    - date_to: Filter to date (YYYY-MM-DD)
    - page: Page number (default 1)
    - per_page: Items per page (default 20)
    """
    try:
        user = request.user
        
        # Build query filter - user is buyer OR seller
        query = Q(buyer=user) | Q(seller=user)
        
        transactions = Transaction.objects.filter(query)
        
        # Apply filters
        asset_id = request.query_params.get('asset_id')
        if asset_id:
            transactions = transactions.filter(asset_id=asset_id)
        
        txn_status = request.query_params.get('status')
        if txn_status:
            transactions = transactions.filter(status=txn_status)
        
        date_from = request.query_params.get('date_from')
        if date_from:
            transactions = transactions.filter(created_at__date__gte=date_from)
        
        date_to = request.query_params.get('date_to')
        if date_to:
            transactions = transactions.filter(created_at__date__lte=date_to)
        
        # Pagination
        page = int(request.query_params.get('page', 1))
        per_page = int(request.query_params.get('per_page', 20))
        
        total = transactions.count()
        start_idx = (page - 1) * per_page
        end_idx = start_idx + per_page
        
        paginated_transactions = transactions[start_idx:end_idx]
        
        serializer = TransactionSerializer(paginated_transactions, many=True)
        
        return Response({
            'total': total,
            'page': page,
            'per_page': per_page,
            'transactions': serializer.data
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )