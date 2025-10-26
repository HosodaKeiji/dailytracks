from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.shortcuts import get_object_or_404
from dailytracks.serializers.goal_setting import GoalSettingSerializer, GoalActionPairSerializer
from dailytracks.models.gola_setting import GoalSetting

class GoalSettingCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = GoalSettingSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class GoalSettingListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        goalSettings = GoalSetting.objects.filter(user = request.user).order_by('-month')
        serializer = GoalSettingSerializer(goalSettings, many=True)
        return Response(serializer.data)


class GoalSettingLatestView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        latest_goalSetting = GoalSetting.objects.filter(user = request.user).order_by('-month').first()
        if latest_goalSetting:
            serializer = GoalSettingSerializer(latest_goalSetting)
            return Response(serializer.data)
        return Response({"error": "目標設定が見つかりませんでした"}, status = 404)


class GoalSettingDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk, user):
        return get_object_or_404(GoalSetting, pk=pk, user=user)

    def get(self, request, pk):
        goalSetting = self.get_object(pk, request.user)
        serializer = GoalSettingSerializer(goalSetting)
        return Response(serializer.data)

    def put(self, request, pk):
        goalSetting = self.get_object(pk, request.user)
        serializer = GoalSettingSerializer(goalSetting, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
