# dailytracks/views/pdca.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from dailytracks.serializers.pdca import PdcaSerializer
from dailytracks.models.pdca import Pdca

class PdcaCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = PdcaSerializer(data = request.data)
        if serializer.is_valid():
            serializer.save(user = request.user)
            return Response(serializer.data, status = status.HTTP_201_CREATED)
        return Response(serializer.errors, status = status.HTTP_400_BAD_REQUEST)
    
class PdcaListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        pdcas = Pdca.objects.filter(user = request.user).order_by("updated_at")
        serializer = PdcaSerializer(pdcas, many = True)
        return Response(serializer.data)

class PdcaLatestView(APIView):
    permission = [IsAuthenticated]

    def get(self, request):
        latest_pdca = Pdca.objects.filter(user = request.user).order_by("-updated_at").first()
        if latest_pdca:
            serializer = PdcaSerializer(latest_pdca)
            return Response(serializer.data)
        return Response({"Error": "PDCAが見つかりませんでした"}, status = 404)