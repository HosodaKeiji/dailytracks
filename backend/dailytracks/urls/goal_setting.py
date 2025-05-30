from django.urls import path
from ..views.goal_setting import GoalSettingCreateView, GoalSettingListView, GoalSettingLatestView, GoalSettingDetailView

urlpatterns = [
    path("create/", GoalSettingCreateView.as_view(), name="goalSetting_create"),
    path("list/", GoalSettingListView.as_view(), name="goalSetting_list"),
    path("latest/", GoalSettingLatestView.as_view(), name="goalSetting_latest"),
    path("<int:pk>/", GoalSettingDetailView.as_view(), name="goalSetting_detail"),
]