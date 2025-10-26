import pytest
from rest_framework.test import APIClient
from rest_framework import status
from django.urls import reverse
from dailytracks.models import OneOnOne
from accounts.models import User
from rest_framework.authtoken.models import Token
from datetime import date

@pytest.fixture
def auth_client(db):
    """認証済みクライアントを返す共通fixture"""
    client = APIClient()
    user = User.objects.create_user(username="tester", password="testpass123")
    token = Token.objects.create(user=user)
    client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")
    return client, user

@pytest.mark.django_db
class TestOneOnOneCreateView:
    """OneOnOne作成APIのテスト"""

    @pytest.fixture(autouse=True)
    def setup(self, auth_client):
        self.client, self.user = auth_client # 認証済みクライアントとユーザーを取得
        self.url = reverse("oneOnOne_create")

    def test_create_success(self):
        """正常にOneOnOneが作成できる"""
        data = {
            "date": str(date.today()),
            "consultation": "相談内容",
            "last_action": "前回のアクション",
            "feedback": "上司からのFB",
            "next_action": "次のアクション"
        }
        response = self.client.post(self.url, data, format="json")

        assert response.status_code == status.HTTP_201_CREATED
        assert isinstance(response.data, dict)
        assert response.data["date"] == str(date.today())
        assert response.data["consultation"] == "相談内容"
        assert response.data["last_action"] == "前回のアクション"
        assert response.data["feedback"] == "上司からのFB"
        assert response.data["next_action"] == "次のアクション"
        assert response.data["user"] == self.user.id

        #DB検証
        one_on_One = OneOnOne.objects.get(id=response.data["id"])
        assert one_on_One.user == self.user
        assert one_on_One.date == date.today()
        assert one_on_One.consultation == "相談内容"
        assert one_on_One.last_action == "前回のアクション"
        assert one_on_One.feedback == "上司からのFB"
        assert one_on_One.next_action == "次のアクション"
    
    def test_create_fail_duplicate_date(self, auth_client):
        """同じ日付のOneOnOneは作成できない"""
        OneOnOne.objects.create(
            user=self.user,
            date=date(2025, 10, 13),
            consultation="既存",
            last_action="既存"
        )
        data = {
            "date": str(date(2025, 10, 13)),
            "consultation": "重複テスト",
            "last_action": "重複"
        }
        response = self.client.post(self.url, data, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        # UniqueConstraintが発動するとfield名で返ることが多い
        assert "non_field_errors" in response.data
    
    def test_create_fail_unauthorized(self):
        """認証なしでは作成できない"""
        client = APIClient()
        data = {
            "date": str(date.today()),
            "consultation": "未認証",
            "last_action": "x"
        }
        response = client.post(self.url, data, format="json")

        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert "detail" in response.data

@pytest.mark.django_db
class TestOneOnOneListView:
    """OneOnOne一覧取得APIのテスト"""

    @pytest.fixture(autouse=True)
    def setup(self, auth_client):
        self.client, self.user = auth_client  # 認証済みクライアントとユーザーを取得
        self.url = reverse("oneOnOne_list")
        OneOnOne.objects.create(
            user=self.user,
            date=date(2025, 10, 13),
            consultation="古い1on1",
            last_action="古い",
            feedback="古い",
            next_action="古い",
        )
        OneOnOne.objects.create(
            user=self.user,
            date=date(2025, 10, 20),
            consultation="新しい1on1",
            last_action="新しい",
            feedback="新しい",
            next_action="新しい",
        )
    
    def test_list_success(self):
        """正常にOneOnOne一覧を取得できる"""
        response = self.client.get(self.url, format="json")

        assert response.status_code == status.HTTP_200_OK
        assert isinstance(response.data, list)
        assert len(response.data) == 2

        expected = [
            {"date": "2025-10-20", "consultation": "新しい1on1", "last_action": "新しい", "feedback": "新しい", "next_action": "新しい"},
            {"date": "2025-10-13", "consultation": "古い1on1", "last_action": "古い", "feedback": "古い", "next_action": "古い"},
        ]

        # --- 並び順と値の整合性チェック ---
        for item, exp in zip(response.data, expected):
            assert item["date"] == exp["date"]
            assert item["consultation"] == exp["consultation"]
            assert item["last_action"] == exp["last_action"]
            assert item["feedback"] == exp["feedback"]
            assert item["next_action"] == exp["next_action"]
            assert item["user"] == self.user.id
        
    def test_list_fail_unauthorized(self):
        """未認証では一覧取得できない"""
        client = APIClient()
        response = client.get(self.url)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert "detail" in response.data

@pytest.mark.django_db
class TestOneOnOnelatestView:
    """最新OneOnOne取得APIのテスト"""

    @pytest.fixture(autouse=True)
    def setup(self, auth_client):
        self.client, self.user = auth_client
        self.url = reverse("oneOnOne_latest")

    def test_latest_success(self):
        """最新のOneOnOneが取得できる"""
        OneOnOne.objects.create(
            user=self.user,
            date=date(2025, 10, 13),
            consultation="古い1on1",
            last_action="古い",
            feedback="古い",
            next_action="古い",
        )
        OneOnOne.objects.create(
            user=self.user,
            date=date(2025, 10, 20),
            consultation="最新1on1",
            last_action="新しい",
            feedback="新しい",
            next_action="新しい",
        )

        response = self.client.get(self.url, format="json")
        assert response.status_code == status.HTTP_200_OK

        #内容が最新のものになっているか
        data = response.data
        assert data["date"] == "2025-10-20"
        assert data["consultation"] == "最新1on1"
        assert data["last_action"] == "新しい"
        assert data["feedback"] == "新しい"
        assert data["next_action"] == "新しい"
        assert data["user"] == self.user.id
    
    def test_latest_fail_no_oneOnOne(self):
        """OneOnOneが存在しない場合は404"""
        response = self.client.get(self.url, format="json")

        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert response.data["Error"] == "OneOnOneが見つかりませんでした"

    def test_latest_fail_unauthorized(self):
        """認証なしでは取得できない"""
        client = APIClient()
        response = client.get(self.url)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert "detail" in response.data

@pytest.mark.django_db
class TestOneOnOneDetailView:
    """OneOnOne詳細取得・更新APIのテスト"""

    @pytest.fixture(autouse=True)
    def setup(self, auth_client):
        self.client, self.user = auth_client
        self.one_on_one = OneOnOne.objects.create(
            user=self.user,
            date=date(2025, 10, 13),
            consultation="相談内容",
            last_action="前回の行動",
            feedback="上長からのフィードバック",
            next_action="次の行動"
        )
        self.url = reverse("oneOnOne_detail", args=[self.oneOnOne.id])
    
    def test_detail_get_success(self):
        """詳細取得が成功"""
        response = self.client.get(self.url, format="json")

        assert response.status_code == status.HTTP_200_OK
        assert response.data["date"] == "2025-10-13"
        assert response.data["consultation"] == "相談内容"
        assert response.data["last_action"] == "前回の行動"
        assert response.data["feedback"] == "上長からのフィードバック"
        assert response.data["next_action"] == "次の行動"
    
    def test_detail_put_success(self):
        """更新の成功"""
        data = {
            "date": str(self.one_on_one.date),
            "consultation": "更新後相談",
            "last_action": "更新後行動",
            "feedback": "新しいフィードバック",
            "next_action": "更新後次の行動"
        }
        response = self.client.put(self.url, data, format="json")

        assert response.status_code == status.HTTP_200_OK
        data = response.data
        assert data["date"] == "2025-10-13"
        assert data["consultation"] == "更新後相談"
        assert data["last_action"] == "更新後行動"
        assert data["feedback"] == "新しいフィードバック"
        assert data["next_action"] == "更新後次の行動"
        assert data["user"] == self.user.id

        # DB確認
        self.one_on_one.refresh_from_db()
        assert self.one_on_one.date == date(2025, 10, 13)
        assert self.one_on_one.consultation == "更新後相談"
        assert self.one_on_one.last_action == "更新後行動"
        assert self.one_on_one.feedback == "新しいフィードバック"
        assert self.one_on_one.next_action == "更新後次の行動"
        assert self.one_on_one.user.id == self.user.id
    
    def test_detail_fail_other_user(self):
        """他人のOneOnOneにはアクセスできない"""
        other = User.objects.create_user(username="other", password="pass")
        other_one_on_one = OneOnOne.objects.create(
            user=other,
            date=date(2025, 10, 13),
            consultation = "他人の記録",
            last_action = "他人の行動"            
        )
        url = reverse("oneOnOne_detail", args=[other_one_on_one.id])
        response = self.client.get(url)
        assert response.status_code == status.HTTP_404_NOT_FOUND
    
    def test_detail_fail_unauthorized(self):
        """未認証ではアクセス不可"""
        client = APIClient()
        response = client.get(self.url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert "detail" in response.data