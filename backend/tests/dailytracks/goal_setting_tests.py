import pytest
from rest_framework.test import APIClient
from rest_framework import status
from django.urls import reverse
from dailytracks.models import GoalSetting, GoalActionPair
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
class TestGoalSettingCreateView:
    """GoalSetting作成APIのテスト"""

    @pytest.fixture(autouse=True)
    def setup(self, auth_client):
        self.client, self.user = auth_client
        self.url = reverse("goalSetting_create")

    def test_create_success(self):
        """正常にGoalSettingが作成できる"""
        data = {
            "month": "2025-10-01",
            "goal_actions": [
                {"goal": "テスト目標1", "action": "テスト行動1", "result": "テスト結果1", "feedback": "テストフィードバック1"},
                {"goal": "テスト目標2", "action": "テスト行動2", "result": "テスト結果2", "feedback": "テストフィードバック2"},
            ]
        }
        response = self.client.post(self.url, data, format="json")

        assert response.status_code == status.HTTP_201_CREATED
        assert isinstance(response.data, dict)
        assert isinstance(response.data["goal_actions"], list)
        assert response.data["month"] == "2025-10-01"
        assert response.data["user"] == self.user.id

        for res_item, expected in zip(response.data["goal_actions"], data["goal_actions"]):
            assert res_item["goal"] == expected["goal"]
            assert res_item["action"] == expected["action"]
            assert res_item["result"] == expected["result"]
            assert res_item["feedback"] == expected["feedback"]
        
        goal_setting = GoalSetting.objects.get(id=response.data["id"])
        assert goal_setting.user == self.user
        assert str(goal_setting.month) == "2025-10-01"
        assert goal_setting.goal_actions.count() == 2

        first_action = goal_setting.goal_actions.all()[0]
        assert first_action.goal == "テスト目標1"
        assert first_action.action == "テスト行動1"
        assert first_action.result == "テスト結果1"
        assert first_action.feedback == "テストフィードバック1"
    
    def test_create_fail_duplicate_month(self):
        """同じmonthのGoalSettingは作成できない"""
        GoalSetting.objects.create(user=self.user, month=date(2025, 10, 1))
        data = {"month": "2025-10-01"}
        response = self.client.post(self.url, data, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "month" in response.data
        assert response.data["month"][0] == "この月の目標設定は既に存在します。"
    
    def test_create_fail_unauthorized(self):
        """未認証では作成できない"""
        client = APIClient()
        data = {"month": "2025-10-01"}
        response = client.post(self.url, data, format="json")

        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert "detail" in response.data

@pytest.mark.django_db
class TestGoalsettingListView:
    """GoalSetting一覧取得APIのテスト"""

    @pytest.fixture(autouse=True)
    def setup(self, auth_client):
        self.client, self.user = auth_client
        self.url = reverse("goalSetting_list")
        # 9月の目標設定
        goal_setting_september=GoalSetting.objects.create(
            user=self.user,
            month=date(2025, 9, 1)

        )
        GoalActionPair.objects.create(
            goal_setting=goal_setting_september,
            goal="9月の目標",
            action="9月の行動",
            result="9月の結果",
            feedback="9月のフィードバック"
        )
        # 10月の目標設定
        goal_setting_october = GoalSetting.objects.create(
            user=self.user,
            month=date(2025, 10, 1)
        )
        GoalActionPair.objects.create(
            goal_setting=goal_setting_october,
            goal="10月の目標",
            action="10月の行動",
            result="10月の結果",
            feedback="10月のフィードバック"
        )
    
    def test_list_success(self):
        """正常にGoalSetting一覧を取得できる"""
        response = self.client.get(self.url, format="json")

        assert response.status_code == status.HTTP_200_OK
        assert isinstance(response.data, list)
        assert len(response.data) == 2

        # 月が降順になっているか
        months = [item["month"] for item in response.data]
        assert months == ["2025-10-01", "2025-09-01"]

        # goal_actions の中身も検証
        first_goal_actions = response.data[0]["goal_actions"]
        assert len(first_goal_actions) == 1
        assert first_goal_actions[0]["goal"] == "10月の目標"
        assert first_goal_actions[0]["action"] == "10月の行動"
        assert first_goal_actions[0]["result"] == "10月の結果"
        assert first_goal_actions[0]["feedback"] == "10月のフィードバック"
    
    def test_list_fail_unauthorized(self):
        """未認証では一覧取得できない"""
        client = APIClient()
        response = client.get(self.url)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert "detail" in response.data

@pytest.mark.django_db
class TestGoalSettingLatestView:
    """最新GoalSetting取得APIのテスト"""

    @pytest.fixture(autouse=True)
    def setup(self, auth_client):
        self.client, self.user = auth_client
        self.url = reverse("goalSetting_latest")
    
    def test_latest_success(self):
        """最新のGoalSettingが取得できる"""
        old_goal_setting = GoalSetting.objects.create(user=self.user,month=date(2025, 9, 1))
        GoalActionPair.objects.create(
            goal_setting=old_goal_setting,
            goal="9月の目標",
            action="9月の行動",
            result="9月の結果",
            feedback="9月のフィードバック"
        )
        latest_goal_setting = GoalSetting.objects.create(user=self.user,month=date(2025, 10, 1))
        GoalActionPair.objects.create(
            goal_setting=latest_goal_setting,
            goal="10月の目標",
            action="10月の行動",
            result="10月の結果",
            feedback="10月のフィードバック"
        )
        response = self.client.get(self.url, format="json")
        assert response.status_code == status.HTTP_200_OK

        #内容が最新のものになっているか
        data = response.data
        assert data["id"] == latest_goal_setting.id
        assert data["month"] == "2025-10-01"
        # goal_actions の中身をリストとして検証
        goal_actions = data["goal_actions"]
        assert isinstance(goal_actions, list)
        assert len(goal_actions) == 1

        first_action = goal_actions[0]
        assert first_action["goal"] == "10月の目標"
        assert first_action["action"] == "10月の行動"
        assert first_action["result"] == "10月の結果"
        assert first_action["feedback"] == "10月のフィードバック"
    
    def test_latest_fail_non_goalSetting(self):
        """GoalSettingが存在しない場合は404"""
        response = self.client.get(self.url, format="json")

        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert "error" in response.data
    
    def test_latest_fail_unauthorized(self):
        """認証なしでは取得できない"""
        client = APIClient()
        response = client.get(self.url)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert "detail" in response.data

@pytest.mark.django_db
class TestGoalSettingDetailView:
    """GoalSetting詳細取得・更新APIのテスト"""

    @pytest.fixture(autouse=True)
    def setup(self, auth_client):
        self.client, self.user = auth_client
        self.goal_setting = GoalSetting.objects.create(
            user=self.user,
            month=date(2025, 10, 1)
        )
        GoalActionPair.objects.create(
            goal_setting=self.goal_setting,
            goal="10月の目標",
            action="10月の行動",
            result="10月の結果",
            feedback="10月のフィードバック"
        )
        self.url = reverse("goalSetting_detail", args=[self.goal_setting.id])

    def test_detail_get_success(self):
        """詳細取得が成功"""
        response = self.client.get(self.url, format="json")

        assert response.status_code == status.HTTP_200_OK
        assert response.data["month"] == "2025-10-01"
        assert response.data["user"] == self.user.id
        assert len(response.data["goal_actions"]) == 1
        first_action = response.data["goal_actions"][0]
        assert first_action["goal"] == "10月の目標"
        assert first_action["action"] == "10月の行動"
        assert first_action["result"] == "10月の結果"
        assert first_action["feedback"] == "10月のフィードバック"
    
    def test_detail_put_success(self):
        """更新の成功"""
        data = {
            "month": "2025-10-01",
            "goal_actions": [
                {"goal": "更新目標1", "action": "更新行動1", "result": "更新結果1", "feedback": "更新フィードバック1"},
                {"goal": "更新目標2", "action": "更新行動2", "result": "更新結果2", "feedback": "更新フィードバック2"}
            ]
        }
        response = self.client.put(self.url, data, format="json")
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["goal_actions"]) == 2
        first_action = response.data["goal_actions"][0]
        assert first_action["goal"] == "更新目標1"
        assert first_action["action"] == "更新行動1"
        assert first_action["result"] == "更新結果1"
        assert first_action["feedback"] == "更新フィードバック1"

        #DB確認
        self.goal_setting.refresh_from_db()
        assert self.goal_setting.month == date(2025, 10, 1)
        goal_actions = self.goal_setting.goal_actions.all()
        assert self.goal_setting.goal_actions.count() == 2
        first_action_db = goal_actions[0]
        assert first_action["goal"] == "更新目標1"
        assert first_action["action"] == "更新行動1"
        assert first_action["result"] == "更新結果1"
        assert first_action["feedback"] == "更新フィードバック1"

    def test_detail_fail_other_user(self):
        """他人のGoalSettingにはアクセスできない"""
        other = User.objects.create_user(username="other", password="pass")
        other_goal = GoalSetting.objects.create(
            user=other,
            month=date(2025, 10, 1)
        )
        url = reverse("goalSetting_detail", args=[other_goal.id])
        response = self.client.get(url)
        assert response.status_code == status.HTTP_404_NOT_FOUND
    
    def test_detail_fail_unauthorized(self):
        """未認証ではアクセス不可"""
        client = APIClient()
        response = client.get(self.url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert "detail" in response.data