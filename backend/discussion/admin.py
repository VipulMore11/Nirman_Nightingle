"""
Django admin configuration for discussion app.
"""
from django.contrib import admin
from discussion.models import Company, Proposal, Comment, VoteRecord, Notification


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    """Admin interface for Company model."""
    list_display = ['name', 'owner_address', 'total_supply', 'created_at']
    list_filter = ['created_at']
    search_fields = ['name', 'owner_address', 'token_address']
    readonly_fields = ['created_at']

    fieldsets = (
        ('Basic Info', {
            'fields': ('name',)
        }),
        ('Blockchain', {
            'fields': ('token_address', 'owner_address', 'total_supply')
        }),
        ('Metadata', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )


@admin.register(Proposal)
class ProposalAdmin(admin.ModelAdmin):
    """Admin interface for Proposal model."""
    list_display = [
        'title',
        'company',
        'status',
        'proposer_address',
        'quorum_reached',
        'extension_count',
        'created_at',
    ]
    list_filter = ['status', 'company', 'created_at', 'quorum_reached']
    search_fields = ['title', 'proposer_address', 'description']
    readonly_fields = ['created_at', 'updated_at', 'snapshot_block']

    fieldsets = (
        ('Basic Info', {
            'fields': ('company', 'title', 'description')
        }),
        ('Status & Timeline', {
            'fields': (
                'status',
                'discussion_end',
                'voting_start',
                'voting_end',
                'extension_count',
            )
        }),
        ('Voting Data', {
            'fields': (
                'proposer_address',
                'snapshot_block',
                'yes_votes_weight',
                'no_votes_weight',
                'quorum_reached',
            ),
            'classes': ('collapse',)
        }),
        ('Veto', {
            'fields': ('veto_count_year', 'veto_date'),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    actions = ['finalize_proposal', 'extend_voting_period']

    def finalize_proposal(self, request, queryset):
        """Admin action to finalize proposals."""
        from discussion.services.governance import GovernanceService
        
        count = 0
        for proposal in queryset:
            if GovernanceService.finalize_proposal(proposal):
                count += 1
        
        self.message_user(
            request,
            f'Finalized {count} proposal(s)'
        )

    finalize_proposal.short_description = "Finalize selected proposals"

    def extend_voting_period(self, request, queryset):
        """Admin action to extend voting periods."""
        from discussion.services.governance import GovernanceService
        
        count = 0
        for proposal in queryset:
            if GovernanceService.apply_extensions(proposal):
                count += 1
        
        self.message_user(
            request,
            f'Extended {count} proposal(s)'
        )

    extend_voting_period.short_description = "Extend voting period (if eligible)"


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    """Admin interface for Comment model."""
    list_display = ['id', 'proposal', 'author_address', 'created_at']
    list_filter = ['proposal', 'created_at']
    search_fields = ['author_address', 'content', 'proposal__title']
    readonly_fields = ['created_at']

    fieldsets = (
        ('Comment Info', {
            'fields': ('proposal', 'author_address', 'content')
        }),
        ('Metadata', {
            'fields': ('created_at',)
        }),
    )


@admin.register(VoteRecord)
class VoteRecordAdmin(admin.ModelAdmin):
    """Admin interface for VoteRecord model."""
    list_display = ['id', 'proposal', 'voter_address', 'choice', 'weight', 'created_at']
    list_filter = ['proposal', 'choice', 'created_at']
    search_fields = ['voter_address', 'tx_hash', 'proposal__title']
    readonly_fields = ['created_at', 'tx_hash']

    fieldsets = (
        ('Vote Info', {
            'fields': ('proposal', 'voter_address', 'choice', 'weight')
        }),
        ('Blockchain', {
            'fields': ('tx_hash',)
        }),
        ('Metadata', {
            'fields': ('created_at',)
        }),
    )


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    """Admin interface for Notification model."""
    list_display = [
        'notification_type',
        'recipient_address',
        'proposal',
        'read',
        'created_at',
    ]
    list_filter = ['notification_type', 'read', 'created_at']
    search_fields = ['recipient_address', 'message', 'proposal__title']
    readonly_fields = ['created_at']

    fieldsets = (
        ('Notification', {
            'fields': (
                'notification_type',
                'recipient_address',
                'proposal',
                'message',
                'read',
            )
        }),
        ('Metadata', {
            'fields': ('created_at',)
        }),
    )

    actions = ['mark_as_read', 'mark_as_unread']

    def mark_as_read(self, request, queryset):
        """Mark selected notifications as read."""
        count = queryset.update(read=True)
        self.message_user(request, f'Marked {count} notification(s) as read')

    mark_as_read.short_description = "Mark as read"

    def mark_as_unread(self, request, queryset):
        """Mark selected notifications as unread."""
        count = queryset.update(read=False)
        self.message_user(request, f'Marked {count} notification(s) as unread')

    mark_as_unread.short_description = "Mark as unread"
