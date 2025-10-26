import pytest
from rest_framework.test import APIClient
from rest_framework import status
from django.urls import reverse
from dailytracks.models import Pdca
from accounts.models import User
from rest_framework.authtoken.models import Token
from datetime import date, timedelta

@pytest.fixture
def auth_client(db):
    """認証済みクライアントを返す共通fixture"""
    client = APIClient()
    user = User.objects.create_user(username="tester", password="testpass123")
    token = Token.objects.create(user=user)
    client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")
    return client, user

@pytest.mark.django_db
class TestPdcaCreateView:
    """PDCA作成APIのテスト"""        

    def test_create_success(self, auth_client):
        """PDCAの作成が成功"""
        client, user = auth_client  # 認証済みクライアントとユーザーを取得
        url = reverse("pdca_create")
        data = {
            "week_date": str(date.today()),
            "plan": "PDCA計画",
            "execution": "実行内容",
            "review": "振り返り内容",
            "action": "改善内容",
            "feedback": "フィードバック内容",
        }

        response = client.post(url, data, format="json")

        assert response.status_code == status.HTTP_201_CREATED
        assert isinstance(response.data, dict)
        assert response.data["plan"] == "PDCA計画"
        assert response.data["execution"] == "実行内容"
        assert response.data["review"] == "振り返り内容"
        assert response.data["action"] == "改善内容"

        #DB検証
        pdca = Pdca.objects.get(id=response.data["id"])
        assert pdca.user == user
        assert pdca.plan == "PDCA計画"
        assert pdca.execution == "実行内容"
        assert pdca.review == "振り返り内容"
        assert pdca.action == "改善内容"

    def test_create_fail_duplicate_week(self, auth_client):
        """同じ週のPDCAは作成できない（ユニーク制約）"""
        client, user = auth_client
        Pdca.objects.create(
            user=user,
            week_date=date(2025, 10, 13),
            plan="既存",
            execution="既存",
            review="既存",
            action="既存",
        )

        url = reverse("pdca_create")
        data = {
            "week_date": str(date(2025, 10, 13)),
            "plan": "重複テスト",
            "execution": "x",
            "review": "x",
            "action": "x",
        }

        response = client.post(url, data, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "non_field_errors" in response.data

    def test_create_fail_unauthorized(self):
        """認証なしでは作成できない"""
        client = APIClient()
        url = reverse("pdca_create")
        data = {
            "week_date": str(date.today()),
            "plan": "未認証",
            "execution": "x",
            "review": "x",
            "action": "x",
        }
        # 未認証のユーザ（Token 認証情報を付与していないユーザ）で作成
        response = client.post(url, data, format="json")

        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert "detail" in response.data

@pytest.mark.django_db
class TestPdcaListView:
    """PDCA一覧取得APIのテスト"""

    @pytest.fixture(autouse=True)
    def setup(self, auth_client):
        self.client, self.user = auth_client  # 認証済みクライアントとユーザーを取得
        self.url = reverse("pdca_list")
        Pdca.objects.create(
            user=self.user,
            week_date=date(2025, 10, 13),
            plan="古い週",
            execution="古い週",
            review="古い週",
            action="古い週",
        )
        Pdca.objects.create(
            user=self.user,
            week_date=date(2025, 10, 20),
            plan="新しい週",
            execution="新しい週",
            review="新しい週",
            action="新しい週",
        )
    
    def test_list_success(self):
        """PDCA一覧を正常に取得できる"""
        response = self.client.get(self.url, format="json")

        assert response.status_code == status.HTTP_200_OK
        assert isinstance(response.data, list)
        assert len(response.data) == 2

        expected = [
            {"week_date": "2025-10-20", "plan": "新しい週", "execution": "新しい週", "review": "新しい週", "action": "新しい週"},
            {"week_date": "2025-10-13","plan": "古い週", "execution": "古い週", "review": "古い週", "action": "古い週"},
        ]

        # --- 並び順と値の整合性チェック ---
        for item, exp in zip(response.data, expected):
            assert item["week_date"] == exp["week_date"]
            assert item["plan"] == exp["plan"]
            assert item["execution"] == exp["execution"]
            assert item["review"] == exp["review"]
            assert item["action"] == exp["action"]
            assert item["user"] == self.user.id
            assert "created_at" in item
    
    def test_list_fail_unauthorized(self):
        """認証なしでは一覧取得できない"""
        client = APIClient()
        response = client.get(self.url)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert "detail" in response.data

@pytest.mark.django_db
class TestPdcaLatestView:
    """最新PDCA取得APIのテスト"""

    @pytest.fixture(autouse=True)
    def setup(self, auth_client):
        self.client, self.user = auth_client  # 認証済みクライアントとユーザーを取得
        self.url = reverse("pdca_latest")

    def test_latest_success(self, auth_client):
        """最新のPDCAを取得できる"""
        # 2件作成して新しい方を確認
        Pdca.objects.create(
            user=self.user,
            week_date=date(2025, 10, 6),
            plan="古いPDCA",
            execution="古い",
            review="古い",
            action="古い",
        )
        Pdca.objects.create(
            user=self.user,
            week_date=date(2025, 10, 13),
            plan="最新PDCA",
            execution="最新",
            review="最新",
            action="最新",
        )

        response = self.client.get(self.url, format="json")
        assert response.status_code == status.HTTP_200_OK

        # 内容が最新のものになっているか
        data = response.data
        assert data["week_date"] == "2025-10-13"
        assert data["plan"] == "最新PDCA"
        assert data["execution"] == "最新"
        assert data["review"] == "最新"
        assert data["action"] == "最新"
    
    def test_latest_fail_no_pdca(self):
        """PDCAが存在しない場合は404"""
        response = self.client.get(self.url, format="json")

        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert "Error" in response.data
        assert response.data["Error"] == "PDCAが見つかりませんでした"

    def test_latest_fail_unauthorized(self):
        """認証なしでは取得できない"""
        client = APIClient()
        response = client.get(self.url)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert "detail" in response.data

@pytest.mark.django_db
class TestPdcaDetailView:
    """PDCA詳細取得・更新APIのテスト"""

    @pytest.fixture(autouse=True)
    def setup(self, auth_client):
        self.client, self.user = auth_client  # 認証済みクライアントとユーザーを取得
        self.pdca = Pdca.objects.create(
            user=self.user,
            week_date=date(2025, 10, 13),
            plan="詳細テスト",
            execution="実行",
            review="振り返り",
            action="改善",
        )
        self.url = reverse("pdca_detail", args=[self.pdca.id])
    
    def test_detail_get_success(self):
        """詳細取得が成功"""
        response = self.client.get(self.url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["week_date"] == "2025-10-13"
        assert response.data["plan"] == "詳細テスト"
        assert response.data["execution"] == "実行"
        assert response.data["review"] == "振り返り"
        assert response.data["action"] == "改善"
        assert response.data["user"] == self.user.id
    
    def test_detail_put_success(self):
        """更新の成功"""
        data = {
            "week_date": str(self.pdca.week_date),
            "plan": "更新後の計画",
            "execution": "更新実行",
            "review": "更新振り返り",
            "action": "更新改善",
            "feedback": "追加フィードバック",
        }
        response = self.client.put(self.url, data, format="json")

        assert response.status_code == status.HTTP_200_OK
        assert response.data["week_date"] == "2025-10-13"
        assert response.data["plan"] == "更新後の計画"
        assert response.data["execution"] == "更新実行"
        assert response.data["review"] == "更新振り返り"
        assert response.data["action"] == "更新改善"
        assert response.data["feedback"] == "追加フィードバック"
        assert response.data["user"] == self.user.id

        self.pdca.refresh_from_db()
        assert self.pdca.week_date == date(2025, 10, 13) # DBの値（date型）と比較する際は、同じ型で比較
        assert self.pdca.plan == "更新後の計画"
        assert self.pdca.execution == "更新実行"
        assert self.pdca.review == "更新振り返り"
        assert self.pdca.action == "更新改善"
        assert self.pdca.feedback == "追加フィードバック"
        assert self.pdca.user.id == self.user.id
    
    def test_detail_fail_other_user(self):
        """他人のPDCAにはアクセスできない"""
        other = User.objects.create_user(username="other", password="pass")
        other_pdca = Pdca.objects.create(
            user=other,
            week_date=date(2025, 10, 20),
            plan="他人のPDCA",
            execution="x",
            review="x",
            action="x",
        )

        url = reverse("pdca_detail", args=[other_pdca.id])
        response = self.client.get(url)
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_detail_fail_unauthorized(self):
        """認証なしでアクセス不可"""
        client = APIClient()
        response = client.get(self.url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED