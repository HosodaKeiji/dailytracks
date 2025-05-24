from rest_framework import serializers
from dailytracks.models import Diary

class DiarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Diary
        fields = ["id", "content", "mood", "created_at"]
        read_only_fields = ["id", "created_at"]