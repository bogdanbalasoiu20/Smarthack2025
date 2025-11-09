from rest_framework.permissions import BasePermission


class IsAdminManager(BasePermission):
    """
    Allows access only to staff / superusers / members of the ADMIN group.
    Used for management dashboards where only administrators should mutate data.
    """

    message = 'You need administrator permissions to perform this action.'

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if user.is_superuser or user.is_staff:
            return True
        return user.groups.filter(name='ADMIN').exists()
