from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('Authentication.urls')),
    path('api/governance/', include('discussion.urls')),
]
