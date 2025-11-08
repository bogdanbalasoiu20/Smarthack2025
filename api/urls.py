from django.urls import path, include
from . import views

urlpatterns = [
    # Auth endpoints
    path('hello/', views.hello, name='hello'),
    path('login/', views.login, name='login'),
    path('logout/', views.logout, name='logout'),
    path('register/', views.register, name='register'),
    path('user/', views.get_user, name='get_user'),
    path('roles/', views.list_roles, name='list_roles'),
    # Presentation endpoints (mounted at root level to match /api/presentations/)
    path('', include('api.presentation_urls')),
]
