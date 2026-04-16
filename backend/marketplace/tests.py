from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from .models import Asset, Ownership, Dividend


class AssetTestCase(TestCase):
    """Test cases for Asset model."""

    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.asset = Asset.objects.create(
            name='Test Asset',
            asset_id=1001,
            total_tokens=1000,
            tokenized_percentage=50,
            owner=self.user
        )

    def test_asset_creation(self):
        """Test asset can be created."""
        self.assertEqual(self.asset.name, 'Test Asset')
        self.assertEqual(self.asset.asset_id, 1001)
        self.assertEqual(self.asset.total_tokens, 1000)

    def test_asset_string_representation(self):
        """Test asset string representation."""
        self.assertEqual(str(self.asset), 'Test Asset (Asset ID: 1001)')


class OwnershipTestCase(TestCase):
    """Test cases for Ownership model."""

    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.asset = Asset.objects.create(
            name='Test Asset',
            asset_id=1001,
            total_tokens=1000,
            tokenized_percentage=50,
            owner=self.user
        )
        self.ownership = Ownership.objects.create(
            user=self.user,
            asset=self.asset,
            tokens_owned=100,
            buy_price=10.0
        )

    def test_ownership_creation(self):
        """Test ownership can be created."""
        self.assertEqual(self.ownership.tokens_owned, 100)
        self.assertEqual(self.ownership.buy_price, 10.0)

    def test_unique_ownership_constraint(self):
        """Test user can only have one ownership per asset."""
        with self.assertRaises(Exception):
            Ownership.objects.create(
                user=self.user,
                asset=self.asset,
                tokens_owned=50,
                buy_price=12.0
            )


class DividendDistributionTestCase(TestCase):
    """Test cases for dividend distribution."""

    def setUp(self):
        self.owner = User.objects.create_user(
            username='owner',
            email='owner@example.com',
            password='testpass123'
        )
        self.user1 = User.objects.create_user(
            username='user1',
            email='user1@example.com',
            password='testpass123'
        )
        self.user2 = User.objects.create_user(
            username='user2',
            email='user2@example.com',
            password='testpass123'
        )

        self.asset = Asset.objects.create(
            name='Test Asset',
            asset_id=1001,
            total_tokens=1000,
            tokenized_percentage=50,
            owner=self.owner
        )

        self.ownership1 = Ownership.objects.create(
            user=self.user1,
            asset=self.asset,
            tokens_owned=300,
            buy_price=10.0
        )

        self.ownership2 = Ownership.objects.create(
            user=self.user2,
            asset=self.asset,
            tokens_owned=700,
            buy_price=10.0
        )

    def test_dividend_distribution_calculation(self):
        """Test dividend distribution calculations."""
        total_profit = 1000.0
        distributable_profit = total_profit * (self.asset.tokenized_percentage / 100)
        profit_per_token = distributable_profit / self.asset.total_tokens

        dividend = Dividend.objects.create(
            asset=self.asset,
            total_profit=total_profit,
            distributed_profit=distributable_profit,
            profit_per_token=profit_per_token
        )

        # Expected: 1000 * 0.5 = 500 distributable
        # Expected: 500 / 1000 = 0.5 per token
        self.assertEqual(dividend.distributed_profit, 500.0)
        self.assertEqual(dividend.profit_per_token, 0.5)

    def test_user_profit_calculation(self):
        """Test individual user profit calculation."""
        total_profit = 1000.0
        distributable_profit = total_profit * (self.asset.tokenized_percentage / 100)
        profit_per_token = distributable_profit / self.asset.total_tokens

        dividend = Dividend.objects.create(
            asset=self.asset,
            total_profit=total_profit,
            distributed_profit=distributable_profit,
            profit_per_token=profit_per_token
        )

        # User1: 300 tokens * 0.5 = 150
        user1_profit = self.ownership1.tokens_owned * dividend.profit_per_token
        self.assertEqual(user1_profit, 150.0)

        # User2: 700 tokens * 0.5 = 350
        user2_profit = self.ownership2.tokens_owned * dividend.profit_per_token
        self.assertEqual(user2_profit, 350.0)


class APIEndpointTestCase(TestCase):
    """Test cases for API endpoints."""

    def setUp(self):
        self.client = APIClient()
        self.owner = User.objects.create_user(
            username='owner',
            email='owner@example.com',
            password='testpass123'
        )
        self.user = User.objects.create_user(
            username='user',
            email='user@example.com',
            password='testpass123'
        )

        self.asset = Asset.objects.create(
            name='Test Asset',
            asset_id=1001,
            total_tokens=1000,
            tokenized_percentage=50,
            owner=self.owner
        )

    def test_distribute_dividend_unauthorized(self):
        """Test distribute dividend endpoint without authentication."""
        response = self.client.post('/api/marketplace/dividends/distribute/', {
            'asset_id': 1001,
            'total_profit': 1000.0
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_distribute_dividend_forbidden(self):
        """Test non-owner cannot distribute dividend."""
        self.client.force_authenticate(user=self.user)
        response = self.client.post('/api/marketplace/dividends/distribute/', {
            'asset_id': 1001,
            'total_profit': 1000.0
        })
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
