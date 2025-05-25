from django.urls import path
from ..views.diary import DiaryCreateView, DiaryListView, DiaryLatestView

urlpatterns = [
    path("create/", DiaryCreateView.as_view(), name="diary_create"),
    path("list/", DiaryListView.as_view(), name="diary_list"),
    path("latest/", DiaryLatestView.as_view(), name="diary_latest")
]