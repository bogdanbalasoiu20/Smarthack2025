"""
ASGI config pentru smarthack2025 cu suport Django Channels.
"""
import os

from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application

import api.routing
import game_module.routing

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "smarthack2025.settings")

django_asgi_app = get_asgi_application()

websocket_urlpatterns = (
    list(api.routing.websocket_urlpatterns)
    + list(game_module.routing.websocket_urlpatterns)
)

application = ProtocolTypeRouter(
    {
        "http": django_asgi_app,
        "websocket": AuthMiddlewareStack(
            URLRouter(
                websocket_urlpatterns,
            )
        ),
    }
)
