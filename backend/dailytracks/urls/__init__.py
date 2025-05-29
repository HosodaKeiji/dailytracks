# dailytracks/urls/__init__.py
from django.urls import path, include

urlpatterns = [
    path('user/', include('dailytracks.urls.user')),
    path('diary/', include('dailytracks.urls.diary')),
    path('pdca/', include('dailytracks.urls.pdca')),
    path('one_on_one/', include('dailytracks.urls.one_on_one')),
]
