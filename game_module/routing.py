from django.urls import re_path
from .consumers import GameConsumer

websocket_urlpatterns = [
    # Mapează o conexiune WebSocket la GameConsumer, capturând PIN-ul
    re_path(r'ws/game/(?P<pin>\w+)/$', GameConsumer.as_asgi()),
]