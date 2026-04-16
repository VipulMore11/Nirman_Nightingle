from django.urls import path
from .views import (
    create_review,
    list_reviews,
    mark_helpful,
    delete_review,
    get_asset_stats
)

app_name = 'reviews'

urlpatterns = [
    path('add/', create_review, name='create_review'),
    path('list/', list_reviews, name='list_reviews'),
    path('helpful/<int:review_id>/', mark_helpful, name='mark_helpful'),
    path('delete/<int:review_id>/', delete_review, name='delete_review'),
    path('stats/', get_asset_stats, name='get_asset_stats'),
]
