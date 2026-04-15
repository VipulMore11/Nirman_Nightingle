from django.urls import path
from django.views.generic import TemplateView
from . import views

app_name = 'Authentication'

urlpatterns = [
    # path('', TemplateView.as_view(template_name='index.html'), name='index'),
    path('signup/',views.signup_view,name='signup'),
    path('login/',views.login_view,name='login'),
    path('profile/',views.get_profile,name='get_profile'),
    path('update_profile/',views.update_profile,name='update_profile'),
    path('logout/',views.logout_view,name='logout'),
    path('verify_kyc/', views.verify_kyc, name='verify_kyc'),
    path('submit_kyc/', views.submit_kyc, name='submit_kyc'),
    path('kyc_status/', views.get_kyc, name='kyc_status'),
]