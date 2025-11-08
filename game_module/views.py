from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import Game, GameSession
from .serializers import GameSerializer, GameSessionSerializer
from .models import Game, GameSession, Player, Answer, Question
from .serializers import GameSerializer, GameSessionSerializer, PlayerSerializer

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
    
    
    @action(detail=False, methods=['get'])
    def session_leaderboard(self, request):
        """Afișează clasamentul curent/final al unei sesiuni, sortat după scor."""
        pin = request.query_params.get('pin')
        if not pin:
            return Response({"detail": "PIN is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            session = GameSession.objects.get(pin=pin)
        except GameSession.DoesNotExist:
            return Response({"detail": "Session not found."}, status=status.HTTP_404_NOT_FOUND)

        # Obține și sortează jucătorii
        players = Player.objects.filter(session=session).order_by('-score', '-streak', 'joined_at')
        
        serializer = PlayerSerializer(players, many=True)
        return Response({
            "session_pin": pin,
            "status": session.status,
            "leaderboard": serializer.data
        })


    @action(detail=False, methods=['get'])
    def session_results(self, request):
        """Afișează un raport detaliat al rezultatelor pentru o sesiune finalizată (analiză)."""
        session_id = request.query_params.get('session_id')
        if not session_id:
            return Response({"detail": "session_id is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            session = GameSession.objects.get(id=session_id)
        except GameSession.DoesNotExist:
            return Response({"detail": "Session not found."}, status=status.HTTP_404_NOT_FOUND)
        
        # Verificare Autorizare: Doar gazda trebuie să acceseze raportul detaliat
        if session.host != request.user:
            return Response({"detail": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

        # --- Logica de Analiză a Răspunsurilor ---
        
        answers = Answer.objects.filter(player__session=session).select_related('question')
        total_players = session.players.count()
        
        results = {}
        for q in session.game.questions.all().order_by('order'):
            q_answers = answers.filter(question=q)
            
            total_answers = q_answers.count()
            correct_answers = q_answers.filter(points_awarded__gt=0).count()
            
            results[q.id] = {
                'question_text': q.text,
                'total_answered': total_answers,
                'correct_count': correct_answers,
                # Calculează procentul de răspunsuri incorecte (indice de dificultate)
                'difficulty_index': f"{(total_answers - correct_answers) / total_answers * 100:.2f}%" if total_answers > 0 else "N/A",
                'unanswered_count': total_players - total_answers
            }
        
        return Response({
            'session_id': session.id,
            'game_title': session.game.title,
            'status': session.status,
            'analysis': results
        })