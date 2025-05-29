from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class OneOnOne(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    date = models.DateField()
    consultation = models.TextField(max_length=1000)
    last_action = models.TextField(max_length=1000)
    feedback = models.TextField(max_length=1000, blank=True)
    next_action = models.TextField(max_length=1000, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user', 'date'], name='unique_user_date')
        ]