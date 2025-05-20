from django.urls import path
from ..views.user import GetUserView

urlpatterns = [
    path('me/', GetUserView.as_view(), name='me'),
]
