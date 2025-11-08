from channels.generic.websocket import AsyncJsonWebsocketConsumer
from asgiref.sync import sync_to_async
from .models import GameSession, Player, Question, Answer, Choice
from .serializers import PlayerSerializer, QuestionSerializer
import json

class GameConsumer(AsyncJsonWebsocketConsumer):
    
    async def connect(self):
        self.pin = self.scope['url_route']['kwargs']['pin']
        self.group_name = f'game_{self.pin}'
        
        try:
            self.session = await sync_to_async(GameSession.objects.get)(pin=self.pin)
        except GameSession.DoesNotExist:
            await self.close()
            return

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive_json(self, content):
        action = content.get('action')
        
        if action == 'join':
            await self.handle_join(content.get('nickname'))
            
        elif action == 'answer':
            await self.handle_answer(content)

        elif action == 'host_next' and await self.is_host():
            await self.start_next_question()

    @sync_to_async
    def is_host(self):
        user = self.scope['user']
        if user.is_authenticated:
            return user == self.session.game.host
        return False

    @sync_to_async
    def handle_join(self, nickname):
        player, created = Player.objects.get_or_create(
            session=self.session,
            nickname=nickname,
            defaults={'user': self.scope['user'] if self.scope.get('user') and self.scope['user'].is_authenticated else None}
        )
        
        self.channel_layer.group_send(self.group_name, {
            'type': 'player.joined',
            'player_data': PlayerSerializer(player).data
        })

    @sync_to_async
    def handle_answer(self, content):
        try:
            player = Player.objects.get(session=self.session, nickname=content.get('nickname'))
            question = Question.objects.get(id=content.get('question_id'))
        except (Player.DoesNotExist, Question.DoesNotExist):
            return

        if Answer.objects.filter(player=player, question=question).exists():
            return
            
        time_taken = content.get('time_taken', 0)
        submitted_choice_id = content.get('choice_id')
        submitted_text = content.get('text_answer', None)
        
        is_correct = False
        if submitted_choice_id:
            try:
                choice = Choice.objects.get(id=submitted_choice_id, question=question)
                is_correct = choice.is_correct
            except Choice.DoesNotExist:
                pass
                
        points_awarded = self.calculate_score(is_correct, question.game.base_points, time_taken, question.time_limit)

        Answer.objects.create(
            player=player,
            question=question,
            choice_id=submitted_choice_id,
            submitted_answer_text=submitted_text,
            time_taken=time_taken,
            points_awarded=points_awarded
        )
        
        player.score += points_awarded
        player.streak = player.streak + 1 if is_correct else 0
        player.save()
        
        self.channel_layer.group_send(self.group_name, {
            'type': 'answer.received',
            'player_id': player.id
        })

    def calculate_score(self, is_correct, base_points, time_taken, time_limit):
        if not is_correct:
            return 0
        
        time_factor = max(0.1, (time_limit - time_taken) / time_limit)
        return int(base_points * time_factor)

    @sync_to_async
    def start_next_question(self):
        current_q_order = self.session.current_question.order if self.session.current_question else -1
        next_question = Question.objects.filter(
            game=self.session.game,
            order__gt=current_q_order
        ).order_by('order').first()

        if next_question:
            self.session.current_question = next_question
            self.session.status = 'running'
            self.session.save()
            
            q_data = QuestionSerializer(next_question).data
            self.channel_layer.group_send(self.group_name, {
                'type': 'question.new',
                'question': q_data,
                'time_limit': next_question.time_limit
            })
        else:
            self.session.status = 'finished'
            self.session.save()
            self.channel_layer.group_send(self.group_name, {
                'type': 'game.finished',
                'message': 'Jocul s-a terminat! Afișează clasamentul final.'
            })

    async def game_start(self, event):
        await self.send_json({'event': 'game_started', 'game_id': event['game_id']})
        await self.start_next_question()

    async def player_joined(self, event):
        await self.send_json({'event': 'player_joined', 'player': event['player_data']})

    async def answer_received(self, event):
        await self.send_json({'event': 'answer_received', 'player_id': event['player_id']})

    async def question_new(self, event):
        await self.send_json({
            'event': 'new_question', 
            'question': event['question'],
            'time_limit': event['time_limit']
        })

    async def game_finished(self, event):
        await self.send_json({'event': 'game_finished', 'message': event['message']})