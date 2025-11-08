import os
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application
import game_module.routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'smarthack2025.settings')

django_asgi_app = get_asgi_application()

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": URLRouter(
        game_module.routing.websocket_urlpatterns
    ),
})
