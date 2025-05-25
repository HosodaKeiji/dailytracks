# dailytracks/views/diary.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from dailytracks.serializers.diary import DiarySerializer
from dailytracks.models.diary import Diary

class DiaryCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = DiarySerializer(data = request.data)
        if serializer.is_valid():
            serializer.save(user = request.user) #userはリクエストユーザー
            return Response(serializer.data, status = status.HTTP_201_CREATED)
        return Response(serializer.errors, status = status.HTTP_400_BAD_REQUEST)
    
class DiaryListView(APIView):
    Permission_classes = [IsAuthenticated]

    def get(self, request):
        diaries = Diary.objects.filter(user = request.user).order_by("-created_at")
        serializer = DiarySerializer(diaries, many = True)
        return Response(serializer.data)

class DiaryLatestView(APIView):
    permission = [IsAuthenticated]

    def get(self, request):
        latest_diary = Diary.objects.filter(user = request.user).order_by("-created_at").first()
        if latest_diary:
            serializer = DiarySerializer(latest_diary)
            return Response(serializer.data)
        return Response({"Error": "日記が見つかりませんでした"}, status = 404)