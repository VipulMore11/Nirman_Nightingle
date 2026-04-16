"""
Cloudinary service for handling KYC document uploads.
Manages uploading documents to Cloudinary and returning secure URLs.
"""
import cloudinary.uploader
from django.conf import settings
from django.core.exceptions import ValidationError


def validate_file(file_obj):
    """
    Validate file before upload.
    
    Args:
        file_obj: Django UploadedFile object
        
    Returns:
        bool: True if valid
        
    Raises:
        ValidationError: If file is invalid
    """
    if not file_obj:
        raise ValidationError("No file provided")
    
    # Check file size
    max_size = settings.KYC_FILE_UPLOAD_SETTINGS['max_file_size']
    if file_obj.size > max_size:
        raise ValidationError(
            f"File size exceeds maximum allowed size of {max_size / (1024*1024):.1f}MB"
        )
    
    # Check file extension
    allowed_formats = settings.KYC_FILE_UPLOAD_SETTINGS['allowed_formats']
    file_ext = file_obj.name.split('.')[-1].lower()
    if file_ext not in allowed_formats:
        raise ValidationError(
            f"File format '{file_ext}' not allowed. Allowed formats: {', '.join(allowed_formats)}"
        )
    
    return True


def upload_to_cloudinary(file_obj, document_type):
    """
    Upload a file to Cloudinary and return the secure URL.
    
    Args:
        file_obj: Django UploadedFile object
        document_type: str - Type of document (e.g., 'aadhaar_card', 'pan_card', 'passport', 'selfie')
        
    Returns:
        str: Cloudinary URL of the uploaded file
        
    Raises:
        ValidationError: If file validation fails
        Exception: If Cloudinary upload fails
    """
    try:
        # Validate the file
        validate_file(file_obj)
        
        # Prepare upload options
        folder_prefix = settings.KYC_FILE_UPLOAD_SETTINGS['folder_prefix']
        
        upload_options = {
            'folder': f'{folder_prefix}',
            'resource_type': 'auto',
            'public_id': f'{document_type}_{file_obj.name.split(".")[0]}',
            'overwrite': True,
            'quality': 'auto',
            'fetch_format': 'auto',
        }
        
        # Upload to Cloudinary
        result = cloudinary.uploader.upload(
            file_obj,
            **upload_options
        )
        
        # Return the secure URL
        return result['secure_url']
    
    except ValidationError:
        raise
    except cloudinary.exceptions.Error as e:
        raise Exception(f"Cloudinary upload failed: {str(e)}")
    except Exception as e:
        raise Exception(f"Error uploading file: {str(e)}")


def upload_kyc_documents(kyc_obj, aadhaar_file=None, pan_file=None, 
                         passport_file=None, selfie_file=None):
    """
    Upload multiple KYC documents to Cloudinary.
    
    Args:
        kyc_obj: KYC model instance
        aadhaar_file: Optional UploadedFile for Aadhaar card
        pan_file: Optional UploadedFile for PAN card
        passport_file: Optional UploadedFile for Passport
        selfie_file: Optional UploadedFile for Selfie
        
    Returns:
        dict: Mapping of document types to Cloudinary URLs
        
    Raises:
        ValidationError: If at least one ID document and a selfie are not provided
    """
    uploaded_urls = {}
    errors = []
    
    # Validate that at least one ID and a selfie are provided
    has_id_document = any([aadhaar_file, pan_file, passport_file])
    has_selfie = selfie_file is not None
    
    if not has_id_document or not has_selfie:
        raise ValidationError(
            "At least one identity document (Aadhaar, PAN, or Passport) and a selfie are required."
        )
    
    # Upload Aadhaar card
    if aadhaar_file:
        try:
            url = upload_to_cloudinary(aadhaar_file, 'aadhaar_card')
            uploaded_urls['aadhaar_card_url'] = url
        except (ValidationError, Exception) as e:
            errors.append(f"Aadhaar card upload failed: {str(e)}")
    
    # Upload PAN card
    if pan_file:
        try:
            url = upload_to_cloudinary(pan_file, 'pan_card')
            uploaded_urls['pan_card_url'] = url
        except (ValidationError, Exception) as e:
            errors.append(f"PAN card upload failed: {str(e)}")
    
    # Upload Passport
    if passport_file:
        try:
            url = upload_to_cloudinary(passport_file, 'passport')
            uploaded_urls['passport_url'] = url
        except (ValidationError, Exception) as e:
            errors.append(f"Passport upload failed: {str(e)}")
    
    # Upload Selfie (required)
    if selfie_file:
        try:
            url = upload_to_cloudinary(selfie_file, 'selfie')
            uploaded_urls['selfie_url'] = url
        except (ValidationError, Exception) as e:
            errors.append(f"Selfie upload failed: {str(e)}")
    
    # If any errors occurred, raise exception with all error details
    if errors:
        raise Exception(f"Document upload errors: {'; '.join(errors)}")
    
    return uploaded_urls
