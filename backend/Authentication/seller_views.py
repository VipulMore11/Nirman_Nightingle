from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from .models import Asset, User
from django.utils import timezone

# ============= SELLER ENDPOINTS =============

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_my_assets(request):
    """Get all assets created by the current user"""
    try:
        assets = Asset.objects.filter(owner=request.user).order_by('-created_at')
        
        assets_data = []
        for asset in assets:
            status_display = 'Active' if (asset.is_verified and asset.listing_status == 'active') else \
                            'Pending Review' if not asset.is_verified and not asset.rejection_reason else \
                            'Rejected' if asset.rejection_reason else 'Inactive'
            
            assets_data.append({
                'id': asset.id,
                'title': asset.title,
                'description': asset.description[:100] + '...',
                'listing_status': asset.listing_status,
                'is_verified': asset.is_verified,
                'asa_id': asset.asa_id,
                'available_supply': float(asset.available_supply),
                'unit_price': float(asset.unit_price),
                'created_at': asset.created_at.isoformat(),
                'approved_at': asset.approved_at.isoformat() if asset.approved_at else None,
                'rejection_reason': asset.rejection_reason,
                'status_display': status_display
            })
        
        return Response({'assets': assets_data, 'total': len(assets_data)}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_my_asset_detail(request, asset_id):
    """Get detailed view of a seller's asset"""
    try:
        asset = Asset.objects.get(id=asset_id, owner=request.user)
        
        return Response({
            'id': asset.id,
            'title': asset.title,
            'description': asset.description,
            'listing_status': asset.listing_status,
            'is_verified': asset.is_verified,
            'asa_id': asset.asa_id,
            'available_supply': float(asset.available_supply),
            'unit_price': float(asset.unit_price),
            'total_supply': float(asset.total_supply),
            'created_at': asset.created_at.isoformat(),
            'approved_at': asset.approved_at.isoformat() if asset.approved_at else None,
            'approved_by': asset.approved_by.username if asset.approved_by else None,
            'rejection_reason': asset.rejection_reason,
            'property_images': asset.property_images,
            'legal_documents': asset.legal_documents,
            'certificates': asset.certificates,
            'metadata_json': asset.metadata_json,
        }, status=status.HTTP_200_OK)
    except Asset.DoesNotExist:
        return Response({'error': 'Asset not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


# ============= ADMIN ENDPOINTS =============

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def get_pending_assets(request):
    """Admin: Get all assets pending review"""
    try:
        # Assets that are not verified and haven't been rejected
        assets = Asset.objects.filter(is_verified=False, rejection_reason__isnull=True).order_by('-created_at')
        
        assets_data = []
        for asset in assets:
            assets_data.append({
                'id': asset.id,
                'title': asset.title,
                'owner': asset.owner.username,
                'owner_email': asset.owner.email,
                'owner_kyc_status': asset.owner.kyc.status if hasattr(asset.owner, 'kyc') else 'not_found',
                'created_at': asset.created_at.isoformat(),
                'available_supply': float(asset.available_supply),
                'unit_price': float(asset.unit_price),
                'description': asset.description[:100] + '...',
                'total_supply': float(asset.total_supply),
                'creator_wallet': asset.creator_wallet,
            })
        
        return Response({'assets': assets_data, 'total': len(assets_data)}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def approve_asset(request, asset_id):
    """
    Admin: Approve asset and return ASA creation transaction for seller to sign.
    
    Flow:
    1. Admin clicks approve
    2. Backend validates KYC status
    3. Generate ASA creation transaction
    4. Return transaction bytes for seller to sign with Pera wallet
    5. Seller signs and submits via submit_asa_transaction endpoint
    """
    try:
        from .services.transaction_service import create_asa_on_blockchain
        
        asset = Asset.objects.get(id=asset_id)
        
        # Check if owner's KYC is verified
        if not hasattr(asset.owner, 'kyc') or asset.owner.kyc.status != 'verified':
            return Response(
                {'error': 'Asset owner KYC is not verified. Cannot approve.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Validate asset has creator_wallet
        if not asset.creator_wallet:
            return Response(
                {'error': 'Asset creator wallet is not set. Cannot create on blockchain.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Generate ASA transaction for seller to sign
        try:
            txn_data = create_asa_on_blockchain(asset)
        except Exception as blockchain_error:
            return Response({
                'error': 'Failed to generate ASA transaction',
                'details': str(blockchain_error)
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Mark asset as pending approval (waiting for blockchain submission)
        asset.approved_by = request.user
        asset.approved_at = timezone.now()
        asset.rejection_reason = None
        asset.save()
        
        return Response({
            'message': 'Asset approved. Please sign the transaction with your wallet.',
            'asset_id': asset.id,
            'txn_bytes': txn_data['txn_bytes'],
            'asset_name': txn_data['asset_name'],
            'total_supply': txn_data['total_supply'],
            'status': 'awaiting_signature'
        }, status=status.HTTP_200_OK)
        
    except Asset.DoesNotExist:
        return Response({'error': 'Asset not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_asa_transaction(request):
    """
    Submit signed ASA creation transaction to testnet.
    Gets the real ASA ID from blockchain and activates the asset.
    
    Expected body:
    {
        "asset_id": int,
        "signed_txn": "base64_encoded_signed_transaction"
    }
    """
    try:
        from .services.transaction_service import submit_asa_to_blockchain
        
        asset_id = request.data.get('asset_id')
        signed_txn = request.data.get('signed_txn')
        
        if not asset_id or not signed_txn:
            return Response({
                'error': 'asset_id and signed_txn are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        asset = Asset.objects.get(id=asset_id, owner=request.user)
        
        # Submit signed transaction to blockchain
        try:
            asa_id = submit_asa_to_blockchain(signed_txn)
        except Exception as blockchain_error:
            return Response({
                'error': 'Blockchain submission failed',
                'details': str(blockchain_error)
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Update asset with real ASA ID and mark as verified
        asset.asa_id = asa_id
        asset.is_verified = True
        asset.listing_status = 'active'
        if not asset.listed_at:
            asset.listed_at = timezone.now()
        asset.save()
        
        return Response({
            'message': 'Asset published to blockchain successfully',
            'asset_id': asset.id,
            'asa_id': asa_id,
            'listing_status': asset.listing_status,
            'is_verified': asset.is_verified
        }, status=status.HTTP_200_OK)
        
    except Asset.DoesNotExist:
        return Response({'error': 'Asset not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def reject_asset(request, asset_id):
    """Admin: Reject asset with reason"""
    try:
        asset = Asset.objects.get(id=asset_id)
        
        rejection_reason = request.data.get('reason', 'No reason provided')
        if not rejection_reason or not rejection_reason.strip():
            return Response({'error': 'Rejection reason is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        asset.rejection_reason = rejection_reason.strip()
        asset.is_verified = False
        asset.listing_status = 'inactive'
        asset.save()
        
        return Response({
            'message': 'Asset rejected',
            'asset_id': asset.id,
            'rejection_reason': rejection_reason
        }, status=status.HTTP_200_OK)
        
    except Asset.DoesNotExist:
        return Response({'error': 'Asset not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def resubmit_for_review(request, asset_id):
    """Admin: Reset rejection status to allow resubmission"""
    try:
        asset = Asset.objects.get(id=asset_id)
        
        asset.rejection_reason = None
        asset.is_verified = False
        asset.listing_status = 'inactive'
        asset.approved_by = None
        asset.approved_at = None
        asset.save()
        
        return Response({
            'message': 'Asset reset for resubmission',
            'asset_id': asset.id
        }, status=status.HTTP_200_OK)
        
    except Asset.DoesNotExist:
        return Response({'error': 'Asset not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
