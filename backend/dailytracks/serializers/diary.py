from rest_framework import serializers
from dailytracks.models import Diary

class DiarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Diary
        fields = "__all__"
        read_only_fields = ["id", "created_at", "user"]