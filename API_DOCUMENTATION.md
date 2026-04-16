# Asset Upload & Document Management API Documentation

## Overview
The backend now supports comprehensive asset creation and management with multi-file uploads for property images, legal documents, and certificates. All files are stored on Cloudinary and referenced as JSON objects in the database.

---

## API Endpoints

### 1. POST `/api/create_asset_with_documents/`
Creates a new asset with property images, legal documents, and certificates.

**Authentication:** Required (Bearer Token)

**Content-Type:** `multipart/form-data`

**Request Body:**

```json
{
  "title": "Historic Heritage Property",
  "description": "Beautiful 200-year-old mansion with cultural significance",
  "total_supply": 1000,
  "unit_price": 5000.00,
  "creator_wallet": "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  "metadata_json": "{\"location\": \"Delhi\", \"type\": \"heritage\", \"year_built\": 1824}",
  
  // File uploads (optional)
  "property_image_files": [file1, file2, file3],
  "property_image_names": ["front_view", "side_view", "interior"],
  
  "legal_document_files": [file4, file5],
  "legal_document_names": ["ownership_deed", "property_survey"],
  
  "certificate_files": [file6],
  "certificate_names": ["UNESCO_heritage_certificate"]
}
```

**Field Descriptions:**
- `title` (string, required): Asset title
- `description` (string, required): Asset description
- `total_supply` (number, required): Total fractional units (> 0)
- `unit_price` (number, required): Price per unit (> 0)
- `creator_wallet` (string, required): Algorand wallet address
- `metadata_json` (string, optional): Additional metadata as JSON string

**File Upload Fields:**
- `property_image_files` (list of files, optional): Property photos
- `property_image_names` (array of strings, required if files provided): Names for each image
- `legal_document_files` (list of files, optional): Legal documents
- `legal_document_names` (array of strings, required if files provided): Names for each document
- `certificate_files` (list of files, optional): Certificate files
- `certificate_names` (array of strings, required if files provided): Names for each certificate

**File Constraints:**
- Max file size: 5MB per file
- Allowed formats: jpg, jpeg, png

**Response (201 Created):**
```json
{
  "id": 42,
  "title": "Historic Heritage Property",
  "description": "Beautiful 200-year-old mansion...",
  "creator_wallet": "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  "total_supply": "1000.00",
  "unit_price": "5000.0000",
  "property_images": [
    {
      "name": "front_view",
      "url": "https://res.cloudinary.com/.../front_view.jpg",
      "file_type": "jpg"
    },
    {
      "name": "side_view",
      "url": "https://res.cloudinary.com/.../side_view.jpg",
      "file_type": "jpg"
    },
    {
      "name": "interior",
      "url": "https://res.cloudinary.com/.../interior.jpg",
      "file_type": "jpg"
    }
  ],
  "legal_documents": {
    "ownership_deed": "https://res.cloudinary.com/.../deed.pdf",
    "property_survey": "https://res.cloudinary.com/.../survey.pdf"
  },
  "certificates": [
    {
      "name": "UNESCO_heritage_certificate",
      "url": "https://res.cloudinary.com/.../certificate.pdf",
      "file_type": "pdf"
    }
  ],
  "listing_status": "inactive",
  "is_verified": false,
  "created_at": "2026-04-16T18:00:00Z"
}
```

**Error Response (400 Bad Request):**
```json
{
  "title": ["This field is required."],
  "property_image_names": ["Number of property image names must match number of files"]
}
```

---

### 2. PATCH `/api/update_asset_documents/<asset_id>/`
Update an existing asset by adding new documents and images. **Files are appended** to existing collections, not replaced.

**Authentication:** Required (Bearer Token)

**Content-Type:** `multipart/form-data`

**Request Body (Same as create, but all fields optional):**
```json
{
  "title": "Updated Title",  // optional - update existing field
  "description": "Updated description",  // optional
  
  // Add new files (appended to existing)
  "property_image_files": [new_file1, new_file2],
  "property_image_names": ["back_view", "garden"],
  
  "legal_document_files": [new_legal_doc],
  "legal_document_names": ["insurance_policy"],
  
  "certificate_files": [new_cert],
  "certificate_names": ["award_2024"]
}
```

**Response (200 OK):**
```json
{
  "id": 42,
  "title": "Updated Title",
  "property_images": [
    // Original 3 images...
    {
      "name": "front_view",
      "url": "https://res.cloudinary.com/.../front_view.jpg",
      "file_type": "jpg"
    },
    // ... plus 2 new appended images
    {
      "name": "back_view",
      "url": "https://res.cloudinary.com/.../back_view.jpg",
      "file_type": "jpg"
    },
    {
      "name": "garden",
      "url": "https://res.cloudinary.com/.../garden.jpg",
      "file_type": "jpg"
    }
  ],
  "legal_documents": {
    // Original documents...
    "ownership_deed": "https://res.cloudinary.com/.../deed.pdf",
    "property_survey": "https://res.cloudinary.com/.../survey.pdf",
    // Plus new document (merged)
    "insurance_policy": "https://res.cloudinary.com/.../insurance.pdf"
  },
  "certificates": [
    // Original + new appended
    {
      "name": "UNESCO_heritage_certificate",
      "url": "https://res.cloudinary.com/.../certificate.pdf",
      "file_type": "pdf"
    },
    {
      "name": "award_2024",
      "url": "https://res.cloudinary.com/.../award.pdf",
      "file_type": "pdf"
    }
  ],
  "is_verified": false,  // Re-set to false for re-verification
  "updated_at": "2026-04-16T18:15:00Z"
}
```

**Important Notes:**
- When document files are updated, `is_verified` is automatically set to `false` (requires admin re-verification)
- File names for legal documents must be unique (they serve as keys in the object)
- Adding duplicate property image or certificate names will overwrite the existing one

---

## Data Models

### Asset Response Structure

**Listing View** (GET `/marketplace/assets/`):
```json
{
  "id": 42,
  "asa_id": null,
  "title": "Heritage Property",
  "description": "Beautiful mansion...",
  "thumbnail_url": "https://res.cloudinary.com/.../front_view.jpg",
  "total_supply": "1000.00",
  "available_supply": "1000.00",
  "unit_price": "5000.0000",
  "listing_status": "active",
  "is_verified": true,
  "owner_email": "owner@example.com",
  "created_at": "2026-04-16T15:05:38.351360Z",
  "listed_at": "2026-04-16T15:05:33Z"
}
```

**Detail View** (GET `/marketplace/assets/{id}/`):
```json
{
  "id": 42,
  "owner": 2,
  "owner_email": "owner@example.com",
  "asa_id": null,
  "title": "Heritage Property",
  "description": "Beautiful mansion...",
  "property_images": [
    {
      "name": "front_view",
      "url": "https://res.cloudinary.com/.../front_view.jpg",
      "file_type": "jpg"
    }
  ],
  "total_supply": "1000.00",
  "available_supply": "1000.00",
  "unit_price": "5000.0000",
  "legal_documents": {
    "ownership_deed": "https://res.cloudinary.com/.../deed.pdf"
  },
  "certificates": [
    {
      "name": "UNESCO_heritage",
      "url": "https://res.cloudinary.com/.../cert.pdf",
      "file_type": "pdf"
    }
  ],
  "metadata_json": "{\"location\": \"Delhi\"}",
  "listing_status": "active",
  "is_verified": true,
  "total_holders": 15,
  "total_value": 5000000.0,
  "created_at": "2026-04-16T15:05:38.351360Z",
  "updated_at": "2026-04-16T17:43:04.671924Z",
  "listed_at": "2026-04-16T15:05:33Z",
  "delisted_at": null
}
```

---

## Frontend Integration Example

### Creating an Asset with Files

```javascript
const createAsset = async (formData) => {
  const response = await fetch('/api/create_asset_with_documents/', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      // Note: DO NOT set Content-Type header - browser will set it with boundary
    },
    body: formData,
  });

  if (!response.ok) {
    const errors = await response.json();
    throw new Error(JSON.stringify(errors));
  }

  return await response.json();
};

// Usage:
const formData = new FormData();
formData.append('title', 'My Property');
formData.append('description', 'Beautiful property');
formData.append('total_supply', '1000');
formData.append('unit_price', '5000');
formData.append('creator_wallet', 'XXXXX...');

// Add property images
const imageFiles = document.getElementById('images').files;
formData.append('property_image_files', imageFiles[0]);
formData.append('property_image_files', imageFiles[1]);
formData.append('property_image_names', JSON.stringify(['front', 'side']));

// Add documents
const docFiles = document.getElementById('documents').files;
formData.append('legal_document_files', docFiles[0]);
formData.append('legal_document_names', JSON.stringify(['deed']));

const asset = await createAsset(formData);
console.log('Asset created:', asset);
```

### Updating Asset Documents

```javascript
const updateAsset = async (assetId, formData) => {
  const response = await fetch(`/api/update_asset_documents/${assetId}/`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${authToken}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errors = await response.json();
    throw new Error(JSON.stringify(errors));
  }

  return await response.json();
};

// Usage - Add more images:
const formData = new FormData();
formData.append('property_image_files', newImageFile);
formData.append('property_image_names', JSON.stringify(['garden']));

const updated = await updateAsset(42, formData);
console.log('Asset updated with new images');
```

---

## Error Handling

### Common Error Codes

| Status | Error | Cause |
|--------|-------|-------|
| 400 | `title: "This field is required."` | Missing required field |
| 400 | `unit_price: "Unit price must be greater than 0"` | Invalid unit price |
| 400 | `property_image_names: "Number of names must match files"` | Mismatched file/name counts |
| 400 | `File size exceeds maximum` | File > 5MB |
| 400 | `File format not allowed` | Unsupported file type |
| 401 | `Unauthorized` | Missing/invalid auth token |
| 404 | `Not found or no permission` | Asset doesn't exist or wrong owner |
| 500 | `File upload failed` | Cloudinary upload error |

---

## Best Practices

1. **File Naming**: Use descriptive, URL-safe names (no special characters)
2. **File Sizes**: Keep images under 1-2MB for optimal performance
3. **Unique Document Names**: For legal_documents, ensure names are unique per asset
4. **Error Handling**: Always handle validation errors from the API
5. **Asset Verification**: After updating documents, notify admin for re-verification
6. **Cloudinary URLs**: Store returned URLs in your database or cache; they're permanent

---

## Migration Notes

- Old `photo` field has been migrated to `property_images[0]`
- Existing assets will have a single image entry if they had a photo
- Empty assets will have empty arrays/objects
- All operations are backwards compatible with existing marketplace functionality
