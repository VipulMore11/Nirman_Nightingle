from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from .services.algorand_service import create_asa_txn, opt_in_txn
from .services.transaction_service import create_atomic_buy
from algosdk import encoding


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_asset(request):

    wallet = request.data.get("wallet")
    asset_name = request.data.get("asset_name")

    txn = create_asa_txn(wallet, asset_name, "UNIT", 1000)
    txn_bytes = encoding.msgpack_encode(txn)

    return Response({
        "txn_bytes": txn_bytes
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def opt_in(request):

    wallet = request.data.get("wallet")
    asset_id = request.data.get("asset_id")

    txn = opt_in_txn(wallet, asset_id)

    return Response({"txn": txn.dictify()})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def buy_asset(request):

    buyer = request.data.get("buyer")
    seller = request.data.get("seller")
    asset_id = request.data.get("asset_id")
    units = int(request.data.get("units"))
    price = int(request.data.get("price"))

    # 🔐 KYC check
    if request.user.kyc.status != 'verified':
        return Response({"error": "KYC not verified"}, status=403)

    txns = create_atomic_buy(buyer, seller, asset_id, units, price)

    return Response({
        "txns": [txn.dictify() for txn in txns]
    })