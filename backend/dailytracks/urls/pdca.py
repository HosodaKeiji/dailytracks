from django.urls import path
from ..views.pdca import PdcaCreateView, PdcaListView, PdcaLatestView, PdcaDetailView

urlpatterns = [
    path("create/", PdcaCreateView.as_view(), name="pdca_create"),
    path("list/", PdcaListView.as_view(), name="pdca_list"),
    path("latest/", PdcaLatestView.as_view(), name="pdca_latest"),
    path("<int:pk>/", PdcaDetailView.as_view(), name="pdca_detail"),
]