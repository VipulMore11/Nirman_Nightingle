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


# ============================================================================
# ASSET DOCUMENT UPLOADS - New JSON-based multi-file handling
# ============================================================================

def upload_asset_property_images(asset_id, image_files):
    """
    Upload multiple property images for an asset.
    
    Args:
        asset_id: int - Asset ID for folder organization
        image_files: list of tuples (image_file, image_name) 
                     where image_file is UploadedFile and image_name is user-provided name
        
    Returns:
        list: Array of {name, url, file_type} objects
        Example: [
            {name: "front_view", url: "https://...", file_type: "jpg"},
            {name: "side_view", url: "https://...", file_type: "jpg"}
        ]
        
    Raises:
        ValidationError: If any file is invalid
        Exception: If upload fails
    """
    if not image_files:
        return []
    
    uploaded_images = []
    errors = []
    
    for image_file, image_name in image_files:
        try:
            # Validate the file
            validate_file(image_file)
            
            # Extract file extension
            file_ext = image_file.name.split('.')[-1].lower()
            
            # Prepare upload options with asset-specific folder
            upload_options = {
                'folder': f'assets/{asset_id}/property_images',
                'resource_type': 'auto',
                'public_id': f'{image_name}_{image_file.name.split(".")[0]}',
                'overwrite': True,
                'quality': 'auto',
                'fetch_format': 'auto',
            }
            
            # Upload to Cloudinary
            result = cloudinary.uploader.upload(
                image_file,
                **upload_options
            )
            
            uploaded_images.append({
                'name': image_name,
                'url': result['secure_url'],
                'file_type': file_ext
            })
            
        except (ValidationError, Exception) as e:
            errors.append(f"Image '{image_name}' upload failed: {str(e)}")
    
    if errors:
        raise Exception(f"Property images upload errors: {'; '.join(errors)}")
    
    return uploaded_images


def upload_asset_legal_documents(asset_id, document_files):
    """
    Upload legal documents for an asset.
    Maps document names to Cloudinary URLs as a JSON object.
    
    Args:
        asset_id: int - Asset ID for folder organization
        document_files: list of tuples (document_file, document_name)
                        where document_file is UploadedFile and document_name is user-provided name
        
    Returns:
        dict: Object mapping document names to URLs
        Example: {
            "ownership_deed": "https://...",
            "tax_certificate": "https://...",
            "property_survey": "https://..."
        }
        
    Raises:
        ValidationError: If any file is invalid
        Exception: If upload fails
    """
    if not document_files:
        return {}
    
    uploaded_docs = {}
    errors = []
    
    for doc_file, doc_name in document_files:
        try:
            # Validate the file
            validate_file(doc_file)
            
            # Prepare upload options with asset-specific folder
            upload_options = {
                'folder': f'assets/{asset_id}/legal_documents',
                'resource_type': 'auto',
                'public_id': f'{doc_name}_{doc_file.name.split(".")[0]}',
                'overwrite': True,
                'quality': 'auto',
                'fetch_format': 'auto',
            }
            
            # Upload to Cloudinary
            result = cloudinary.uploader.upload(
                doc_file,
                **upload_options
            )
            
            uploaded_docs[doc_name] = result['secure_url']
            
        except (ValidationError, Exception) as e:
            errors.append(f"Document '{doc_name}' upload failed: {str(e)}")
    
    if errors:
        raise Exception(f"Legal documents upload errors: {'; '.join(errors)}")
    
    return uploaded_docs


def upload_asset_certificates(asset_id, certificate_files):
    """
    Upload certificates for an asset.
    
    Args:
        asset_id: int - Asset ID for folder organization
        certificate_files: list of tuples (cert_file, cert_name)
                           where cert_file is UploadedFile and cert_name is user-provided name
        
    Returns:
        list: Array of {name, url, file_type} objects
        Example: [
            {name: "UNESCO_heritage", url: "https://...", file_type: "pdf"},
            {name: "award_2024", url: "https://...", file_type: "pdf"}
        ]
        
    Raises:
        ValidationError: If any file is invalid
        Exception: If upload fails
    """
    if not certificate_files:
        return []
    
    uploaded_certs = []
    errors = []
    
    for cert_file, cert_name in certificate_files:
        try:
            # Validate the file
            validate_file(cert_file)
            
            # Extract file extension
            file_ext = cert_file.name.split('.')[-1].lower()
            
            # Prepare upload options with asset-specific folder
            upload_options = {
                'folder': f'assets/{asset_id}/certificates',
                'resource_type': 'auto',
                'public_id': f'{cert_name}_{cert_file.name.split(".")[0]}',
                'overwrite': True,
                'quality': 'auto',
                'fetch_format': 'auto',
            }
            
            # Upload to Cloudinary
            result = cloudinary.uploader.upload(
                cert_file,
                **upload_options
            )
            
            uploaded_certs.append({
                'name': cert_name,
                'url': result['secure_url'],
                'file_type': file_ext
            })
            
        except (ValidationError, Exception) as e:
            errors.append(f"Certificate '{cert_name}' upload failed: {str(e)}")
    
    if errors:
        raise Exception(f"Certificates upload errors: {'; '.join(errors)}")
    
    return uploaded_certs
