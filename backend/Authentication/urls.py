from django.urls import path
from django.views.generic import TemplateView
from . import views
from . import blockchain_views
from . import seller_views

app_name = 'Authentication'

urlpatterns = [
    # path('', TemplateView.as_view(template_name='index.html'), name='index'),
    path('signup/',views.signup_view,name='signup'),
    path('login/',views.login_view,name='login'),
    path('profile/',views.get_profile,name='get_profile'),
    path('update_profile/',views.update_profile,name='update_profile'),
    path('logout/',views.logout_view,name='logout'),
    path('verify_kyc/', views.verify_kyc, name='verify_kyc'),
    path('submit_kyc/', views.submit_kyc, name='submit_kyc'),
    path('kyc_status/', views.get_kyc, name='kyc_status'),
    

    path('create_asset/', blockchain_views.create_asset, name='create_asset'),
    path('create_asset_with_documents/', blockchain_views.create_asset_with_documents, name='create_asset_with_documents'),
    path('update_asset_documents/<int:asset_id>/', blockchain_views.update_asset_documents, name='update_asset_documents'),
    path('opt_in/', blockchain_views.opt_in, name='opt_in'),
    path('buy_asset/', blockchain_views.buy_asset, name='buy_asset'),

    path('marketplace/buy/', views.buy_asset, name='buy_asset'),
    path('marketplace/confirm-buy/', views.confirm_buy, name='confirm_buy'),
    path('marketplace/sell/', views.sell_asset, name='sell_asset'),
    path('marketplace/confirm-sell/', views.confirm_sell, name='confirm_sell'),
    path('marketplace/transactions/', views.transaction_history, name='transaction_history'),
    path('marketplace/assets/', views.get_assets, name='get_assets'),

    # Seller endpoints
    path('marketplace/my-assets/', seller_views.get_my_assets, name='my_assets'),
    path('marketplace/my-assets/<int:asset_id>/', seller_views.get_my_asset_detail, name='my_asset_detail'),

    # Admin endpoints
    path('admin/assets/pending/', seller_views.get_pending_assets, name='pending_assets'),
    path('admin/assets/<int:asset_id>/approve/', seller_views.approve_asset, name='approve_asset'),
    path('admin/assets/<int:asset_id>/reject/', seller_views.reject_asset, name='reject_asset'),
    path('admin/assets/<int:asset_id>/resubmit/', seller_views.resubmit_for_review, name='resubmit_asset'),
    
    # Blockchain endpoints
    path('submit_asa_transaction/', seller_views.submit_asa_transaction, name='submit_asa_transaction'),
    path('get_pending_signature/<int:asset_id>/', seller_views.get_pending_signature, name='get_pending_signature'),
]