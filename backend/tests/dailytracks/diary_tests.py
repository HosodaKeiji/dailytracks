import pytest
from rest_framework.test import APIClient
from rest_framework import status
from django.urls import reverse
from dailytracks.models import Diary
from accounts.models import User
from rest_framework.authtoken.models import Token
from datetime import datetime, timedelta
from django.utils.timezone import make_aware


@pytest.mark.django_db
class TestDiaryCreateView:
    """日記作成APIのテスト"""

    @pytest.fixture(autouse=True)
    def setup(self):
        """共通セットアップ"""
        self.client = APIClient()
        self.user = User.objects.create_user(username="tester", password="testpass123")
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.token.key}")

    def test_create_success(self):
        """日記の作成が成功する"""
        url = reverse("diary_create")
        data = {"content": "今日は良い日だった", "mood": 5}
        response = self.client.post(url, data, format="json")

        assert response.status_code == status.HTTP_201_CREATED
        assert isinstance(response.data, dict)
        assert response.data["content"] == data["content"]
        assert response.data["mood"] == data["mood"]

        # DB検証
        diary = Diary.objects.get(id=response.data["id"])
        assert diary.user == self.user
        assert diary.content == "今日は良い日だった"
        assert diary.mood == 5

    def test_create_fail_invalid_mood(self):
        """不正なmood値では作成できない"""
        url = reverse("diary_create")
        data = {"content": "エラー日記", "mood": 99}
        response = self.client.post(url, data, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "mood" in response.data

    def test_create_fail_unauthorized(self):
        """認証なしでは作成できない"""
        client = APIClient()  # 認証なしクライアント
        url = reverse("diary_create")
        data = {"content": "認証なし投稿", "mood": 3}
        response = client.post(url, data, format="json")

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

@pytest.mark.django_db
class TestDiaryListView:
    """日記一覧取得APIのテスト"""

    @pytest.fixture(autouse=True)
    def setup(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username="tester", password="testpass123")
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.token.key}")

        # ダミー日記を3件作成（作成日の降順で返される）
        Diary.objects.create(user=self.user, content="日記1", mood=3)
        Diary.objects.create(user=self.user, content="日記2", mood=4)
        Diary.objects.create(user=self.user, content="日記3", mood=5)

    def test_list_success(self):
        """日記一覧を正常に取得できる"""
        url = reverse("diary_list")
        response = self.client.get(url, format="json")

        # ステータス確認
        assert response.status_code == status.HTTP_200_OK
        assert isinstance(response.data, list)
        assert len(response.data) == 3

        # --- 期待値を定義（content と mood の両方）---
        expected = [
            {"content": "日記3", "mood": 5},
            {"content": "日記2", "mood": 4},
            {"content": "日記1", "mood": 3},
        ]

        # --- 並び順と値の整合性チェック ---
        for item, exp in zip(response.data, expected):
            assert item["content"] == exp["content"]
            assert item["mood"] == exp["mood"]
            assert item["user"] == self.user.id
            assert "created_at" in item

    def test_list_fail_unauthorized(self):
        """認証なしでは一覧取得不可"""
        client = APIClient()  # 認証なし
        url = reverse("diary_list")
        response = client.get(url, format="json")

        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert "detail" in response.data  # 認証エラー文言が含まれる


@pytest.mark.django_db
class TestDiaryLatestView:
    """最新日記取得APIのテスト"""

    @pytest.fixture(autouse=True)
    def setup(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username="tester", password="testpass123")
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.token.key}")

    def test_latest_success(self):
        """最新の日記を取得できる"""
        # 2件作成して新しい方を確認
        old_diary = Diary.objects.create(user=self.user, content="古い日記", mood=3)
        latest_diary = Diary.objects.create(user=self.user, content="最新日記", mood=5)

        url = reverse("diary_latest")
        response = self.client.get(url, format="json")

        assert response.status_code == status.HTTP_200_OK

        # 内容が最新のものになっているか
        data = response.data
        assert data["content"] == "最新日記"
        assert data["mood"] == 5
        assert data["user"] == self.user.id

    def test_latest_fail_no_diary(self):
        """日記が存在しない場合は404"""
        url = reverse("diary_latest")
        response = self.client.get(url, format="json")

        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert "Error" in response.data
        assert response.data["Error"] == "日記が見つかりませんでした"

    def test_latest_fail_unauthorized(self):
        """認証なしでは取得できない"""
        client = APIClient()
        url = reverse("diary_latest")
        response = client.get(url, format="json")

        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert "detail" in response.data
