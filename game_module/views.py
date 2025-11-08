from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import Game, GameSession
from .serializers import GameSerializer, GameSessionSerializer

class GameViewSet(viewsets.ModelViewSet):
    queryset = Game.objects.all()
    serializer_class = GameSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(host=self.request.user)

    @action(detail=True, methods=['post'])
    def create_session(self, request, pk=None):
        game = self.get_object()
        
        session = GameSession.objects.create(
            game=game,
            host=self.request.user,
            status='lobby'
        )

        return Response(
            GameSessionSerializer(session).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=False, methods=['post'])
    def start_game(self, request):
        session_id = request.data.get('session_id') 
        if not session_id:
             return Response({"detail": "session_id is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            session = GameSession.objects.get(id=session_id)
        except GameSession.DoesNotExist:
            return Response({"detail": "Session not found."}, status=status.HTTP_404_NOT_FOUND)

        
        if session.host != request.user:
            return Response({"detail": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

        session.status = 'running'
        session.save()
        
        channel_layer = get_channel_layer()
        group_name = f'game_{session.pin}'
        
        async_to_sync(channel_layer.group_send)(
            group_name,
            {
                'type': 'game.start',
                'game_id': session.game.id,
                'session_id': session.id,
            }
        )
        return Response({"message": "Game started successfully!", "pin": session.pin})