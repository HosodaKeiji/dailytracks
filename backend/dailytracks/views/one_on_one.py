# dailytracks/views/oneOnOne.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.shortcuts import get_object_or_404
from dailytracks.serializers.one_on_one import OneOnOneSerializer
from dailytracks.models.one_on_one import OneOnOne
from django.db import IntegrityError

class OneOnOneCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = OneOnOneSerializer(data = request.data)
        if serializer.is_valid():
            try:
                serializer.save(user = request.user)
                return Response(serializer.data, status = status.HTTP_201_CREATED)
            except IntegrityError:
                    return Response(
                        {"non_field_errors": ["同じ日付のOneOnOneは既に存在します。"]},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
        return Response(serializer.errors, status = status.HTTP_400_BAD_REQUEST)
    
class OneOnOneListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        oneOnOnes = OneOnOne.objects.filter(user = request.user).order_by("-date")
        serializer = OneOnOneSerializer(oneOnOnes, many = True)
        return Response(serializer.data)

class OneOnOneLatestView(APIView):
    permission = [IsAuthenticated]

    def get(self, request):
        latest_oneOnOne = OneOnOne.objects.filter(user = request.user).order_by("-date").first()
        if latest_oneOnOne:
            serializer = OneOnOneSerializer(latest_oneOnOne)
            return Response(serializer.data)
        return Response({"Error": "OneOnOneが見つかりませんでした"}, status = 404)

class OneOnOneDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk, user):
        # ユーザーに紐づいたレポートのみ取得可能に
        return get_object_or_404(OneOnOne, pk=pk, user=user)

    def get(self, request, pk):
        oneOnOne = self.get_object(pk, request.user)
        serializer = OneOnOneSerializer(oneOnOne)
        return Response(serializer.data)

    def put(self, request, pk):
        oneOnOne = self.get_object(pk, request.user)
        serializer = OneOnOneSerializer(oneOnOne, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
