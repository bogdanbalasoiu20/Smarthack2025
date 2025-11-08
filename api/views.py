from django.views.decorators.csrf import csrf_exempt
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .constants import ROLE_CHOICES
from .serializers import LoginSerializer, RegisterSerializer, UserSerializer


@api_view(['GET'])
def hello(request):
    return Response({"message": "Merge apiu baieti"})


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """
    Login endpoint that returns a token for authenticated users.
    """
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        user_serializer = UserSerializer(user)

        return Response({
            'token': token.key,
            'user': user_serializer.data,
            'message': 'Login successful'
        }, status=status.HTTP_200_OK)

    return Response({
        'message': serializer.errors.get('non_field_errors', ['Invalid credentials'])[0]
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    """
    Logout endpoint that deletes the user's token.
    """
    token = getattr(request.user, 'auth_token', None)
    if token:
        token.delete()
    return Response({
        'message': 'Successfully logged out'
    }, status=status.HTTP_200_OK)


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """
    Register endpoint that creates a new user and returns a token.
    """
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        token = Token.objects.create(user=user)
        user_serializer = UserSerializer(user)

        return Response({
            'token': token.key,
            'user': user_serializer.data,
            'message': 'User created successfully'
        }, status=status.HTTP_201_CREATED)

    return Response({
        'message': 'Registration failed',
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user(request):
    """
    Get current user details.
    """
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def list_roles(request):
    """
    Returns all available roles so the frontend can populate dropdowns.
    """
    roles = [{'value': value, 'label': label} for value, label in ROLE_CHOICES]
    return Response({'roles': roles})
