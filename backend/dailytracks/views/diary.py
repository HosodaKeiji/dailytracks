# dailytracks/views/diary.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from dailytracks.serializers.diary import DiarySerializer

class DiaryCreateView(APIView):
    Permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = DiarySerializer(data = request.data)
        if serializer.is_valid():
            serializer.save(user = request.user) #userはリクエストユーザー
            return Response(serializer.data, status = status.HTTP_201_CREATED)
        return Response(serializer.errors, status = status.HTTP_400_BAD_REQUEST)