from django.urls import path
from ..views.diary import DiaryCreateView, DiaryListView

urlpatterns = [
    path("create/", DiaryCreateView.as_view(), name="diary_create"),
    path("list/", DiaryListView.as_view(), name="diary_list")
]