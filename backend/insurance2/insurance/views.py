from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404, redirect
from django.views.decorators.http import require_http_methods
from marketplace.models import Ownership, Asset


# External insurance website URL
INSURANCE_REDIRECT_URL = "https://www.onsurity.com/plus/asset-insurance/"


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def redirect_insurance(request):
    """
    Redirect user to the external insurance website.
    
    Returns:
        Redirect response to https://www.onsurity.com/plus/asset-insurance/
    """
    return Response(
        {
            'message': 'Redirecting to insurance provider',
            'redirect_url': INSURANCE_REDIRECT_URL
        },
        status=status.HTTP_200_OK
    )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def activate_insurance(request):
    """
    Activate insurance for a specific asset.
    
    Calculates premium and coverage based on total asset value.
    
    Request body:
    {
        "asset_id": <int>
    }
    
    Returns:
        Success response with premium_paid and coverage_amount
        or error response with appropriate status code
    """
    # Get asset_id from request
    asset_id = request.data.get('asset_id')
    
    if not asset_id:
        return Response(
            {'error': 'asset_id is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        asset_id = int(asset_id)
    except (ValueError, TypeError):
        return Response(
            {'error': 'asset_id must be a valid integer'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Fetch Ownership object using logged-in user and asset_id
    try:
        ownership = Ownership.objects.get(
            user=request.user,
            asset__asset_id=asset_id
        )
    except Ownership.DoesNotExist:
        return Response(
            {'error': 'Ownership record not found for this asset'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Check if insurance is already active
    if ownership.is_insured and ownership.insurance_status == 'active':
        return Response(
            {'error': 'Insurance is already active for this asset'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Calculate insurance values
    total_value = ownership.tokens_owned * ownership.buy_price
    premium_paid = total_value * 0.02  # 2% of total value
    coverage_amount = total_value * 10  # 10x the total value
    
    # Update Ownership fields
    ownership.is_insured = True
    ownership.insurance_status = 'active'
    ownership.premium_paid = premium_paid
    ownership.coverage_amount = coverage_amount
    ownership.save()
    
    return Response(
        {
            'message': 'Insurance activated successfully',
            'asset_id': asset_id,
            'asset_name': ownership.asset.name,
            'tokens_owned': ownership.tokens_owned,
            'total_value': total_value,
            'premium_paid': round(premium_paid, 2),
            'coverage_amount': round(coverage_amount, 2),
            'insurance_status': ownership.insurance_status,
        },
        status=status.HTTP_200_OK
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_insurance(request):
    """
    Get all insurance data for the logged-in user.
    
    Returns:
        List of owned assets with insurance information
    """
    # Fetch all Ownership records for the logged-in user
    ownerships = Ownership.objects.filter(user=request.user).select_related('asset')
    
    if not ownerships.exists():
        return Response(
            {
                'message': 'No owned assets found',
                'data': []
            },
            status=status.HTTP_200_OK
        )
    
    # Build response data
    insurance_data = []
    for ownership in ownerships:
        insurance_data.append({
            'ownership_id': ownership.id,
            'asset_id': ownership.asset.asset_id,
            'asset_name': ownership.asset.name,
            'tokens_owned': ownership.tokens_owned,
            'buy_price': ownership.buy_price,
            'total_value': ownership.tokens_owned * ownership.buy_price,
            'is_insured': ownership.is_insured,
            'insurance_status': ownership.insurance_status,
            'premium_paid': round(ownership.premium_paid, 2) if ownership.premium_paid else 0.0,
            'coverage_amount': round(ownership.coverage_amount, 2) if ownership.coverage_amount else 0.0,
            'created_at': ownership.created_at,
            'updated_at': ownership.updated_at,
        })
    
    return Response(
        {
            'message': 'Insurance data retrieved successfully',
            'count': len(insurance_data),
            'data': insurance_data
        },
        status=status.HTTP_200_OK
    )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def claim_insurance(request):
    """
    Claim insurance for a specific asset.
    
    Request body:
    {
        "asset_id": <int>
    }
    
    Returns:
        Success response with claim details
        or error response with appropriate status code
    """
    # Get asset_id from request
    asset_id = request.data.get('asset_id')
    
    if not asset_id:
        return Response(
            {'error': 'asset_id is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        asset_id = int(asset_id)
    except (ValueError, TypeError):
        return Response(
            {'error': 'asset_id must be a valid integer'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Fetch Ownership object using logged-in user and asset_id
    try:
        ownership = Ownership.objects.get(
            user=request.user,
            asset__asset_id=asset_id
        )
    except Ownership.DoesNotExist:
        return Response(
            {'error': 'Ownership record not found for this asset'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Validate that insurance is active
    if not ownership.is_insured:
        return Response(
            {'error': 'Asset is not insured'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if ownership.insurance_status != 'active':
        return Response(
            {'error': f'Insurance is not active. Current status: {ownership.insurance_status}'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Update insurance_status to 'claimed'
    ownership.insurance_status = 'claimed'
    ownership.save()
    
    return Response(
        {
            'message': 'Insurance claim submitted successfully',
            'asset_id': asset_id,
            'asset_name': ownership.asset.name,
            'insurance_status': ownership.insurance_status,
            'coverage_amount': round(ownership.coverage_amount, 2),
            'claim_timestamp': ownership.updated_at,
        },
        status=status.HTTP_200_OK
    )
