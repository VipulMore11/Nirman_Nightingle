from django.urls import path
from .views import (
    redirect_insurance,
    activate_insurance,
    my_insurance,
    claim_insurance
)

urlpatterns = [
    path('redirect/', redirect_insurance, name='redirect_insurance'),
    path('activate/', activate_insurance, name='activate_insurance'),
    path('my/', my_insurance, name='my_insurance'),
    path('claim/', claim_insurance, name='claim_insurance'),
]
