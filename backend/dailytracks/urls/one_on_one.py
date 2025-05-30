from django.urls import path
from ..views.one_on_one import OneOnOneCreateView, OneOnOneListView, OneOnOneLatestView, OneOnOneDetailView

urlpatterns = [
    path("create/", OneOnOneCreateView.as_view(), name="oneOnOne_create"),
    path("list/", OneOnOneListView.as_view(), name="oneOnOne_list"),
    path("latest/", OneOnOneLatestView.as_view(), name="oneOnOne_latest"),
    path("<int:pk>/", OneOnOneDetailView.as_view(), name="oneOnOne_detail"),
]