from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.db import models as django_models
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authtoken.models import Token
from rest_framework import status, viewsets
from .serializers import (
    LoginSerializer, UserSerializer, RegisterSerializer,
    PresentationListSerializer, PresentationDetailSerializer,
    FrameSerializer, ElementSerializer, CommentSerializer,
    AccessControlEntrySerializer
)
from django.contrib.auth.models import User
from .models import (
    Presentation, Frame, Element, Comment, AccessControlEntry
)


@api_view(['GET'])
def hello(request):
    return Response({"message": "Zona Prezentări API"})


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """Login endpoint that returns a token for authenticated users"""
    print("=== LOGIN DEBUG ===")
    print("Request data:", request.data)

    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        user_serializer = UserSerializer(user)

        print("Login successful for:", user.email)
        return Response({
            'token': token.key,
            'user': user_serializer.data,
            'message': 'Login successful'
        }, status=status.HTTP_200_OK)

    print("Validation errors:", serializer.errors)
    error_message = 'Invalid credentials'
    if 'non_field_errors' in serializer.errors:
        error_message = serializer.errors['non_field_errors'][0]

    return Response({
        'message': error_message,
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    """Logout endpoint that deletes the user's token"""
    try:
        request.user.auth_token.delete()
        return Response({
            'message': 'Successfully logged out'
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'message': 'Something went wrong'
        }, status=status.HTTP_400_BAD_REQUEST)


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """Register endpoint that creates a new user and returns a token"""
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
    """Get current user details"""
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


class PresentationViewSet(viewsets.ModelViewSet):
    """ViewSet for Presentation CRUD operations"""
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'list':
            return PresentationListSerializer
        return PresentationDetailSerializer

    def get_queryset(self):
        user = self.request.user
        # Return presentations owned by user or shared with user
        return Presentation.objects.filter(
            django_models.Q(owner=user) |
            django_models.Q(access_entries__user=user) |
            django_models.Q(is_public=True)
        ).distinct()

    def perform_create(self, serializer):
        # Set default canvas config
        canvas_config = self.request.data.get('canvas_config', {
            'width': 10000,
            'height': 10000,
            'background': '#F5F5F5'
        })
        serializer.save(
            owner=self.request.user,
            canvas_config=canvas_config
        )

    @action(detail=True, methods=['post'])
    def duplicate(self, request, pk=None):
        """Duplicate a presentation"""
        original = self.get_object()

        # Create new presentation
        new_presentation = Presentation.objects.create(
            title=f"{original.title} (Copy)",
            description=original.description,
            owner=request.user,
            canvas_config=original.canvas_config,
            is_public=False
        )

        # Copy frames
        frame_map = {}
        for frame in original.frames.all():
            old_id = frame.id
            frame.pk = None
            frame.presentation = new_presentation
            frame.save()
            frame_map[str(old_id)] = frame

        # Copy elements
        for element in original.elements.all():
            element.pk = None
            element.presentation = new_presentation
            if element.frame_id:
                element.frame = frame_map.get(str(element.frame_id))
            element.save()

        serializer = PresentationDetailSerializer(new_presentation)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'])
    def presentation_route(self, request, pk=None):
        """Get ordered frame route for presentation mode"""
        presentation = self.get_object()
        frames = presentation.frames.order_by('order_index')
        route = FrameSerializer(frames, many=True).data
        return Response({'route': route})


class FrameViewSet(viewsets.ModelViewSet):
    """ViewSet for Frame CRUD operations"""
    serializer_class = FrameSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        presentation_id = self.request.query_params.get('presentation')
        if presentation_id:
            return Frame.objects.filter(presentation_id=presentation_id)
        return Frame.objects.none()

    def perform_create(self, serializer):
        presentation_id = self.request.data.get('presentation')
        # Get max order_index
        max_order = Frame.objects.filter(
            presentation_id=presentation_id
        ).aggregate(django_models.Max('order_index'))['order_index__max'] or -1

        serializer.save(order_index=max_order + 1)


class ElementViewSet(viewsets.ModelViewSet):
    """ViewSet for Element CRUD operations"""
    serializer_class = ElementSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        presentation_id = self.request.query_params.get('presentation')
        frame_id = self.request.query_params.get('frame')

        queryset = Element.objects.all()
        if presentation_id:
            queryset = queryset.filter(presentation_id=presentation_id)
        if frame_id:
            queryset = queryset.filter(frame_id=frame_id)
        return queryset

    @action(detail=False, methods=['post'])
    def bulk_update(self, request):
        """Bulk update multiple elements for performance"""
        updates = request.data.get('updates', [])

        if not updates:
            return Response({'error': 'No updates provided'},
                          status=status.HTTP_400_BAD_REQUEST)

        element_ids = [u['id'] for u in updates if 'id' in u]
        elements = Element.objects.filter(id__in=element_ids)

        update_map = {str(u['id']): u for u in updates}
        updated_elements = []

        for element in elements:
            update_data = update_map.get(str(element.id), {})
            for key, value in update_data.items():
                if key != 'id' and hasattr(element, key):
                    setattr(element, key, value)
            updated_elements.append(element)

        Element.objects.bulk_update(
            updated_elements,
            ['x', 'y', 'width', 'height', 'rotation', 'scale_x', 'scale_y',
             'z_index', 'content', 'style']
        )

        return Response({
            'updated': len(updated_elements),
            'message': f'Updated {len(updated_elements)} elements'
        })


class CommentViewSet(viewsets.ModelViewSet):
    """ViewSet for Comment operations"""
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        presentation_id = self.request.query_params.get('presentation')
        if presentation_id:
            return Comment.objects.filter(
                presentation_id=presentation_id,
                parent__isnull=True  # Only top-level comments
            )
        return Comment.objects.none()

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    @action(detail=True, methods=['post'])
    def resolve(self, request, pk=None):
        """Resolve a comment"""
        comment = self.get_object()
        comment.is_resolved = True
        comment.resolved_by = request.user
        from django.utils import timezone
        comment.resolved_at = timezone.now()
        comment.save()

        serializer = self.get_serializer(comment)
        return Response(serializer.data)


class AccessControlViewSet(viewsets.ModelViewSet):
    """ViewSet for managing presentation access"""
    serializer_class = AccessControlEntrySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        presentation_id = self.request.query_params.get('presentation')
        if presentation_id:
            # Only presentation owner can see access entries
            presentation = Presentation.objects.filter(
                id=presentation_id,
                owner=self.request.user
            ).first()
            if presentation:
                return AccessControlEntry.objects.filter(presentation=presentation)
        return AccessControlEntry.objects.none()

    def perform_create(self, serializer):
        serializer.save(granted_by=self.request.user)
