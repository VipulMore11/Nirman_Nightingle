from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from .models import Review


class ReviewModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpass123')
        self.client = APIClient()

    def test_review_creation(self):
        """Test basic review creation"""
        review = Review.objects.create(
            user=self.user,
            asset_id=1,
            rating=5,
            comment="Great asset!"
        )
        self.assertEqual(review.rating, 5)
        self.assertEqual(review.helpful_count, 0)

    def test_unique_review_per_user_asset(self):
        """Test that user can only have one review per asset"""
        Review.objects.create(
            user=self.user,
            asset_id=1,
            rating=5,
            comment="Great asset!"
        )
        
        with self.assertRaises(Exception):
            Review.objects.create(
                user=self.user,
                asset_id=1,
                rating=3,
                comment="Changed my mind"
            )

    def test_rating_validation(self):
        """Test rating must be between 1-5"""
        review = Review(
            user=self.user,
            asset_id=1,
            rating=6,  # Invalid
            comment="Test"
        )
        
        with self.assertRaises(Exception):
            review.full_clean()


class ReviewAPITests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpass123')
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_list_reviews_without_asset_id(self):
        """Test that list_reviews requires asset_id parameter"""
        response = self.client.get('/reviews/list/')
        self.assertEqual(response.status_code, 400)
        self.assertIn('error', response.data)
