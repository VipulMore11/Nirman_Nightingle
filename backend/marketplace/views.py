from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db.models import Sum, Q

from .models import Asset, Ownership, Dividend
from .serializers import (
    AssetSerializer,
    OwnershipSerializer,
    DividendSerializer,
    DividendDistributionSerializer,
    DividendDistributionResponseSerializer,
    OwnerDashboardSerializer,
    UserDashboardSerializer,
    UserDividendSerializer,
)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def distribute_dividend(request):
    """
    Distribute dividend to token holders.
    
    Only asset owner can call this endpoint.
    
    Request body:
    {
        "asset_id": <int>,
        "total_profit": <float>
    }
    """
    serializer = DividendDistributionSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(
            {'error': 'Invalid input', 'details': serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )

    asset_id = serializer.validated_data['asset_id']
    total_profit = serializer.validated_data['total_profit']

    # Validate asset exists
    asset = get_object_or_404(Asset, asset_id=asset_id)

    # Only asset owner can distribute dividends
    if asset.owner != request.user:
        return Response(
            {'error': 'Only asset owner can distribute dividends'},
            status=status.HTTP_403_FORBIDDEN
        )

    # Validate total profit
    if total_profit < 0:
        return Response(
            {'error': 'Total profit cannot be negative'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Validate asset has tokens
    if asset.total_tokens <= 0:
        return Response(
            {'error': 'Asset must have tokens to distribute dividends'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Calculate distributable profit
    distributable_profit = total_profit * (asset.tokenized_percentage / 100)
    owner_keeps = total_profit - distributable_profit

    # Calculate profit per token (safe division)
    profit_per_token = 0
    if asset.total_tokens > 0:
        profit_per_token = distributable_profit / asset.total_tokens

    # Create dividend record
    dividend = Dividend.objects.create(
        asset=asset,
        total_profit=total_profit,
        distributed_profit=distributable_profit,
        profit_per_token=profit_per_token,
    )

    # Get all token holders for this asset
    ownerships = Ownership.objects.filter(asset=asset)
    ownership_data = []

    for ownership in ownerships:
        user_profit = ownership.tokens_owned * profit_per_token
        ownership_data.append({
            'user_id': ownership.user.id,
            'username': ownership.user.username,
            'tokens_owned': ownership.tokens_owned,
            'profit_earned': user_profit,
        })

    response_data = {
        'dividend_id': dividend.id,
        'asset_id': asset.asset_id,
        'asset_name': asset.name,
        'total_profit': total_profit,
        'distributable_profit': distributable_profit,
        'profit_per_token': profit_per_token,
        'owner_keeps': owner_keeps,
        'total_users_compensated': len(ownerships),
        'distribution_details': ownership_data,
    }

    return Response(response_data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def owner_dashboard(request, asset_id):
    """
    Get owner dashboard for an asset.
    
    Shows:
    - Total profit from the asset
    - Tokenized percentage
    - Distributed profit to token holders
    - Remaining profit (owner keeps)
    - List of users with tokens and their profit
    """
    asset = get_object_or_404(Asset, asset_id=asset_id)

    # Only asset owner can view this dashboard
    if asset.owner != request.user:
        return Response(
            {'error': 'You do not have permission to view this asset dashboard'},
            status=status.HTTP_403_FORBIDDEN
        )

    # Get all ownerships for this asset
    ownerships = Ownership.objects.filter(asset=asset)

    # Get latest dividend for this asset
    latest_dividend = Dividend.objects.filter(asset=asset).order_by('-created_at').first()

    total_profit = 0
    distributed_profit = 0

    if latest_dividend:
        total_profit = latest_dividend.total_profit
        distributed_profit = latest_dividend.distributed_profit

    remaining_profit = total_profit - distributed_profit

    dashboard_data = {
        'asset_id': asset.asset_id,
        'asset_name': asset.name,
        'total_tokens': asset.total_tokens,
        'tokenized_percentage': asset.tokenized_percentage,
        'total_users': ownerships.count(),
        'total_profit': total_profit,
        'distributed_profit': distributed_profit,
        'remaining_profit': remaining_profit,
        'ownership_list': OwnershipSerializer(ownerships, many=True).data,
    }

    return Response(dashboard_data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_dashboard(request, asset_id):
    """
    Get user dashboard for a specific asset.
    
    Shows for logged-in user:
    - Asset name
    - Tokens owned
    - Buy price
    - Profit per token (from latest dividend)
    - Total profit earned
    """
    asset = get_object_or_404(Asset, asset_id=asset_id)

    # Check if user owns tokens in this asset
    ownership = get_object_or_404(Ownership, user=request.user, asset=asset)

    # Get latest dividend for this asset
    latest_dividend = Dividend.objects.filter(asset=asset).order_by('-created_at').first()

    profit_per_token = 0
    total_profit_earned = 0

    if latest_dividend:
        profit_per_token = latest_dividend.profit_per_token
        total_profit_earned = ownership.tokens_owned * profit_per_token

    # Calculate percentage ownership
    percentage_ownership = (ownership.tokens_owned / asset.total_tokens) * 100 if asset.total_tokens > 0 else 0

    dashboard_data = {
        'asset_id': asset.asset_id,
        'asset_name': asset.name,
        'tokens_owned': ownership.tokens_owned,
        'buy_price': ownership.buy_price,
        'profit_per_token': profit_per_token,
        'total_profit_earned': total_profit_earned,
        'percentage_ownership': percentage_ownership,
    }

    return Response(dashboard_data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_portfolio(request):
    """
    Get all assets and tokens owned by the logged-in user.
    
    Shows:
    - All assets owned by user
    - Tokens in each asset
    - Buy price for each asset
    - Latest dividend information
    - Total portfolio value
    """
    ownerships = Ownership.objects.filter(user=request.user).select_related('asset')

    portfolio_data = []
    total_portfolio_value = 0

    for ownership in ownerships:
        asset = ownership.asset
        latest_dividend = Dividend.objects.filter(asset=asset).order_by('-created_at').first()

        profit_per_token = 0
        total_profit_earned = 0

        if latest_dividend:
            profit_per_token = latest_dividend.profit_per_token
            total_profit_earned = ownership.tokens_owned * profit_per_token

        percentage_ownership = (ownership.tokens_owned / asset.total_tokens) * 100 if asset.total_tokens > 0 else 0
        token_value = ownership.tokens_owned * ownership.buy_price

        total_portfolio_value += token_value

        portfolio_data.append({
            'asset_id': asset.asset_id,
            'asset_name': asset.name,
            'tokens_owned': ownership.tokens_owned,
            'buy_price': ownership.buy_price,
            'token_value': token_value,
            'profit_per_token': profit_per_token,
            'total_profit_earned': total_profit_earned,
            'percentage_ownership': percentage_ownership,
        })

    return Response(
        {
            'total_assets': len(portfolio_data),
            'total_portfolio_value': total_portfolio_value,
            'portfolio': portfolio_data,
        },
        status=status.HTTP_200_OK
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def asset_dividend_history(request, asset_id):
    """
    Get dividend distribution history for an asset.
    
    Shows:
    - All dividend distributions for the asset
    - Distribution date
    - Total profit and distributed profit
    - Profit per token
    """
    asset = get_object_or_404(Asset, asset_id=asset_id)

    dividends = Dividend.objects.filter(asset=asset).order_by('-created_at')

    dividend_data = DividendSerializer(dividends, many=True).data

    return Response(
        {
            'asset_id': asset.asset_id,
            'asset_name': asset.name,
            'total_distributions': len(dividends),
            'distributions': dividend_data,
        },
        status=status.HTTP_200_OK
    )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_asset(request):
    """
    Create a new tokenized asset.
    
    Request body:
    {
        "name": <string>,
        "asset_id": <int>,
        "total_tokens": <int>,
        "tokenized_percentage": <float>
    }
    """
    serializer = AssetSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(
            {'error': 'Invalid input', 'details': serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        asset = Asset.objects.create(
            name=serializer.validated_data['name'],
            asset_id=serializer.validated_data['asset_id'],
            total_tokens=serializer.validated_data['total_tokens'],
            tokenized_percentage=serializer.validated_data['tokenized_percentage'],
            owner=request.user,
        )

        # Validate the asset
        asset.full_clean()
        asset.save()

        return Response(
            AssetSerializer(asset).data,
            status=status.HTTP_201_CREATED
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def purchase_tokens(request):
    """
    Purchase tokens in an asset.
    
    Request body:
    {
        "asset_id": <int>,
        "tokens_owned": <int>,
        "buy_price": <float>
    }
    """
    required_fields = ['asset_id', 'tokens_owned', 'buy_price']
    for field in required_fields:
        if field not in request.data:
            return Response(
                {'error': f'Missing required field: {field}'},
                status=status.HTTP_400_BAD_REQUEST
            )

    try:
        asset_id = request.data['asset_id']
        tokens_owned = int(request.data['tokens_owned'])
        buy_price = float(request.data['buy_price'])

        # Validate asset exists
        asset = get_object_or_404(Asset, asset_id=asset_id)

        # Validate tokens and buy price
        if tokens_owned <= 0:
            return Response(
                {'error': 'Tokens owned must be greater than 0'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if buy_price < 0:
            return Response(
                {'error': 'Buy price cannot be negative'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create or update ownership
        ownership, created = Ownership.objects.update_or_create(
            user=request.user,
            asset=asset,
            defaults={
                'tokens_owned': tokens_owned,
                'buy_price': buy_price,
            }
        )

        # Validate ownership
        ownership.full_clean()

        return Response(
            OwnershipSerializer(ownership).data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
        )
    except ValueError as e:
        return Response(
            {'error': 'Invalid data type'},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )
