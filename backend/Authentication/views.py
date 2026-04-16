from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny,IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .serializers import KYCSerializer, UserSerializer,LoginSerializer, ProfileSerializer
from .models import KYC, User, Transaction, Listings, WalletHolding
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
from algosdk import encoding
from .services.transaction_service import create_atomic_buy
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

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def buy_asset(request):

    listing_id = request.data.get("listing_id")
    quantity = int(request.data.get("quantity"))

    user = request.user

    # 🔐 KYC check
    if user.kyc.status != 'verified':
        return Response({"error": "KYC not verified"}, status=403)

    listing = Listing.objects.get(id=listing_id)

    if not listing.is_active:
        return Response({"error": "Listing not active"}, status=400)

    if quantity > listing.quantity_available:
        return Response({"error": "Not enough units"}, status=400)

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

    txn_id = request.data.get("txn_id")
    blockchain_tx_id = request.data.get("blockchain_tx_id")

    txn = Transaction.objects.get(id=txn_id)

    # 🔍 Verify on blockchain
    tx_info = algod_client.pending_transaction_info(blockchain_tx_id)

    if not tx_info:
        txn.mark_failed("Transaction not found on blockchain")
        return Response({"error": "Invalid transaction"}, status=400)

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

