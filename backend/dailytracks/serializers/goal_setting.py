from rest_framework import serializers
from dailytracks.models import GoalSetting, GoalActionPair

class GoalActionPairSerializer(serializers.ModelSerializer):
    class Meta:
        model = GoalActionPair
        fields = "__all__"
        extra_kwargs = {
            'goal_setting': {'required': False},
            "result": {"required": False},
            "feedback": {"required": False},
        }

class GoalSettingSerializer(serializers.ModelSerializer):
    goal_actions = GoalActionPairSerializer(many=True, required=False)

    class Meta:
        model = GoalSetting
        fields = "__all__"
        read_only_fields = ["id", "created_at", "updated_at", "user"]

    def create(self, validated_data):
        goal_actions_data = validated_data.pop("goal_actions", [])
        goal_setting = GoalSetting.objects.create(**validated_data)
        for pair_data in goal_actions_data:
            GoalActionPair.objects.create(goal_setting=goal_setting, **pair_data)
        return goal_setting
    
    def update(self, instance, validated_data):
        goal_actions_data = validated_data.pop('goal_actions', None)

        # GoalSettingのフィールドを更新
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if goal_actions_data is not None:
            # 既存のgoal_actionsをすべて削除
            instance.goal_actions.all().delete()
            # 新しいgoal_actionsを追加
            for pair_data in goal_actions_data:
                # goal_settingがあれば削除
                pair_data.pop('goal_setting', None)
                GoalActionPair.objects.create(goal_setting=instance, **pair_data)

        return instance
