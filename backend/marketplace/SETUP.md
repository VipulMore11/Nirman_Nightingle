# Marketplace App - Setup and Integration Guide

## Overview
This is a Django app for a tokenized asset marketplace with a comprehensive dividend distribution system. It allows asset owners to tokenize their assets and distribute profits to token holders.

## Installation Steps

### 1. Register the App
Add `marketplace` to `INSTALLED_APPS` in `backend/settings.py`:

```python
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'Authentication',
    'reviews',
    'marketplace',  # Add this line
]
```

### 2. Include App URLs
Add the marketplace URLs to `backend/urls.py`:

```python
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/marketplace/', include('marketplace.urls')),  # Add this line
    # ... other URLs
]
```

### 3. Create Database Migrations

Run these commands in your terminal:

```bash
python manage.py makemigrations marketplace
python manage.py migrate marketplace
```

### 4. Verify Installation
Check that the app is properly registered:

```bash
python manage.py check
```

## Models

### Asset
Represents a tokenized asset in the marketplace.
- `name`: Asset name
- `asset_id`: Unique identifier for the asset
- `total_tokens`: Total number of tokens for this asset
- `tokenized_percentage`: Percentage of the asset that is tokenized (0-100)
- `owner`: User who owns the asset (ForeignKey to User)

### Ownership
Tracks user ownership of asset tokens.
- `user`: User who owns the tokens (ForeignKey to User)
- `asset`: Asset the tokens belong to (ForeignKey to Asset)
- `tokens_owned`: Number of tokens owned
- `buy_price`: Price at which tokens were purchased

### Dividend
Records dividend distributions for an asset.
- `asset`: Asset for which dividend is distributed (ForeignKey to Asset)
- `total_profit`: Total profit amount
- `distributed_profit`: Amount distributed to token holders (based on tokenized_percentage)
- `profit_per_token`: Calculated profit per token
- `created_at`: Timestamp of distribution

## API Endpoints

### Asset Management

#### Create Asset (POST)
```
POST /api/marketplace/assets/create/
Authentication: Required

Request Body:
{
    "name": "Apple Inc.",
    "asset_id": 1001,
    "total_tokens": 1000,
    "tokenized_percentage": 30
}

Response:
{
    "id": 1,
    "name": "Apple Inc.",
    "asset_id": 1001,
    "total_tokens": 1000,
    "tokenized_percentage": 30,
    "owner": 1,
    "owner_username": "john_doe",
    "created_at": "2026-04-16T10:00:00Z",
    "updated_at": "2026-04-16T10:00:00Z"
}
```

### Token Management

#### Purchase Tokens (POST)
```
POST /api/marketplace/tokens/purchase/
Authentication: Required

Request Body:
{
    "asset_id": 1001,
    "tokens_owned": 100,
    "buy_price": 50.0
}

Response:
{
    "id": 1,
    "user": 2,
    "user_username": "jane_doe",
    "asset": 1,
    "asset_name": "Apple Inc.",
    "tokens_owned": 100,
    "buy_price": 50.0,
    "created_at": "2026-04-16T10:00:00Z",
    "updated_at": "2026-04-16T10:00:00Z"
}
```

### Dividend Management

#### Distribute Dividend (POST)
```
POST /api/marketplace/dividends/distribute/
Authentication: Required (Owner only)

Request Body:
{
    "asset_id": 1001,
    "total_profit": 10000.0
}

Response:
{
    "dividend_id": 1,
    "asset_id": 1001,
    "asset_name": "Apple Inc.",
    "total_profit": 10000.0,
    "distributable_profit": 3000.0,
    "profit_per_token": 3.0,
    "owner_keeps": 7000.0,
    "total_users_compensated": 5,
    "distribution_details": [
        {
            "user_id": 2,
            "username": "jane_doe",
            "tokens_owned": 100,
            "profit_earned": 300.0
        },
        {
            "user_id": 3,
            "username": "jack_smith",
            "tokens_owned": 150,
            "profit_earned": 450.0
        },
        ...
    ]
}
```

#### Get Asset Dividend History (GET)
```
GET /api/marketplace/assets/{asset_id}/dividend-history/
Authentication: Required

Response:
{
    "asset_id": 1001,
    "asset_name": "Apple Inc.",
    "total_distributions": 2,
    "distributions": [
        {
            "id": 1,
            "asset": 1,
            "asset_name": "Apple Inc.",
            "total_profit": 10000.0,
            "distributed_profit": 3000.0,
            "profit_per_token": 3.0,
            "created_at": "2026-04-16T10:00:00Z"
        },
        ...
    ]
}
```

### Dashboard APIs

#### Owner Dashboard (GET)
```
GET /api/marketplace/owner/dashboard/{asset_id}/
Authentication: Required (Owner only)

Response:
{
    "asset_id": 1001,
    "asset_name": "Apple Inc.",
    "total_tokens": 1000,
    "tokenized_percentage": 30,
    "total_users": 5,
    "total_profit": 10000.0,
    "distributed_profit": 3000.0,
    "remaining_profit": 7000.0,
    "ownership_list": [
        {
            "id": 1,
            "user": 2,
            "user_username": "jane_doe",
            "asset": 1,
            "asset_name": "Apple Inc.",
            "tokens_owned": 100,
            "buy_price": 50.0,
            "created_at": "2026-04-16T10:00:00Z",
            "updated_at": "2026-04-16T10:00:00Z"
        },
        ...
    ]
}
```

#### User Dashboard (GET)
```
GET /api/marketplace/user/dashboard/{asset_id}/
Authentication: Required

Response:
{
    "asset_id": 1001,
    "asset_name": "Apple Inc.",
    "tokens_owned": 100,
    "buy_price": 50.0,
    "profit_per_token": 3.0,
    "total_profit_earned": 300.0,
    "percentage_ownership": 10.0
}
```

#### User Portfolio (GET)
```
GET /api/marketplace/user/portfolio/
Authentication: Required

Response:
{
    "total_assets": 2,
    "total_portfolio_value": 5000.0,
    "portfolio": [
        {
            "asset_id": 1001,
            "asset_name": "Apple Inc.",
            "tokens_owned": 100,
            "buy_price": 50.0,
            "token_value": 5000.0,
            "profit_per_token": 3.0,
            "total_profit_earned": 300.0,
            "percentage_ownership": 10.0
        },
        ...
    ]
}
```

## Business Logic

### Dividend Distribution Calculation

When an owner distributes dividends for an asset:

1. **Distributable Profit**: Only a percentage of total profit is distributed
   ```
   distributable_profit = total_profit * (tokenized_percentage / 100)
   ```

2. **Profit Per Token**: Calculated as
   ```
   profit_per_token = distributable_profit / total_tokens
   ```

3. **User Profit**: Each token holder receives
   ```
   user_profit = tokens_owned * profit_per_token
   ```

4. **Owner Keeps**: The owner retains
   ```
   owner_keeps = total_profit - distributable_profit
   ```

### Example
- Asset: "Apple Inc."
- Total Tokens: 1000
- Tokenized Percentage: 30%
- Total Profit: $10,000

Calculation:
- Distributable Profit: $10,000 × 0.30 = $3,000
- Profit Per Token: $3,000 ÷ 1000 = $3.00 per token
- Owner Keeps: $10,000 - $3,000 = $7,000

If a user owns 100 tokens:
- User Profit: 100 × $3.00 = $300.00

## Error Handling

All endpoints return appropriate HTTP status codes:

- `200 OK`: Successful GET request
- `201 CREATED`: Successful POST request creating a resource
- `400 BAD REQUEST`: Invalid input data or validation error
- `401 UNAUTHORIZED`: User not authenticated
- `403 FORBIDDEN`: User doesn't have permission (e.g., not asset owner)
- `404 NOT FOUND`: Asset or resource not found

Error response format:
```json
{
    "error": "Error message",
    "details": { }
}
```

## Validation Rules

1. **Total Tokens**: Must be greater than 0
2. **Tokenized Percentage**: Must be between 0 and 100
3. **Tokens Owned**: Must be greater than 0
4. **Buy Price**: Cannot be negative
5. **Total Profit**: Cannot be negative
6. **Asset ID**: Must be unique
7. **User-Asset Ownership**: Only one ownership record per user-asset combination

## Testing

Run tests with:

```bash
python manage.py test marketplace
```

The app includes comprehensive test cases for:
- Model creation and validation
- Dividend distribution calculations
- API endpoint authentication and authorization
- Permission checking

## Admin Interface

Access the Django admin at `/admin/`:

1. **Assets**: View, create, and manage tokenized assets
2. **Ownerships**: Track user token ownership
3. **Dividends**: View dividend distribution history

## Dependencies

- Django 3.2+
- Django REST Framework
- Python 3.8+

## Security Considerations

1. All endpoints require authentication (except public endpoints if any)
2. Only asset owners can distribute dividends
3. Only users can view their own portfolio
4. Only owners can access their asset dashboard
5. All financial calculations are protected against division by zero

## Future Enhancements

1. Add transaction history tracking
2. Implement dividend scheduling
3. Add asset performance metrics
4. Implement tax reporting features
5. Add notifications for dividend distributions
6. Implement secondary market trading
7. Add automated dividend calculations based on scheduled intervals
