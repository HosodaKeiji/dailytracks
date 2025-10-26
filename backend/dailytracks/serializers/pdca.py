from rest_framework import serializers
from dailytracks.models import Pdca
from rest_framework.validators import UniqueTogetherValidator

class PdcaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pdca
        fields = "__all__"
        read_only_fields = ["id", "created_at", "updated_at", "user"]
    
    review = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    action = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    feedback = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    
    def validate(self, data):
        """ユーザーと週日付のユニーク性チェック（更新時は自身を除外）"""
        user = self.context["request"].user  # ← context に request を渡す必要あり
        week_date = data.get("week_date")

        # インスタンス（更新時のみ存在）
        instance = getattr(self, "instance", None)

        # 同じ user & week_date のレコードが存在するか（自身を除外）
        query_set = Pdca.objects.filter(user=user, week_date=week_date)
        if instance:
            query_set = query_set.exclude(pk=instance.pk)

        if query_set.exists():
            raise serializers.ValidationError("この週のPDCAは既に存在します。")

        return data
