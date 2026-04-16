from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status
from .serializers import AssetCreateUpdateSerializer
from .models import Asset
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
@parser_classes([MultiPartParser, FormParser])
def create_asset_with_documents(request):
    """
    Create an asset with property images, legal documents, and certificates.
    
    Expected form data:
    - title: Asset title
    - description: Asset description
    - total_supply: Total fractional units
    - unit_price: Price per unit
    - creator_wallet: Wallet address creating the asset
    - metadata_json: Optional additional metadata (JSON string)
    
    File uploads (optional):
    - property_image_files: Multiple property images
    - property_image_names: Names for each property image (comma-separated or array)
    - legal_document_files: Multiple legal documents
    - legal_document_names: Names for each document
    - certificate_files: Multiple certificates
    - certificate_names: Names for each certificate
    """
    try:
        # Use the serializer to handle file uploads and validation
        serializer = AssetCreateUpdateSerializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            asset = serializer.save()
            
            return Response({
                'id': asset.id,
                'title': asset.title,
                'description': asset.description,
                'creator_wallet': asset.creator_wallet,
                'total_supply': asset.total_supply,
                'unit_price': asset.unit_price,
                'property_images': asset.property_images,
                'legal_documents': asset.legal_documents,
                'certificates': asset.certificates,
                'listing_status': asset.listing_status,
                'is_verified': asset.is_verified,
                'created_at': asset.created_at.isoformat()
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def update_asset_documents(request, asset_id):
    """
    Update an asset by adding/updating property images, legal documents, and certificates.
    This endpoint supports partial updates and appends new files to existing collections.
    
    Expected form data:
    - property_image_files: New property images to add
    - property_image_names: Names for new property images
    - legal_document_files: New legal documents to add
    - legal_document_names: Names for new documents
    - certificate_files: New certificates to add
    - certificate_names: Names for new certificates
    
    Other fields (title, description, etc.) can also be updated.
    """
    try:
        asset = Asset.objects.get(id=asset_id, owner=request.user)
    except Asset.DoesNotExist:
        return Response(
            {'error': 'Asset not found or you do not have permission to edit it'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    try:
        serializer = AssetCreateUpdateSerializer(
            asset, 
            data=request.data, 
            partial=True,
            context={'request': request}
        )
        
        if serializer.is_valid():
            asset = serializer.save()
            
            # Set is_verified to False if documents were updated
            if any([request.FILES.get(f) for f in ['property_image_files', 'legal_document_files', 'certificate_files']]):
                asset.is_verified = False
                asset.save()
            
            return Response({
                'id': asset.id,
                'title': asset.title,
                'description': asset.description,
                'property_images': asset.property_images,
                'legal_documents': asset.legal_documents,
                'certificates': asset.certificates,
                'is_verified': asset.is_verified,
                'updated_at': asset.updated_at.isoformat()
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

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