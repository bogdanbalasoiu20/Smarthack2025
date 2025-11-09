from django.contrib.auth.models import User
from django.db.models import Q
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import Student, StudentGroup
from .permissions import IsAdminManager
from .serializers import (
    ManagementUserSerializer,
    StudentGroupSerializer,
    StudentSerializer,
)


class ManagementUserViewSet(viewsets.ModelViewSet):
    """
    CRUD endpoints for administrator user management dashboard.
    """

    serializer_class = ManagementUserSerializer
    permission_classes = [IsAuthenticated, IsAdminManager]

    def get_queryset(self):
        queryset = User.objects.all().order_by('id')
        role = self.request.query_params.get('role')
        search = self.request.query_params.get('search')

        if role:
            queryset = queryset.filter(groups__name=role)
        if search:
            queryset = queryset.filter(
                Q(username__icontains=search)
                | Q(first_name__icontains=search)
                | Q(last_name__icontains=search)
                | Q(email__icontains=search)
            )
        return queryset.distinct()


class StudentGroupViewSet(viewsets.ModelViewSet):
    """
    Manage student cohorts / classes so the frontend can populate dropdowns.
    """

    queryset = StudentGroup.objects.all().order_by('name')
    serializer_class = StudentGroupSerializer
    permission_classes = [IsAuthenticated, IsAdminManager]
    lookup_field = 'slug'


class StudentViewSet(viewsets.ModelViewSet):
    """
    CRUD endpoints for the dedicated student management view.
    """

    serializer_class = StudentSerializer
    permission_classes = [IsAuthenticated, IsAdminManager]

    def get_queryset(self):
        queryset = (
            Student.objects.select_related('group', 'user')
            .all()
            .order_by('last_name', 'first_name')
        )

        group_slug = self.request.query_params.get('group')
        search = self.request.query_params.get('search')

        if group_slug:
            queryset = queryset.filter(group__slug=group_slug)
        if search:
            queryset = queryset.filter(
                Q(first_name__icontains=search)
                | Q(last_name__icontains=search)
                | Q(email__icontains=search)
            )
        return queryset
