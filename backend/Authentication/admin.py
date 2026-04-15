from django.contrib import admin
from .models import *

admin.site.register(User)


# ===== Tokenized Asset Marketplace Admin =====

@admin.register(Asset)
class AssetAdmin(admin.ModelAdmin):
    list_display = ('title', 'owner', 'asa_id', 'total_supply', 'available_supply', 'unit_price', 'listing_status', 'is_verified', 'created_at')
    list_filter = ('listing_status', 'is_verified', 'created_at')
    search_fields = ('title', 'description', 'owner__email', 'asa_id')
    readonly_fields = ('created_at', 'updated_at', 'asa_id')
    fieldsets = (
        ('Basic Information', {
            'fields': ('owner', 'title', 'description', 'photo')
        }),
        ('Asset Details', {
            'fields': ('asa_id', 'total_supply', 'available_supply', 'unit_price')
        }),
        ('Legal & Metadata', {
            'fields': ('legal_documents', 'metadata_json'),
            'classes': ('collapse',)
        }),
        ('Status', {
            'fields': ('listing_status', 'is_verified', 'listed_at', 'delisted_at')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(WalletHolding)
class WalletHoldingAdmin(admin.ModelAdmin):
    list_display = ('user', 'asset', 'quantity', 'opt_in_status', 'acquired_at')
    list_filter = ('opt_in_status', 'acquired_at')
    search_fields = ('user__email', 'asset__title', 'wallet_address')
    readonly_fields = ('acquired_at', 'updated_at')


@admin.register(Listing)
class ListingAdmin(admin.ModelAdmin):
    list_display = ('seller', 'asset', 'quantity_available', 'price_per_unit', 'total_price', 'listing_type', 'is_active', 'created_at')
    list_filter = ('listing_type', 'is_active', 'created_at')
    search_fields = ('seller__email', 'asset__title')
    readonly_fields = ('created_at', 'total_price')


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('buyer', 'seller', 'asset', 'quantity', 'total_amount', 'status', 'created_at')
    list_filter = ('status', 'created_at', 'buyer_opt_in_validated', 'buyer_balance_validated')
    search_fields = ('buyer__email', 'seller__email', 'asset__title', 'group_transaction_id')
    readonly_fields = ('created_at', 'confirmed_at', 'group_transaction_id', 'payment_txn_id', 'asset_transfer_txn_id')
    fieldsets = (
        ('Transaction Details', {
            'fields': ('buyer', 'seller', 'asset', 'listing', 'quantity', 'unit_price', 'total_amount')
        }),
        ('Algorand-specific', {
            'fields': ('group_transaction_id', 'payment_txn_id', 'asset_transfer_txn_id')
        }),
        ('Validation', {
            'fields': ('buyer_opt_in_validated', 'buyer_balance_validated')
        }),
        ('Status', {
            'fields': ('status', 'error_message')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'confirmed_at'),
            'classes': ('collapse',)
        }),
    )