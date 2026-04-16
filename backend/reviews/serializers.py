from rest_framework import serializers
from .models import Review, ReviewHelpful
from django.contrib.auth.models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name']


class ReviewSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    created_at = serializers.SerializerMethodField()
    user_found_helpful = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = ['id', 'user', 'asset_id', 'rating', 'comment', 'helpful_count', 'created_at', 'user_found_helpful']
        read_only_fields = ['id', 'helpful_count', 'created_at', 'user']

    def get_created_at(self, obj):
        """Format created_at as readable date"""
        return obj.created_at.strftime('%B %d, %Y at %I:%M %p')

    def get_user_found_helpful(self, obj):
        """Check if the current user found this review helpful"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return ReviewHelpful.objects.filter(review=obj, user=request.user).exists()
        return False


class ReviewCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['asset_id', 'rating', 'comment']

    def validate_rating(self, value):
        """Validate rating is between 1 and 5"""
        if not (1 <= value <= 5):
            raise serializers.ValidationError('Rating must be between 1 and 5.')
        return value

    def validate_comment(self, value):
        """Validate comment is not empty"""
        if not value.strip():
            raise serializers.ValidationError('Comment cannot be empty.')
        return value

    def validate_asset_id(self, value):
        """Validate asset_id is positive"""
        if value <= 0:
            raise serializers.ValidationError('Asset ID must be positive.')
        return value


class ReviewListSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    created_at = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = ['id', 'user', 'asset_id', 'rating', 'comment', 'helpful_count', 'created_at', 'average_rating']
        read_only_fields = fields

    def get_created_at(self, obj):
        """Format created_at as readable date"""
        return obj.created_at.strftime('%B %d, %Y at %I:%M %p')

    def get_average_rating(self, obj):
        """Get average rating for the asset"""
        avg = Review.objects.filter(asset_id=obj.asset_id).values('asset_id').annotate(
            avg_rating=models.Avg('rating')
        )
        return avg[0]['avg_rating'] if avg else None


from django.db import models as db_models
