from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class GoalSetting(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    month = models.DateField()  # 各月の1日などを保存

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user', 'month'], name='unique_user_monthly_goal')
        ]

class GoalActionPair(models.Model):
    goal_setting = models.ForeignKey(GoalSetting, related_name="goal_actions", on_delete=models.CASCADE)
    goal = models.TextField(max_length=1000)
    action = models.TextField(max_length=1000)
    result = models.TextField(max_length=1000, blank=True)
    feedback = models.TextField(max_length=1000, blank=True)