"""
URL routing pentru modulul de prezentări
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .presentation_views import (
    BrandKitViewSet, AssetViewSet, PresentationTemplateViewSet,
    PresentationViewSet, PresentationAccessViewSet,
    FrameViewSet, FrameConnectionViewSet, ElementViewSet,
    CommentViewSet, RecordingViewSet,
    ai_generate_presentation, ai_rewrite_text, ai_suggest_visuals,
    ai_get_slide_advice, ai_generate_full_presentation,
    export_presentation_pdf, export_presentation_images
)

router = DefaultRouter()
router.register(r'brand-kits', BrandKitViewSet, basename='brandkit')
router.register(r'assets', AssetViewSet, basename='asset')
router.register(r'templates', PresentationTemplateViewSet, basename='template')
router.register(r'presentations', PresentationViewSet, basename='presentation')
router.register(r'access', PresentationAccessViewSet, basename='access')
router.register(r'frames', FrameViewSet, basename='frame')
router.register(r'frame-connections', FrameConnectionViewSet, basename='frameconnection')
router.register(r'elements', ElementViewSet, basename='element')
router.register(r'comments', CommentViewSet, basename='comment')
router.register(r'recordings', RecordingViewSet, basename='recording')

urlpatterns = [
    # Router URLs
    path('', include(router.urls)),

    # AI endpoints
    path('ai/generate/', ai_generate_presentation, name='ai-generate'),
    path('ai/generate-full/', ai_generate_full_presentation, name='ai-generate-full'),
    path('ai/rewrite/', ai_rewrite_text, name='ai-rewrite'),
    path('ai/suggest-visuals/', ai_suggest_visuals, name='ai-suggest-visuals'),
    path('ai/slide-advice/', ai_get_slide_advice, name='ai-slide-advice'),

    # Export endpoints
    path('presentations/<int:presentation_id>/export/pdf/', export_presentation_pdf, name='export-pdf'),
    path('presentations/<int:presentation_id>/export/images/', export_presentation_images, name='export-images'),
]
