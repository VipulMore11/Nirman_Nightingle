from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError


class Asset(models.Model):
    """Model for tokenized assets."""
    
    name = models.CharField(max_length=255)
    asset_id = models.IntegerField(unique=True)
    total_tokens = models.IntegerField()
    tokenized_percentage = models.FloatField()  # e.g., 30 means 30%
    
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='owned_marketplace_assets'
    )

    price_per_token = models.FloatField(default=0.0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Assets'

    def __str__(self):
        return f"{self.name} (ID: {self.asset_id})"

    def clean(self):
        if self.total_tokens <= 0:
            raise ValidationError("Total tokens must be greater than 0.")
        if not 0 < self.tokenized_percentage <= 100:
            raise ValidationError("Tokenized percentage must be between 0 and 100.")
        if self.price_per_token < 0:
            raise ValidationError("Price per token cannot be negative.")


class Ownership(models.Model):
    """Tracks how many tokens each user owns."""
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='token_ownership'
    )
    
    asset = models.ForeignKey(
        Asset,
        on_delete=models.CASCADE,
        related_name='owners'
    )

    tokens_owned = models.IntegerField()
    buy_price = models.FloatField()  # price per token at purchase

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'asset')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user} owns {self.tokens_owned} of {self.asset.name}"

    def clean(self):
        if self.tokens_owned <= 0:
            raise ValidationError("Tokens must be greater than 0.")
        if self.buy_price < 0:
            raise ValidationError("Buy price cannot be negative.")


class Dividend(models.Model):
    """Tracks dividend distribution for an asset."""

    asset = models.ForeignKey(
        Asset,
        on_delete=models.CASCADE,
        related_name='dividends'
    )

    total_profit = models.FloatField()
    distributed_profit = models.FloatField()
    profit_per_token = models.FloatField()

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.asset.name} Dividend - ₹{self.total_profit}"

    def clean(self):
        if self.total_profit < 0:
            raise ValidationError("Total profit cannot be negative.")
        if self.distributed_profit < 0:
            raise ValidationError("Distributed profit cannot be negative.")
        if self.profit_per_token < 0:
            raise ValidationError("Profit per token cannot be negative.")