from django.urls import path
from ..views.diary import DiaryCreateView

urlpatterns = [
    path('create/', DiaryCreateView.as_view(), name='diary_create'),
]