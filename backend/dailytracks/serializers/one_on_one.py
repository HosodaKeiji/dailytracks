from rest_framework import serializers
from dailytracks.models import OneOnOne

class OneOnOneSerializer(serializers.ModelSerializer):
    class Meta:
        model = OneOnOne
        fields = "__all__"
        read_only_fields = ["id", "created_at", "updated_at", "user"]
