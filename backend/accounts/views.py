from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.authtoken.models import Token
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .serializers import LoginSerializer, UserSerializer, SignupSerializer, UsernameChangeSerializer, PasswordChangeSerializer
from .models import User

class LoginView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                "token": token.key,
                "user": UserSerializer(user).data
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SignupView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = SignupSerializer

class UsernameChangeView(APIView):
    def post(self, request):
        serializer = UsernameChangeSerializer(data=request.data)
        if serializer.is_valid():
            new_username = serializer.validated_data['username']
            request.user.username = new_username
            request.user.save()
            return Response({
                "message": "ユーザー名を変更しました",
                "user": {
                    "id": request.user.id,
                    "username": request.user.username,
                }
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class PasswordChangeView(APIView):
    def post(self, request):
        serializer = PasswordChangeSerializer(data=request.data)
        if serializer.is_valid():
            new_password = serializer.validated_data['password']
            try:
                validate_password(new_password, request.user)
                request.user.set_password(new_password)
                request.user.save()
                return Response({"message": "パスワードを変更しました"})
            except ValidationError as e:
                return Response({"error": e.messages}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)