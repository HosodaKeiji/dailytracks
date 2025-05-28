from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Pdca(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    week_date = models.DateField(help_text="週の開始日（例: 月曜）")
    
    plan = models.TextField(max_length=1000)
    execution = models.TextField(max_length=1000)
    review = models.TextField(max_length=1000)
    action = models.TextField(max_length=1000)
    feedback = models.TextField(max_length=1000, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user', 'week_date'], name='unique_user_week')
        ]

