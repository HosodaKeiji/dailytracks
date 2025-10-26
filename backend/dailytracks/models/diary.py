from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Diary(models.Model):
    MOOD_CHOICES = [
        (1, '絶不調'),
        (2, '不調'),
        (3, '普通'),
        (4, '良好'),
        (5, '絶好調'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField(max_length=1000)
    mood = models.IntegerField(choices=MOOD_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} : {self.created_at}"
