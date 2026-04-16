"""
URL routing for discussion app.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from discussion.views import CompanyViewSet, ProposalViewSet, NotificationViewSet

router = DefaultRouter()
router.register(r'companies', CompanyViewSet, basename='company')
router.register(r'proposals', ProposalViewSet, basename='proposal')
router.register(r'notifications', NotificationViewSet, basename='notification')

urlpatterns = [
    path('', include(router.urls)),
]
