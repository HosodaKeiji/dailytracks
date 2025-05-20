# dailytracks/urls/__init__.py
from django.urls import path, include

urlpatterns = [
    path('user/', include('dailytracks.urls.user')),
]
