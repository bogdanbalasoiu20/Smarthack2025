from django.contrib.auth.backends import ModelBackend
from django.db.models import Q
from .models import User


class EmailOrUsernameBackend(ModelBackend):
    """
    Custom authentication backend that allows login with email or username
    """
    def authenticate(self, request, username=None, password=None, **kwargs):
        if username is None or password is None:
            return None

        try:
            # Try to find user by email or username
            user = User.objects.get(
                Q(username=username) | Q(email=username)
            )
        except User.DoesNotExist:
            # Run the default password hasher once to reduce timing
            # difference between existing and non-existing users
            User().set_password(password)
            return None
        except User.MultipleObjectsReturned:
            # If multiple users, try exact username match first
            user = User.objects.filter(username=username).first()
            if not user:
                return None

        if user.check_password(password) and self.user_can_authenticate(user):
            return user

        return None
