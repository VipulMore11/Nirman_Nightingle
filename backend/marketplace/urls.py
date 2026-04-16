from django.urls import path
from . import views

app_name = 'marketplace'

urlpatterns = [
    # Asset Management
    path('assets/create/', views.create_asset, name='create_asset'),
    
    # Token Purchase
    path('tokens/purchase/', views.purchase_tokens, name='purchase_tokens'),
    
    # Dividend Management
    path('dividends/distribute/', views.distribute_dividend, name='distribute_dividend'),
    path('assets/<int:asset_id>/dividend-history/', views.asset_dividend_history, name='asset_dividend_history'),
    
    # Dashboard APIs
    path('owner/dashboard/<int:asset_id>/', views.owner_dashboard, name='owner_dashboard'),
    path('user/dashboard/<int:asset_id>/', views.user_dashboard, name='user_dashboard'),
    path('user/portfolio/', views.user_portfolio, name='user_portfolio'),
]
