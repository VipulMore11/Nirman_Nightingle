from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError


class Review(models.Model):
    RATING_CHOICES = [
        (1, '1 - Poor'),
        (2, '2 - Fair'),
        (3, '3 - Good'),
        (4, '4 - Very Good'),
        (5, '5 - Excellent'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='reviews'
    )
    asset_id = models.IntegerField()
    rating = models.IntegerField(choices=RATING_CHOICES)
    comment = models.TextField(max_length=1000)
    helpful_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'asset_id')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['asset_id', '-created_at']),
            models.Index(fields=['asset_id', '-rating']),
            models.Index(fields=['asset_id', '-helpful_count']),
        ]

    def __str__(self):
        return f"Review by {self.user} for Asset {self.asset_id} - {self.rating}/5"

    def clean(self):
        if not (1 <= self.rating <= 5):
            raise ValidationError({'rating': 'Rating must be between 1 and 5.'})


class ReviewHelpful(models.Model):
    review = models.ForeignKey(
        Review,
        on_delete=models.CASCADE,
        related_name='helpful_users'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('review', 'user')

    def __str__(self):
        return f"{self.user} marked Review {self.review.id} as helpful"