from django.urls import path
from . import views

urlpatterns = [
    path('hello/', views.hello, name='hello'),
    path('login/', views.login, name='login'),
    path('logout/', views.logout, name='logout'),
    path('register/', views.register, name='register'),
    path('user/', views.get_user, name='get_user'),
    path('roles/', views.list_roles, name='list_roles'),
]
