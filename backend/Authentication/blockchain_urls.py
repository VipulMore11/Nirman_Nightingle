from django.urls import path
from django.views.generic import TemplateView
from . import blockchain_views 

app_name = 'Authentication'

urlpatterns = [
    path('create_asset/', blockchain_views.create_asset, name='create_asset'),
    path('opt_in/', blockchain_views.opt_in, name='opt_in'),
    path('buy_asset/', blockchain_views.buy_asset, name='buy_asset'),

]