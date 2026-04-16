from django.contrib import admin
from .models import Review, ReviewHelpful


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'asset_id', 'rating', 'helpful_count', 'created_at']
    list_filter = ['rating', 'created_at', 'helpful_count']
    search_fields = ['user__username', 'asset_id', 'comment']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        ('Reviewer Info', {
            'fields': ('user', 'asset_id')
        }),
        ('Review Content', {
            'fields': ('rating', 'comment')
        }),
        ('Engagement', {
            'fields': ('helpful_count',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def has_delete_permission(self, request):
        return request.user.is_superuser


@admin.register(ReviewHelpful)
class ReviewHelpfulAdmin(admin.ModelAdmin):
    list_display = ['id', 'review', 'user', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__username', 'review__id']
    readonly_fields = ['created_at']

    def has_delete_permission(self, request):
        return request.user.is_superuser
