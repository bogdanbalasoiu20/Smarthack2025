"""
Views și ViewSets pentru modulul de prezentări
"""
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.contrib.auth.models import User
from django.utils import timezone
import json
import secrets

from .models import (
    BrandKit, Asset, PresentationTemplate, Presentation, PresentationAccess,
    Frame, FrameConnection, Element, Comment, PresentationVersion, Recording
)
from .presentation_serializers import (
    BrandKitSerializer, AssetSerializer, PresentationTemplateSerializer,
    PresentationSerializer, PresentationMinimalSerializer, PresentationAccessSerializer,
    FrameSerializer, FrameMinimalSerializer, FrameConnectionSerializer,
    ElementSerializer, CommentSerializer, PresentationVersionSerializer,
    RecordingSerializer, UserMinimalSerializer
)
from .ai_service import PresentationAIService


# ===== PERMISIUNI CUSTOM =====
class CanEditPresentation(permissions.BasePermission):
    """Verifică dacă user-ul poate edita prezentarea"""
    def has_object_permission(self, request, view, obj):
        # Owner poate face orice
        if isinstance(obj, Presentation):
            presentation = obj
        else:
            # Pentru Frame, Element, Comment etc.
            presentation = getattr(obj, 'presentation', None)
            if not presentation and hasattr(obj, 'frame'):
                presentation = obj.frame.presentation

        if not presentation:
            return False

        if presentation.owner == request.user:
            return True

        # Verifică access grants
        access = PresentationAccess.objects.filter(
            presentation=presentation,
            user=request.user,
            permission='EDITOR'
        ).first()

        return access is not None


class CanViewPresentation(permissions.BasePermission):
    """Verifică dacă user-ul poate vedea prezentarea"""
    def has_object_permission(self, request, view, obj):
        if isinstance(obj, Presentation):
            presentation = obj
        else:
            presentation = getattr(obj, 'presentation', None)
            if not presentation and hasattr(obj, 'frame'):
                presentation = obj.frame.presentation

        if not presentation:
            return False

        # Public
        if presentation.is_public:
            return True

        # Owner
        if presentation.owner == request.user:
            return True

        # Access grant (viewer sau editor)
        access = PresentationAccess.objects.filter(
            presentation=presentation,
            user=request.user
        ).first()

        return access is not None


# ===== BRAND KIT =====
class BrandKitViewSet(viewsets.ModelViewSet):
    serializer_class = BrandKitSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Brand kits din grupurile user-ului sau create de el
        return BrandKit.objects.filter(
            Q(group__in=user.groups.all()) | Q(created_by=user)
        ).distinct()


# ===== ASSET =====
class AssetViewSet(viewsets.ModelViewSet):
    serializer_class = AssetSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Asset.objects.filter(
            Q(group__in=user.groups.all()) | Q(uploaded_by=user)
        ).distinct()

    @action(detail=False, methods=['get'])
    def search(self, request):
        """Căutare assets după tags sau nume"""
        query = request.query_params.get('q', '')
        asset_type = request.query_params.get('type', None)

        qs = self.get_queryset()

        if query:
            qs = qs.filter(
                Q(name__icontains=query) | Q(tags__icontains=query)
            )

        if asset_type:
            qs = qs.filter(asset_type=asset_type)

        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)


# ===== PRESENTATION TEMPLATE =====
class PresentationTemplateViewSet(viewsets.ModelViewSet):
    serializer_class = PresentationTemplateSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return PresentationTemplate.objects.filter(
            Q(is_public=True) | Q(created_by=self.request.user)
        )

    @action(detail=False, methods=['get'])
    def by_category(self, request):
        """Filtrează template-uri după categorie"""
        category = request.query_params.get('category', None)
        qs = self.get_queryset()

        if category:
            qs = qs.filter(category=category)

        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)


# ===== PRESENTATION =====
class PresentationViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'list':
            return PresentationMinimalSerializer
        return PresentationSerializer

    def get_queryset(self):
        user = self.request.user
        # Prezentări owned, shared cu user-ul, sau din grupul lui
        return Presentation.objects.filter(
            Q(owner=user) |
            Q(access_grants__user=user) |
            Q(group__in=user.groups.all())
        ).distinct()

    @action(detail=True, methods=['post'])
    def duplicate(self, request, pk=None):
        """Duplică o prezentare"""
        original = self.get_object()
        self.check_object_permissions(request, original)

        # Creează copie
        new_presentation = Presentation.objects.create(
            title=f"{original.title} (Copy)",
            description=original.description,
            owner=request.user,
            group=original.group,
            brand_kit=original.brand_kit,
            canvas_settings=original.canvas_settings,
        )

        # Copiază frames
        frame_map = {}  # original_id -> new_frame
        for frame in original.frames.all():
            new_frame = Frame.objects.create(
                presentation=new_presentation,
                title=frame.title,
                position=frame.position,
                background_color=frame.background_color,
                background_image=frame.background_image,
                order=frame.order,
            )
            frame_map[frame.id] = new_frame

            # Copiază elements
            for element in frame.elements.all():
                Element.objects.create(
                    frame=new_frame,
                    element_type=element.element_type,
                    position=element.position,
                    content=element.content,
                    link_url=element.link_url,
                )

        # Actualizează presentation_path
        try:
            old_path = json.loads(original.presentation_path)
            new_path = [frame_map[fid].id for fid in old_path if fid in frame_map]
            new_presentation.presentation_path = json.dumps(new_path)
            new_presentation.save()
        except:
            pass

        serializer = PresentationSerializer(new_presentation, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def set_path(self, request, pk=None):
        """Setează traseul de prezentare"""
        presentation = self.get_object()
        self.check_object_permissions(request, presentation)

        frame_ids = request.data.get('frame_ids', [])
        presentation.presentation_path = json.dumps(frame_ids)
        presentation.save()

        return Response({'presentation_path': frame_ids})

    @action(detail=True, methods=['post'])
    def generate_share_token(self, request, pk=None):
        """Generează token de share pentru prezentare"""
        presentation = self.get_object()
        if presentation.owner != request.user:
            return Response({'error': 'Only owner can generate share token'},
                            status=status.HTTP_403_FORBIDDEN)

        presentation.share_token = secrets.token_urlsafe(32)
        presentation.save()

        return Response({'share_token': presentation.share_token})

    @action(detail=False, methods=['get'])
    def by_token(self, request):
        """Accesează prezentare prin share token"""
        token = request.query_params.get('token', '')
        presentation = get_object_or_404(Presentation, share_token=token)

        # Read-only prin token
        serializer = PresentationSerializer(presentation, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def export_json(self, request, pk=None):
        """Export prezentare ca JSON pentru offline"""
        presentation = self.get_object()
        self.check_object_permissions(request, presentation)

        serializer = PresentationSerializer(presentation, context={'request': request})
        data = serializer.data

        return Response({
            'presentation': data,
            'version': '1.0',
            'exported_at': timezone.now().isoformat()
        })

    @action(detail=True, methods=['post'])
    def create_version(self, request, pk=None):
        """Creează snapshot de versiune"""
        presentation = self.get_object()
        if presentation.owner != request.user:
            return Response({'error': 'Only owner can create versions'},
                            status=status.HTTP_403_FORBIDDEN)

        # Găsește următorul număr de versiune
        last_version = presentation.versions.first()
        next_version = (last_version.version_number + 1) if last_version else 1

        # Creează snapshot
        serializer = PresentationSerializer(presentation, context={'request': request})
        snapshot_data = json.dumps(serializer.data)

        version = PresentationVersion.objects.create(
            presentation=presentation,
            version_number=next_version,
            snapshot=snapshot_data,
            created_by=request.user,
            notes=request.data.get('notes', '')
        )

        version_serializer = PresentationVersionSerializer(version)
        return Response(version_serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get', 'post', 'delete'], permission_classes=[IsAuthenticated], url_path='collaborators')
    def collaborators(self, request, pk=None):
        """List/modify collaborators for a presentation"""
        presentation = self.get_object()

        if request.method == 'GET':
            serializer = PresentationAccessSerializer(
                presentation.access_grants.select_related('user', 'granted_by'),
                many=True,
                context={'request': request}
            )
            owner_payload = UserMinimalSerializer(presentation.owner).data
            return Response({
                'owner': owner_payload,
                'collaborators': serializer.data
            })

        if presentation.owner != request.user:
            return Response({'error': 'Only the owner can manage collaborators'},
                            status=status.HTTP_403_FORBIDDEN)

        if request.method == 'POST':
            email = (request.data.get('email') or '').strip()
            permission = (request.data.get('permission') or 'VIEWER').upper()
            if permission not in ['VIEWER', 'EDITOR']:
                permission = 'VIEWER'

            if not email:
                return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)

            user = User.objects.filter(
                Q(email__iexact=email) | Q(username__iexact=email)
            ).first()

            if not user:
                return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

            if user == presentation.owner:
                return Response({'error': 'Owner already has full access'}, status=status.HTTP_400_BAD_REQUEST)

            access, created = PresentationAccess.objects.update_or_create(
                presentation=presentation,
                user=user,
                defaults={
                    'permission': permission,
                    'granted_by': request.user,
                    'granted_at': timezone.now(),
                }
            )

            serializer = PresentationAccessSerializer(access, context={'request': request})
            return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

        # DELETE
        access_id = request.data.get('access_id')
        user_id = request.data.get('user_id')

        qs = PresentationAccess.objects.filter(presentation=presentation)
        if access_id:
            qs = qs.filter(id=access_id)
        elif user_id:
            qs = qs.filter(user_id=user_id)
        else:
            return Response({'error': 'access_id or user_id required'}, status=status.HTTP_400_BAD_REQUEST)

        deleted, _ = qs.delete()
        if not deleted:
            return Response({'error': 'Collaborator not found'}, status=status.HTTP_404_NOT_FOUND)

        return Response(status=status.HTTP_204_NO_CONTENT)


# ===== PRESENTATION ACCESS =====
class PresentationAccessViewSet(viewsets.ModelViewSet):
    serializer_class = PresentationAccessSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Access grants pentru prezentările user-ului
        return PresentationAccess.objects.filter(
            presentation__owner=user
        )

    def create(self, request, *args, **kwargs):
        """Adaugă acces pentru un user"""
        presentation_id = request.data.get('presentation')
        presentation = get_object_or_404(Presentation, id=presentation_id)

        if presentation.owner != request.user:
            return Response({'error': 'Only owner can grant access'},
                            status=status.HTTP_403_FORBIDDEN)

        return super().create(request, *args, **kwargs)


# ===== FRAME =====
class FrameViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, CanEditPresentation]

    def get_serializer_class(self):
        if self.action == 'list':
            return FrameMinimalSerializer
        return FrameSerializer

    def get_queryset(self):
        presentation_id = self.request.query_params.get('presentation_id')
        if presentation_id:
            return Frame.objects.filter(presentation_id=presentation_id)
        return Frame.objects.none()

    @action(detail=True, methods=['post'])
    def duplicate(self, request, pk=None):
        """Duplică un frame"""
        original = self.get_object()
        self.check_object_permissions(request, original)

        new_frame = Frame.objects.create(
            presentation=original.presentation,
            title=f"{original.title} (Copy)",
            position=original.position,
            background_color=original.background_color,
            background_image=original.background_image,
            order=original.order + 1,
        )

        # Copiază elements
        for element in original.elements.all():
            Element.objects.create(
                frame=new_frame,
                element_type=element.element_type,
                position=element.position,
                content=element.content,
                link_url=element.link_url,
            )

        serializer = FrameSerializer(new_frame)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


# ===== ELEMENT =====
class ElementViewSet(viewsets.ModelViewSet):
    serializer_class = ElementSerializer
    permission_classes = [IsAuthenticated, CanEditPresentation]

    def get_queryset(self):
        frame_id = self.request.query_params.get('frame_id')
        user = self.request.user

        base_qs = Element.objects.filter(
            Q(frame__presentation__owner=user) |
            Q(frame__presentation__access_grants__user=user) |
            Q(frame__presentation__is_public=True)
        ).distinct()

        if frame_id:
            base_qs = base_qs.filter(frame_id=frame_id)

        return base_qs


# ===== FRAME CONNECTION =====
class FrameConnectionViewSet(viewsets.ModelViewSet):
    serializer_class = FrameConnectionSerializer
    permission_classes = [IsAuthenticated, CanEditPresentation]

    def get_queryset(self):
        presentation_id = self.request.query_params.get('presentation_id')
        if presentation_id:
            return FrameConnection.objects.filter(
                from_frame__presentation_id=presentation_id
            )
        return FrameConnection.objects.none()


# ===== COMMENT =====
class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated, CanViewPresentation]

    def get_queryset(self):
        presentation_id = self.request.query_params.get('presentation_id')
        if presentation_id:
            return Comment.objects.filter(presentation_id=presentation_id)
        return Comment.objects.none()

    @action(detail=True, methods=['post'])
    def resolve(self, request, pk=None):
        """Marchează comentariu ca rezolvat"""
        comment = self.get_object()
        comment.is_resolved = True
        comment.save()
        serializer = self.get_serializer(comment)
        return Response(serializer.data)


# ===== RECORDING =====
class RecordingViewSet(viewsets.ModelViewSet):
    serializer_class = RecordingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Recording.objects.filter(created_by=user)

    @action(detail=True, methods=['post'])
    def generate_share_token(self, request, pk=None):
        """Generează token de share pentru recording"""
        recording = self.get_object()
        recording.share_token = secrets.token_urlsafe(32)
        recording.save()
        return Response({'share_token': recording.share_token})


# ===== AI ENDPOINTS =====
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def ai_generate_presentation(request):
    """
    Generează structură de prezentare folosind AI.

    Input:
    {
        "title": "...",
        "purpose": "...",
        "audience": "...",
        "duration": 10  # minute
    }

    Output:
    {
        "frames": [
            {
                "title": "...",
                "content": "...",
                "layout_suggestion": "title-center" | "title-left-content-right" etc.
            }
        ]
    }
    """
    title = request.data.get('title', '')
    purpose = request.data.get('purpose', '')
    audience = request.data.get('audience', '')
    duration = request.data.get('duration', 10)

    # TODO: Integrare cu AI_CLIENT extern
    # Deocamdată returnăm structură mockup

    prompt = f"""
    Creează o structură de prezentare pentru:
    Titlu: {title}
    Scop: {purpose}
    Audiență: {audience}
    Durată: {duration} minute

    Returnează JSON cu frames și conținut sugerat.
    """

    # MOCK RESPONSE - va fi înlocuit cu apel real AI
    mock_frames = [
        {
            "title": "Introducere",
            "content": f"Bun venit la {title}",
            "layout_suggestion": "title-center"
        },
        {
            "title": "Context",
            "content": f"Context relevant pentru {audience}",
            "layout_suggestion": "title-left-content-right"
        },
        {
            "title": "Concluzii",
            "content": "Rezumat și pași următori",
            "layout_suggestion": "title-center"
        }
    ]

    return Response({
        'frames': mock_frames,
        'prompt_used': prompt
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def ai_rewrite_text(request):
    """
    Rescrie text cu AI.

    Input:
    {
        "text": "...",
        "mode": "shorter" | "longer" | "professional" | "casual"
    }
    """
    text = request.data.get('text', '')
    mode = request.data.get('mode', 'professional')

    # TODO: Integrare AI_CLIENT
    prompt = f"Rescrie următorul text într-un stil {mode}: {text}"

    # MOCK
    mock_result = f"[{mode.upper()}] {text}"

    return Response({
        'original': text,
        'rewritten': mock_result,
        'mode': mode
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def ai_suggest_visuals(request):
    """
    Sugerează imagini/icoane pentru un text.

    Input:
    {
        "text": "..."
    }

    Output:
    {
        "suggestions": [
            {"type": "icon", "keyword": "chart", "relevance": 0.9},
            {"type": "image", "keyword": "business meeting", "relevance": 0.8}
        ]
    }
    """
    text = request.data.get('text', '')

    # TODO: AI_CLIENT
    # MOCK
    suggestions = [
        {"type": "icon", "keyword": "presentation", "relevance": 0.9},
        {"type": "image", "keyword": "teamwork", "relevance": 0.7}
    ]

    return Response({'suggestions': suggestions})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def ai_generate_full_presentation(request):
    """
    Generate a complete presentation from a user prompt using AI.

    Input:
    {
        "prompt": "Create a presentation about climate change solutions",
        "num_slides": 7  // optional
    }

    Output:
    {
        "presentation_id": 123,
        "title": "Climate Change Solutions",
        "num_frames": 7,
        "message": "Presentation generated successfully"
    }
    """
    prompt = request.data.get('prompt', '').strip()
    num_slides = request.data.get('num_slides', None)

    if not prompt:
        return Response(
            {'error': 'Prompt is required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        # Initialize AI service
        ai_service = PresentationAIService()

        # Generate presentation structure
        presentation_data = ai_service.generate_presentation_structure(
            prompt=prompt,
            num_slides=num_slides
        )

        # Create presentation in database
        now = timezone.now()
        presentation = Presentation.objects.create(
            owner=request.user,
            title=presentation_data['title'],
            description=presentation_data.get('description', ''),
            canvas_settings=json.dumps({
                'zoom': 1.0,
                'viewport': {'x': 0, 'y': 0},
                'background': '#ffffff'
            }),
            presentation_path=json.dumps([]),
            share_token=secrets.token_urlsafe(32),
            is_public=0,
            thumbnail_url='',
            created_at=now,
            updated_at=now
        )

        # Create frames and elements
        frame_ids = []
        for frame_data in presentation_data['frames']:
            # Create frame
            frame = Frame.objects.create(
                presentation=presentation,
                title=frame_data.get('title', f"Slide {frame_data['order'] + 1}"),
                order=frame_data['order'],
                background_color=frame_data.get('background_color', '#ffffff'),
                background_image='',
                position=json.dumps({
                    'x': 0,
                    'y': 0,
                    'width': 1920,
                    'height': 1080,
                    'rotation': 0
                }),
                transition_settings=json.dumps({
                    'type': 'fade',
                    'duration': 0.8,
                    'delay': 0,
                    'direction': 'none'
                }),
                thumbnail_url='',
                created_at=now,
                updated_at=now
            )

            frame_ids.append(frame.id)

            # Create elements for this frame
            for element_data in frame_data.get('elements', []):
                Element.objects.create(
                    frame=frame,
                    element_type=element_data['type'],
                    position=json.dumps(element_data['position']),
                    content=json.dumps(element_data['content']),
                    animation_settings=json.dumps({
                        'type': 'fade',
                        'duration': 0.8,
                        'delay': 0,
                        'easing': 'easeInOut',
                        'direction': 'up'
                    }),
                    link_url='',
                    created_at=now,
                    updated_at=now
                )

        # Update presentation path with frame IDs
        presentation.presentation_path = json.dumps(frame_ids)
        presentation.save()

        return Response({
            'presentation_id': presentation.id,
            'title': presentation.title,
            'num_frames': len(frame_ids),
            'message': 'Presentation generated successfully'
        }, status=status.HTTP_201_CREATED)

    except ValueError as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        return Response(
            {'error': f'Failed to generate presentation: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# ===== EXPORT PDF/IMAGES =====
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def export_presentation_pdf(request, presentation_id):
    """
    Export prezentare ca PDF.
    TODO: Implementare cu librărie PDF (ex: WeasyPrint, ReportLab)
    """
    presentation = get_object_or_404(Presentation, id=presentation_id)

    # Verifică permisiuni
    if presentation.owner != request.user:
        access = PresentationAccess.objects.filter(
            presentation=presentation,
            user=request.user
        ).first()
        if not access:
            return Response({'error': 'No access'}, status=status.HTTP_403_FORBIDDEN)

    # TODO: Generare PDF real
    # Deocamdată returnăm placeholder

    return Response({
        'status': 'processing',
        'message': 'PDF generation in progress',
        'download_url': f'/api/presentations/{presentation_id}/download/pdf/'
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def export_presentation_images(request, presentation_id):
    """
    Export frames ca imagini (thumbnails).
    TODO: Implementare cu screenshot/rendering
    """
    presentation = get_object_or_404(Presentation, id=presentation_id)

    # Verifică permisiuni (similar cu PDF)

    return Response({
        'status': 'processing',
        'message': 'Image export in progress',
        'images': []
    })
