"""
Custom WebSocket authentication middleware for Token authentication.
"""
from channels.db import database_sync_to_async
from channels.middleware import BaseMiddleware
from django.contrib.auth.models import AnonymousUser
from rest_framework.authtoken.models import Token
from urllib.parse import parse_qs


@database_sync_to_async
def get_user_from_token(token_key):
    """Get user from token key."""
    try:
        token = Token.objects.select_related('user').get(key=token_key)
        return token.user
    except Token.DoesNotExist:
        return AnonymousUser()


class TokenAuthMiddleware(BaseMiddleware):
    """
    Custom middleware to authenticate WebSocket connections using Token authentication.

    The token can be passed in the query string as: ?token=YOUR_TOKEN_HERE
    """

    async def __call__(self, scope, receive, send):
        # Get query string
        query_string = scope.get('query_string', b'').decode()
        query_params = parse_qs(query_string)

        # Try to get token from query string
        token_key = query_params.get('token', [None])[0]

        if token_key:
            # Get user from token
            scope['user'] = await get_user_from_token(token_key)
        else:
            # No token provided, user is anonymous
            scope['user'] = AnonymousUser()

        return await super().__call__(scope, receive, send)


def TokenAuthMiddlewareStack(inner):
    """
    Middleware stack that includes token authentication.
    """
    return TokenAuthMiddleware(inner)
