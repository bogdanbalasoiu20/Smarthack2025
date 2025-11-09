from django.urls import path, include
from rest_framework.routers import DefaultRouter

from . import views
from .management_views import (
    ManagementUserViewSet,
    StudentGroupViewSet,
    StudentViewSet,
)

router = DefaultRouter()
router.register(r'management/users', ManagementUserViewSet, basename='management-users')
router.register(r'management/students', StudentViewSet, basename='management-students')
router.register(
    r'management/student-groups',
    StudentGroupViewSet,
    basename='management-student-groups',
)

urlpatterns = [
    # Auth endpoints
    path('hello/', views.hello, name='hello'),
    path('login/', views.login, name='login'),
    path('logout/', views.logout, name='logout'),
    path('register/', views.register, name='register'),
    path('user/', views.get_user, name='get_user'),
    path('roles/', views.list_roles, name='list_roles'),
    # Management endpoints
    path('', include(router.urls)),
    # Presentation endpoints (mounted at root level to match /api/presentations/)
    path('', include('api.presentation_urls')),
]
