"""
ASGI config pentru smarthack2025 cu suport Django Channels.
"""
import os

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "smarthack2025.settings")

from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application

django_asgi_app = get_asgi_application()

from api import routing as api_routing  # noqa: E402
from game_module import routing as game_routing  # noqa: E402

websocket_urlpatterns = (
    list(api_routing.websocket_urlpatterns)
    + list(game_routing.websocket_urlpatterns)
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
