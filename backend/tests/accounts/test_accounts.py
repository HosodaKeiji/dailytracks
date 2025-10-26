import pytest
from rest_framework.test import APIClient
from django.urls import reverse
from accounts.models import User
from rest_framework.authtoken.models import Token


@pytest.mark.django_db
class TestAccounts:
    """accountsアプリの認証・ユーザー操作系APIテスト"""

    # === 各テストで共通して使うデータ ===
    @pytest.fixture(autouse=True)
    def setup(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username="tester", password="testpass123")
        self.token = Token.objects.create(user=self.user)

    # --- SignupView ---
    def test_signup_success(self):
        """ユーザー登録が成功する"""
        url = reverse("signup")
        data = {"username": "newuser", "password": "newpass123"}
        response = self.client.post(url, data, format="json")

        assert response.status_code == 201
        assert User.objects.filter(username="newuser").exists()

    def test_signup_fail_duplicate_username(self):
        """同一ユーザー名では登録できない"""
        url = reverse("signup")
        data = {"username": "tester", "password": "newpass123"}  # すでに存在する
        response = self.client.post(url, data, format="json")

        assert response.status_code == 400
        assert "username" in response.data

    # --- LoginView ---
    def test_login_success(self):
        """正しい認証情報でログインできる"""
        url = reverse("login")
        data = {"username": "tester", "password": "testpass123"}
        response = self.client.post(url, data, format="json")

        assert response.status_code == 200
        assert "token" in response.data
        assert response.data["user"]["username"] == "tester"

    def test_login_fail_wrong_password(self):
        """間違ったパスワードではログイン失敗"""
        url = reverse("login")
        data = {"username": "tester", "password": "wrongpass"}
        response = self.client.post(url, data, format="json")

        assert response.status_code == 400
        assert "ユーザー名またはパスワードが正しくありません" in str(response.data)

    # --- UsernameChangeView ---
    def test_change_username_success(self):
        """ユーザー名変更が成功する"""
        url = reverse("username_change")
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.token.key}")
        data = {"username": "newname"}
        response = self.client.post(url, data, format="json")

        assert response.status_code == 200
        self.user.refresh_from_db()
        assert self.user.username == "newname"

    def test_change_username_fail_unauthorized(self):
        """認証なしでは変更不可"""
        url = reverse("username_change")
        data = {"username": "newname"}
        response = self.client.post(url, data, format="json")

        assert response.status_code == 401  # 認証が必要

    # --- PasswordChangeView ---
    def test_change_password_success(self):
        """パスワード変更が成功する"""
        url = reverse("password_change")
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.token.key}")
        data = {"password": "newpassword123"}
        response = self.client.post(url, data, format="json")

        assert response.status_code == 200
        assert response.data["message"] == "パスワードを変更しました"

        # DBのユーザをリロードしてから新しいパスワードでログインできることを確認
        self.user.refresh_from_db()
        assert self.user.check_password("newpassword123")

    def test_change_password_fail_invalid(self):
        """短すぎるパスワードなどで失敗"""
        url = reverse("password_change")
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.token.key}")
        data = {"password": "short"}  # パスワードバリデーションで失敗を想定
        response = self.client.post(url, data, format="json")

        assert response.status_code == 400
