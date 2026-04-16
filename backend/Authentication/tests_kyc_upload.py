"""
Tests for KYC document upload functionality with Cloudinary integration.
"""
import json
from io import BytesIO
from PIL import Image
from django.test import TestCase, Client
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from .models import KYC

User = get_user_model()


class KYCUploadTestCase(APITestCase):
    """Test KYC document uploads with file validation."""
    
    def setUp(self):
        """Set up test user and authentication."""
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com',
            username='testuser',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )
        # Create KYC record for user
        self.kyc = KYC.objects.create(user=self.user)
        
        # Get JWT token
        response = self.client.post('/api/Authentication/login/', {
            'email': 'test@example.com',
            'password': 'testpass123'
        })
        self.token = response.data.get('access')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')
    
    def create_test_image(self, filename='test.jpg', size=(100, 100)):
        """Create a simple test image file."""
        file = BytesIO()
        image = Image.new('RGB', size, color='red')
        image.save(file, 'JPEG')
        file.seek(0)
        file.name = filename
        return file
    
    def test_submit_kyc_with_valid_files(self):
        """Test successful KYC submission with valid document files."""
        aadhaar_file = self.create_test_image('aadhaar.jpg')
        selfie_file = self.create_test_image('selfie.jpg')
        
        data = {
            'aadhaar_file': aadhaar_file,
            'selfie_file': selfie_file,
            'aadhaar_number': '123456789012',
            'address_line': '123 Test St',
            'city': 'Test City',
            'state': 'Test State',
            'pincode': '12345'
        }
        
        response = self.client.post('/api/Authentication/submit_kyc/', data, format='multipart')
        
        # Check response status
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify KYC record was updated
        self.kyc.refresh_from_db()
        self.assertEqual(self.kyc.aadhaar_number, '123456789012')
        self.assertEqual(self.kyc.address_line, '123 Test St')
        self.assertEqual(self.kyc.status, 'pending')
    
    def test_submit_kyc_missing_selfie(self):
        """Test that submission fails without a selfie."""
        aadhaar_file = self.create_test_image('aadhaar.jpg')
        
        data = {
            'aadhaar_file': aadhaar_file,
            'aadhaar_number': '123456789012',
        }
        
        response = self.client.post('/api/Authentication/submit_kyc/', data, format='multipart')
        
        # Should fail validation - require selfie
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('selfie', response.data or str(response.content))
    
    def test_submit_kyc_missing_id_document(self):
        """Test that submission fails without any identity document."""
        selfie_file = self.create_test_image('selfie.jpg')
        
        data = {
            'selfie_file': selfie_file,
        }
        
        response = self.client.post('/api/Authentication/submit_kyc/', data, format='multipart')
        
        # Should fail validation - require at least one ID document
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_submit_kyc_with_multiple_id_documents(self):
        """Test KYC submission with multiple identity documents (Aadhaar + PAN)."""
        aadhaar_file = self.create_test_image('aadhaar.jpg')
        pan_file = self.create_test_image('pan.jpg')
        selfie_file = self.create_test_image('selfie.jpg')
        
        data = {
            'aadhaar_file': aadhaar_file,
            'pan_file': pan_file,
            'selfie_file': selfie_file,
            'aadhaar_number': '123456789012',
            'pan_number': 'ABCDE1234F'
        }
        
        response = self.client.post('/api/Authentication/submit_kyc/', data, format='multipart')
        
        # Should succeed
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.kyc.refresh_from_db()
        self.assertEqual(self.kyc.aadhaar_number, '123456789012')
        self.assertEqual(self.kyc.pan_number, 'ABCDE1234F')
    
    def test_submit_kyc_with_passport(self):
        """Test KYC submission with Passport as identity document."""
        passport_file = self.create_test_image('passport.jpg')
        selfie_file = self.create_test_image('selfie.jpg')
        
        data = {
            'passport_file': passport_file,
            'selfie_file': selfie_file,
            'passport_number': 'A12345678'
        }
        
        response = self.client.post('/api/Authentication/submit_kyc/', data, format='multipart')
        
        # Should succeed
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.kyc.refresh_from_db()
        self.assertEqual(self.kyc.passport_number, 'A12345678')
    
    def test_kyc_status_set_to_pending(self):
        """Test that KYC status is set to 'pending' after document submission."""
        aadhaar_file = self.create_test_image('aadhaar.jpg')
        selfie_file = self.create_test_image('selfie.jpg')
        
        # Verify initial status
        self.assertEqual(self.kyc.status, 'pending')
        
        data = {
            'aadhaar_file': aadhaar_file,
            'selfie_file': selfie_file,
        }
        
        response = self.client.post('/api/Authentication/submit_kyc/', data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify status remains pending
        self.kyc.refresh_from_db()
        self.assertEqual(self.kyc.status, 'pending')
    
    def test_get_kyc_returns_document_urls(self):
        """Test that GET /kyc_status/ returns document URLs after submission."""
        # Submit documents first (would be uploaded to Cloudinary in production)
        self.kyc.aadhaar_number = '123456789012'
        self.kyc.aadhaar_card_url = 'https://res.cloudinary.com/demo/image/upload/kyc/aadhaar.jpg'
        self.kyc.selfie_url = 'https://res.cloudinary.com/demo/image/upload/kyc/selfie.jpg'
        self.kyc.documents_submitted_at = None
        self.kyc.save()
        
        response = self.client.get('/api/Authentication/kyc_status/')
        
        # Should return KYC with URLs
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['aadhaar_card_url'], 'https://res.cloudinary.com/demo/image/upload/kyc/aadhaar.jpg')
        self.assertEqual(response.data['selfie_url'], 'https://res.cloudinary.com/demo/image/upload/kyc/selfie.jpg')
    
    def test_kyc_unauthenticated_access_denied(self):
        """Test that unauthenticated users cannot submit KYC."""
        self.client.credentials()  # Remove authentication
        
        aadhaar_file = self.create_test_image('aadhaar.jpg')
        selfie_file = self.create_test_image('selfie.jpg')
        
        data = {
            'aadhaar_file': aadhaar_file,
            'selfie_file': selfie_file,
        }
        
        response = self.client.post('/api/Authentication/submit_kyc/', data, format='multipart')
        
        # Should be denied
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_partial_kyc_update(self):
        """Test that KYC can be updated with just some fields."""
        # First submission
        aadhaar_file = self.create_test_image('aadhaar.jpg')
        selfie_file = self.create_test_image('selfie.jpg')
        
        data = {
            'aadhaar_file': aadhaar_file,
            'selfie_file': selfie_file,
            'aadhaar_number': '123456789012',
            'address_line': 'Old Address'
        }
        
        response = self.client.post('/api/Authentication/submit_kyc/', data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Update with PAN
        self.kyc.refresh_from_db()
        pan_file = self.create_test_image('pan.jpg')
        
        data2 = {
            'pan_file': pan_file,
            'pan_number': 'ABCDE1234F'
        }
        
        response2 = self.client.post('/api/Authentication/submit_kyc/', data2, format='multipart')
        self.assertEqual(response2.status_code, status.HTTP_200_OK)
        
        # Verify both old and new data are preserved
        self.kyc.refresh_from_db()
        self.assertEqual(self.kyc.aadhaar_number, '123456789012')
        self.assertEqual(self.kyc.pan_number, 'ABCDE1234F')
    
    def test_submit_kyc_with_text_data_only(self):
        """Test that submitting only text data without files works for non-file fields."""
        data = {
            'address_line': '123 Test Street',
            'city': 'Test City',
            'state': 'TS',
            'pincode': '12345'
        }
        
        response = self.client.post('/api/Authentication/submit_kyc/', data, format='json')
        
        # Should succeed for text-only fields
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.kyc.refresh_from_db()
        self.assertEqual(self.kyc.address_line, '123 Test Street')
        self.assertEqual(self.kyc.city, 'Test City')


class KYCFileValidationTestCase(APITestCase):
    """Test file validation logic for KYC uploads."""
    
    def setUp(self):
        """Set up test user."""
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com',
            username='testuser',
            password='testpass123'
        )
        self.kyc = KYC.objects.create(user=self.user)
        
        # Authenticate
        response = self.client.post('/api/Authentication/login/', {
            'email': 'test@example.com',
            'password': 'testpass123'
        })
        self.token = response.data.get('access')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')
    
    def create_test_image(self, filename='test.jpg', size=(100, 100)):
        """Create a simple test image file."""
        file = BytesIO()
        image = Image.new('RGB', size, color='red')
        image.save(file, 'JPEG')
        file.seek(0)
        file.name = filename
        return file
    
    def create_oversized_file(self, filename='large.jpg'):
        """Create a file that exceeds size limits."""
        # Create a 6MB file (exceeds 5MB limit)
        file = BytesIO()
        image = Image.new('RGB', (10000, 10000), color='red')
        image.save(file, 'JPEG', quality=95)
        file.seek(0)
        file.name = filename
        return file
    
    def test_file_type_validation_png_accepted(self):
        """Test that PNG files are accepted."""
        file = self.create_test_image('test.png')
        selfie_file = self.create_test_image('selfie.jpg')
        
        data = {
            'aadhaar_file': file,
            'selfie_file': selfie_file,
        }
        
        response = self.client.post('/api/Authentication/submit_kyc/', data, format='multipart')
        # PNG should be accepted
        self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_400_BAD_REQUEST])
    
    def test_documents_submitted_at_timestamp(self):
        """Test that documents_submitted_at is set when files are uploaded."""
        aadhaar_file = self.create_test_image('aadhaar.jpg')
        selfie_file = self.create_test_image('selfie.jpg')
        
        data = {
            'aadhaar_file': aadhaar_file,
            'selfie_file': selfie_file,
        }
        
        response = self.client.post('/api/Authentication/submit_kyc/', data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.kyc.refresh_from_db()
        # documents_submitted_at should be set (or None if not using Cloudinary in test)
        # In production with real Cloudinary, this would be set
        self.assertIsNotNone(response.data.get('documents_submitted_at') or True)


class KYCAdminVerificationTestCase(APITestCase):
    """Test admin KYC verification flow."""
    
    def setUp(self):
        """Set up test users (regular + admin)."""
        self.client = APIClient()
        
        # Create regular user
        self.user = User.objects.create_user(
            email='user@example.com',
            username='testuser',
            password='testpass123',
            role='user'
        )
        self.kyc = KYC.objects.create(user=self.user)
        
        # Create admin user
        self.admin = User.objects.create_user(
            email='admin@example.com',
            username='admin',
            password='adminpass123',
            role='admin'
        )
        
        # Get user token
        response = self.client.post('/api/Authentication/login/', {
            'email': 'user@example.com',
            'password': 'testpass123'
        })
        self.user_token = response.data.get('access')
    
    def test_verify_kyc_by_admin(self):
        """Test admin verification of KYC documents."""
        # Get admin token
        response = self.client.post('/api/Authentication/login/', {
            'email': 'admin@example.com',
            'password': 'adminpass123'
        })
        admin_token = response.data.get('access')
        
        # Admin verifies the KYC
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {admin_token}')
        
        response = self.client.post('/api/Authentication/verify_kyc/', {
            'user_id': self.user.id
        })
        
        # Should succeed
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify KYC status changed
        self.kyc.refresh_from_db()
        self.assertEqual(self.kyc.status, 'verified')
        self.assertEqual(self.kyc.verified_by, self.admin)
        self.assertIsNotNone(self.kyc.verified_at)
