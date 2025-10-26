from django.urls import path
from .views import LoginView, SignupView, UsernameChangeView, PasswordChangeView

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('signup/', SignupView.as_view(), name='signup'),
    path('change-username/', UsernameChangeView.as_view(), name='username_change'),
    path('change-password/', PasswordChangeView.as_view(), name='password_change'),
]
