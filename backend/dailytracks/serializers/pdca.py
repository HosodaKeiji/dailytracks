from rest_framework import serializers
from dailytracks.models import Pdca

class PdcaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pdca
        fields = "__all__"
        read_only_fields = ["id", "created_at", "updated_at", "user"]
