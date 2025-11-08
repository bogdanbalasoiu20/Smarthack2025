from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'presentations', views.PresentationViewSet, basename='presentation')
router.register(r'frames', views.FrameViewSet, basename='frame')
router.register(r'elements', views.ElementViewSet, basename='element')
router.register(r'comments', views.CommentViewSet, basename='comment')
router.register(r'access-control', views.AccessControlViewSet, basename='access-control')

urlpatterns = [
    path('hello/', views.hello, name='hello'),
    path('login/', views.login, name='login'),
    path('logout/', views.logout, name='logout'),
    path('register/', views.register, name='register'),
    path('user/', views.get_user, name='get_user'),
    path('', include(router.urls)),
]
