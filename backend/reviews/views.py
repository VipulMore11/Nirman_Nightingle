from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q, Avg
from .models import Review, ReviewHelpful
from .serializers import ReviewSerializer, ReviewCreateSerializer, ReviewListSerializer


# Placeholder function - implement based on your blockchain service
def has_asset(wallet, asset_id):
    """
    Check if user owns the asset.
    TODO: Implement this based on your blockchain_service or transaction_service
    """
    # Example implementation - adjust based on your actual implementation
    from Authentication.services.transaction_service import get_user_assets
    try:
        assets = get_user_assets(wallet)
        return asset_id in assets
    except Exception:
        return False


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_review(request):
    """
    Create a new review for an asset.
    
    Required fields:
    - asset_id (int)
    - rating (int, 1-5)
    - comment (str)
    - wallet (str) - for ownership verification
    """
    serializer = ReviewCreateSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    asset_id = serializer.validated_data['asset_id']
    wallet = request.data.get('wallet')
    
    # Verify user owns the asset
    if not wallet:
        return Response(
            {'error': 'Wallet address is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if not has_asset(wallet, asset_id):
        return Response(
            {'error': 'You do not own this asset. Only asset owners can review.'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Check if review already exists for this user and asset
    existing_review = Review.objects.filter(
        user=request.user,
        asset_id=asset_id
    ).first()
    
    if existing_review:
        return Response(
            {'error': 'You have already reviewed this asset. You can only have one review per asset.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Create the review
    review = Review.objects.create(
        user=request.user,
        asset_id=asset_id,
        rating=serializer.validated_data['rating'],
        comment=serializer.validated_data['comment']
    )
    
    response_serializer = ReviewSerializer(review, context={'request': request})
    return Response(response_serializer.data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
def list_reviews(request):
    """
    List reviews for an asset with sorting options.
    
    Query Parameters:
    - asset_id (int, required) - ID of the asset
    - sort (str, optional) - 'latest', 'highest', 'helpful' (default: 'latest')
    - page (int, optional) - pagination page number (default: 1)
    - limit (int, optional) - results per page (default: 10)
    """
    asset_id = request.query_params.get('asset_id')
    sort = request.query_params.get('sort', 'latest')
    page = int(request.query_params.get('page', 1))
    limit = int(request.query_params.get('limit', 10))
    
    # Validate asset_id
    if not asset_id:
        return Response(
            {'error': 'asset_id query parameter is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        asset_id = int(asset_id)
    except ValueError:
        return Response(
            {'error': 'asset_id must be an integer'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Get reviews for the asset
    reviews = Review.objects.filter(asset_id=asset_id)
    
    # Apply sorting
    if sort == 'latest':
        reviews = reviews.order_by('-created_at')
    elif sort == 'highest':
        reviews = reviews.order_by('-rating', '-created_at')
    elif sort == 'helpful':
        reviews = reviews.order_by('-helpful_count', '-created_at')
    else:
        return Response(
            {'error': 'Invalid sort option. Use: latest, highest, or helpful'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Calculate average rating and total count
    total_count = reviews.count()
    avg_rating = reviews.aggregate(avg=Avg('rating'))['avg'] or 0
    
    # Pagination
    start = (page - 1) * limit
    end = start + limit
    paginated_reviews = reviews[start:end]
    
    serializer = ReviewListSerializer(paginated_reviews, many=True, context={'request': request})
    
    return Response({
        'count': total_count,
        'average_rating': round(avg_rating, 2),
        'rating_distribution': get_rating_distribution(asset_id),
        'page': page,
        'limit': limit,
        'total_pages': (total_count + limit - 1) // limit,
        'reviews': serializer.data
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_helpful(request, review_id):
    """
    Mark a review as helpful.
    
    URL: /reviews/helpful/<review_id>/
    """
    try:
        review = Review.objects.get(id=review_id)
    except Review.DoesNotExist:
        return Response(
            {'error': 'Review not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Prevent user from marking their own review as helpful
    if review.user == request.user:
        return Response(
            {'error': 'You cannot mark your own review as helpful'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Check if user already marked this review as helpful
    helpful_record = ReviewHelpful.objects.filter(
        review=review,
        user=request.user
    ).first()
    
    if helpful_record:
        # Remove the helpful marking (toggle)
        helpful_record.delete()
        review.helpful_count = max(0, review.helpful_count - 1)
        review.save()
        
        return Response({
            'message': 'Review marked as not helpful',
            'helpful_count': review.helpful_count,
            'is_helpful': False
        }, status=status.HTTP_200_OK)
    else:
        # Add the helpful marking
        ReviewHelpful.objects.create(
            review=review,
            user=request.user
        )
        review.helpful_count += 1
        review.save()
        
        return Response({
            'message': 'Review marked as helpful',
            'helpful_count': review.helpful_count,
            'is_helpful': True
        }, status=status.HTTP_200_OK)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_review(request, review_id):
    """
    Delete a review (only by the review author).
    
    URL: /reviews/delete/<review_id>/
    """
    try:
        review = Review.objects.get(id=review_id)
    except Review.DoesNotExist:
        return Response(
            {'error': 'Review not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Check if user is the review author
    if review.user != request.user:
        return Response(
            {'error': 'You can only delete your own reviews'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    review.delete()
    return Response(
        {'message': 'Review deleted successfully'},
        status=status.HTTP_204_NO_CONTENT
    )


@api_view(['GET'])
def get_asset_stats(request):
    """
    Get statistics for an asset's reviews.
    
    Query Parameters:
    - asset_id (int, required)
    """
    asset_id = request.query_params.get('asset_id')
    
    if not asset_id:
        return Response(
            {'error': 'asset_id query parameter is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        asset_id = int(asset_id)
    except ValueError:
        return Response(
            {'error': 'asset_id must be an integer'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    reviews = Review.objects.filter(asset_id=asset_id)
    total_reviews = reviews.count()
    
    if total_reviews == 0:
        return Response({
            'asset_id': asset_id,
            'total_reviews': 0,
            'average_rating': 0,
            'rating_distribution': {}
        }, status=status.HTTP_200_OK)
    
    avg_rating = reviews.aggregate(avg=Avg('rating'))['avg']
    
    return Response({
        'asset_id': asset_id,
        'total_reviews': total_reviews,
        'average_rating': round(avg_rating, 2),
        'rating_distribution': get_rating_distribution(asset_id)
    }, status=status.HTTP_200_OK)


def get_rating_distribution(asset_id):
    """
    Helper function to get the distribution of ratings for an asset.
    """
    reviews = Review.objects.filter(asset_id=asset_id)
    distribution = {}
    
    for i in range(1, 6):
        count = reviews.filter(rating=i).count()
        distribution[str(i)] = count
    
    return distribution
