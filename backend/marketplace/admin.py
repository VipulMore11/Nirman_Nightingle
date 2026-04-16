from django.contrib import admin
from .models import Asset, Ownership, Dividend


@admin.register(Asset)
class AssetAdmin(admin.ModelAdmin):
    list_display = ('name', 'asset_id', 'total_tokens', 'tokenized_percentage', 'owner', 'created_at')
    list_filter = ('created_at', 'tokenized_percentage')
    search_fields = ('name', 'asset_id', 'owner__username')
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        ('Asset Information', {
            'fields': ('name', 'asset_id', 'owner')
        }),
        ('Token Configuration', {
            'fields': ('total_tokens', 'tokenized_percentage')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Ownership)
class OwnershipAdmin(admin.ModelAdmin):
    list_display = ('user', 'asset', 'tokens_owned', 'buy_price', 'created_at')
    list_filter = ('created_at', 'asset')
    search_fields = ('user__username', 'asset__name')
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        ('Ownership Details', {
            'fields': ('user', 'asset')
        }),
        ('Token Information', {
            'fields': ('tokens_owned', 'buy_price')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Dividend)
class DividendAdmin(admin.ModelAdmin):
    list_display = ('asset', 'total_profit', 'distributed_profit', 'profit_per_token', 'created_at')
    list_filter = ('created_at', 'asset')
    search_fields = ('asset__name',)
    readonly_fields = ('created_at',)
    fieldsets = (
        ('Dividend Information', {
            'fields': ('asset',)
        }),
        ('Profit Details', {
            'fields': ('total_profit', 'distributed_profit', 'profit_per_token')
        }),
        ('Timestamps', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
