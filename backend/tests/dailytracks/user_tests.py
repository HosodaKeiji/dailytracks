import pytest
from rest_framework.test import APIClient
from rest_framework import status
from django.urls import reverse
from accounts.models import User
from rest_framework.authtoken.models import Token


@pytest.mark.django_db
class TestGetUserAPI:
    """ユーザー情報取得API (/me/) のテスト"""

    @pytest.fixture(autouse=True)
    def setup(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username="tester", password="testpass123")
        self.token = Token.objects.create(user=self.user)
        self.url = reverse("me")

    def test_get_user_success(self):
        """認証済みユーザーが自分の情報を取得できる"""
        # トークンを付与してGETリクエスト
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.token.key}")
        response = self.client.get(self.url)

        # ステータスコードの確認
        assert response.status_code == status.HTTP_200_OK

        # JSONレスポンスの中身確認
        data = response.data
        assert data["id"] == self.user.id
        assert data["username"] == self.user.username

    def test_get_user_unauthorized(self):
        """未認証状態では401が返る"""
        response = self.client.get(self.url)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED
