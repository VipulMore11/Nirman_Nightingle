from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Asset, Ownership, Dividend


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model."""
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name')


class AssetSerializer(serializers.ModelSerializer):
    """Serializer for Asset model."""
    owner_username = serializers.CharField(source='owner.username', read_only=True)

    class Meta:
        model = Asset
        fields = (
            'id',
            'name',
            'asset_id',
            'total_tokens',
            'tokenized_percentage',
            'owner',
            'owner_username',
            'created_at',
            'updated_at',
        )
        read_only_fields = ('created_at', 'updated_at')


class OwnershipSerializer(serializers.ModelSerializer):
    """Serializer for Ownership model."""
    asset_name = serializers.CharField(source='asset.name', read_only=True)
    user_username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Ownership
        fields = (
            'id',
            'user',
            'user_username',
            'asset',
            'asset_name',
            'tokens_owned',
            'buy_price',
            'created_at',
            'updated_at',
        )
        read_only_fields = ('created_at', 'updated_at')


class DividendSerializer(serializers.ModelSerializer):
    """Serializer for Dividend model."""
    asset_name = serializers.CharField(source='asset.name', read_only=True)

    class Meta:
        model = Dividend
        fields = (
            'id',
            'asset',
            'asset_name',
            'total_profit',
            'distributed_profit',
            'profit_per_token',
            'created_at',
        )
        read_only_fields = ('distributed_profit', 'profit_per_token', 'created_at')


class DividendDistributionSerializer(serializers.Serializer):
    """Serializer for dividend distribution request."""
    asset_id = serializers.IntegerField()
    total_profit = serializers.FloatField()


class UserDividendSerializer(serializers.Serializer):
    """Serializer for user dividend earnings."""
    user_id = serializers.IntegerField()
    username = serializers.CharField()
    tokens_owned = serializers.IntegerField()
    profit_earned = serializers.FloatField()


class DividendDistributionResponseSerializer(serializers.Serializer):
    """Serializer for dividend distribution response."""
    dividend_id = serializers.IntegerField()
    asset_id = serializers.IntegerField()
    asset_name = serializers.CharField()
    total_profit = serializers.FloatField()
    distributable_profit = serializers.FloatField()
    profit_per_token = serializers.FloatField()
    owner_keeps = serializers.FloatField()
    total_users_compensated = serializers.IntegerField()
    distribution_details = OwnershipSerializer(many=True, read_only=True)


class OwnerDashboardSerializer(serializers.Serializer):
    """Serializer for owner dashboard data."""
    asset_id = serializers.IntegerField()
    asset_name = serializers.CharField()
    total_tokens = serializers.IntegerField()
    tokenized_percentage = serializers.FloatField()
    total_users = serializers.IntegerField()
    total_profit = serializers.FloatField()
    distributed_profit = serializers.FloatField()
    remaining_profit = serializers.FloatField()
    ownership_list = OwnershipSerializer(many=True, read_only=True)


class UserDashboardSerializer(serializers.Serializer):
    """Serializer for user dashboard data."""
    asset_id = serializers.IntegerField()
    asset_name = serializers.CharField()
    tokens_owned = serializers.IntegerField()
    buy_price = serializers.FloatField()
    profit_per_token = serializers.FloatField()
    total_profit_earned = serializers.FloatField()
    percentage_ownership = serializers.FloatField()
