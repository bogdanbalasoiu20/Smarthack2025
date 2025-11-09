from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import GameViewSet

router = DefaultRouter()
router.register(r'', GameViewSet, basename='game')

urlpatterns = [
    path('', include(router.urls)),
    
    path('session-leaderboard/', GameViewSet.as_view({'get': 'session_leaderboard'}), name='session-leaderboard'),
    path('session-results/', GameViewSet.as_view({'get': 'session_results'}), name='session-results'),
]
