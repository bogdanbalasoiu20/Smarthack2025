from channels.generic.websocket import AsyncJsonWebsocketConsumer
from asgiref.sync import sync_to_async
from django.db.models import F, Sum, Count 
import asyncio # Adăugat: Esențial pentru timer
import json

# Importă modelele și serializatoarele tale
from .models import GameSession, Player, Question, Answer, Choice
from .serializers import PlayerSerializer, QuestionSerializer 


class GameConsumer(AsyncJsonWebsocketConsumer):
    
    # Stocăm referința la task-ul de timer pentru a-l putea anula
    # Acest lucru este crucial pentru a preveni rularea timer-ului dacă Gazda apasă "Next" manual
    question_timer_task = None
    
    # ----------------------------------------------------
    # 1. CONEXIUNE ȘI DECONEXIUNE
    # ----------------------------------------------------
    
    async def connect(self):
        self.pin = self.scope['url_route']['kwargs']['pin']
        self.group_name = f'game_{self.pin}'
        self.is_player = False 
        
        try:
            # Preluarea sesiunii de joc
            self.session = await sync_to_async(GameSession.objects.get)(pin=self.pin)
        except GameSession.DoesNotExist:
            await self.close()
            return

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()
        
        # Odată conectat, trimite imediat starea curentă a lobby-ului (Playeri existenți)
        await self.send_current_lobby_state() 


    async def disconnect(self, close_code):
        # Anulează orice timer activ la deconectare
        if self.question_timer_task:
            self.question_timer_task.cancel()
            
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    
    # ----------------------------------------------------
    # 2. PRIMIREA MESAJELOR (receive_json)
    # ----------------------------------------------------
    
    async def receive_json(self, content):
        action = content.get('type') 
        
        if action == 'join':
            nickname = content.get('payload', {}).get('name') or content.get('payload', {}).get('nickname') 
            if nickname:
                await self.handle_join(nickname)
            
        elif action == 'answer':
            await self.handle_answer(content.get('payload'))

        # Acțiunile Gazdei (Host)
        elif await self.is_host():
            # Dacă Gazda apasă Next/Start, anulăm timer-ul automat
            if self.question_timer_task:
                self.question_timer_task.cancel()
                self.question_timer_task = None
            
            if action == 'host_start' or action == 'host_next': 
                await self.process_host_action(self.session.status)


    # ----------------------------------------------------
    # 3. ACȚIUNI GAZDA (Host)
    # ----------------------------------------------------
    
    async def process_host_action(self, current_status):
        """Gestionează acțiunile Gazdei pe baza stării curente a sesiunii."""
        
        # Re-preluăm starea sesiunii după ce timer-ul a fost anulat (pentru siguranță)
        self.session = await sync_to_async(GameSession.objects.get)(pin=self.pin)
        current_status = self.session.status
        
        if current_status == 'lobby':
            await self.start_next_question() 
            
        elif current_status == 'running':
            # Timer-ul a fost anulat, deci publicăm scorurile imediat
            await self.publish_scores()
            
        elif current_status == 'score_display':
            await self.start_next_question() 
            
        elif current_status == 'finished':
            pass
            

    @sync_to_async
    def is_host(self):
        """Verifică dacă utilizatorul curent este Gazda sesiunii."""
        user = self.scope.get('user')
        if user and user.is_authenticated:
            return user == self.session.game.host 
        return False
        
        
    # ----------------------------------------------------
    # 4. LOGICA JOCULUI ȘI ACTUALIZAREA STĂRII
    # ----------------------------------------------------
    
    @sync_to_async
    def handle_join(self, nickname):
        """Creează un jucător și actualizează lobby-ul."""
        
        player, created = Player.objects.get_or_create(
            session=self.session,
            nickname=nickname,
            defaults={'user': self.scope.get('user') if self.scope.get('user', None) and self.scope['user'].is_authenticated else None}
        )
        self.is_player = True
        
        players_data = self.get_all_players_data() 
        
        self.channel_layer.group_send(self.group_name, {
            'type': 'send.lobby_update', 
            'players': players_data
        })
        
    
    @sync_to_async
    def get_all_players_data(self):
        """Preia toți jucătorii dintr-o sesiune, sortați după scor."""
        players = Player.objects.filter(session=self.session).order_by('-score', 'id')
        return PlayerSerializer(players, many=True).data

    
    # --- LOGICA CRONOMETRULUI ---
    async def start_question_timer(self, time_limit):
        """Rulează un cronometru asincron care forțează publicarea scorului."""
        try:
            # Așteaptă timpul limită
            await asyncio.sleep(time_limit) 
        except asyncio.CancelledError:
            # Dacă Gazda a apăsat 'Next' manual, task-ul este anulat și ieșim
            print("Timer canceled by host action.")
            return
        
        # Forțează publicarea scorurilor după expirarea timpului
        await self.publish_scores()
        
    
    @sync_to_async
    def start_next_question(self):
        """Trece sesiunea la următoarea întrebare sau finalizează jocul."""
        
        current_q_order = self.session.current_question.order if self.session.current_question else -1
        next_question = Question.objects.filter(
            game=self.session.game,
            order__gt=current_q_order
        ).order_by('order').first()

        if next_question:
            self.session.current_question = next_question
            self.session.status = 'running' # Trecem la 'running' (întrebare activă)
            self.session.save()
            
            # Resetăm Answered Count (nu e obligatoriu să-l pui în model)
            # self.session.answers_count = 0 
            # self.session.save()
            
            q_data = QuestionSerializer(next_question).data
            
            # 1. Trimite noua întrebare către grup
            self.channel_layer.group_send(self.group_name, {
                'type': 'send.question', 
                'question': q_data,
                'time_limit': next_question.time_limit
            })
            
            # 2. PORNIRE CRONOMETRU ASINCRON
            # Creează un task în fundal și stochează referința
            self.question_timer_task = asyncio.create_task(
                self.start_question_timer(next_question.time_limit)
            )
            
        else:
            # Nu mai sunt întrebări, jocul s-a terminat
            self.session.status = 'finished'
            self.session.save()
            self.channel_layer.group_send(self.group_name, {
                'type': 'send.game_finished',
                'message': 'Jocul s-a terminat! Afișează clasamentul final.'
            })
            
            
    # --- LOGICA RĂSPUNSULUI ȘI SCORULUI ---
    
    @sync_to_async
    def handle_answer(self, content):
        """Procesează răspunsul unui jucător."""
        
        # Verifică dacă sesiunea este în starea corectă pentru a primi răspunsuri
        if self.session.status != 'running':
            return # Previne răspunsurile după ce timpul a expirat sau scorul e afișat
            
        # 1. Identifică Jucătorul (Asumăm că ai salvat Player-ul în sesiune)
        try:
            # Aici este crucial să știi cum îți identifici jucătorul.
            # Dacă user-ul nu e autentificat, trebuie să folosești un ID salvat 
            # de client la join (ex: player_id salvat în scope sau sesiune)
            
            # Varianta securizată (dacă user-ul e autentificat):
            if self.scope.get('user') and self.scope['user'].is_authenticated:
                player = Player.objects.get(session=self.session, user=self.scope['user']) 
            # Alternativa, dacă ai salvat ID-ul canalului sau ai o logică de Player ID:
            else:
                 # ÎNTRERUPE AICI: Dacă jucătorii nu se autentifică, trebuie să 
                 # folosești o metodă mai complexă (ex: token de jucător)
                 return
                 
        except Player.DoesNotExist:
            return

        question = self.session.current_question
        submitted_choice_index = content.get('answer') 
        time_taken = content.get('time_taken', 1.0) # Timpul trimis de frontend
        
        if not question or Answer.objects.filter(player=player, question=question).exists():
            return
            
        # 2. Identifică Opțiunea
        try:
            submitted_choice = question.choices.order_by('order')[submitted_choice_index]
        except IndexError:
            return 
            
        is_correct = submitted_choice.is_correct
        
        # 3. Calculează Scorul
        points_awarded = self.calculate_score(is_correct, question.game.base_points, time_taken, question.time_limit)

        # 4. Salvează Răspunsul și Actualizează Jucătorul
        Answer.objects.create(
            player=player,
            question=question,
            choice=submitted_choice,
            time_taken=time_taken,
            points_awarded=points_awarded
        )
        
        player.score = F('score') + points_awarded
        player.streak = F('streak') + 1 if is_correct else 0
        player.save()
        player.refresh_from_db()

        # 5. Trimite actualizarea către Host (câți au răspuns)
        total_answered = Answer.objects.filter(question=question).count()
        
        self.channel_layer.group_send(self.group_name, {
            'type': 'send.answered_count', 
            'answered_count': total_answered
        })
        
    
    def calculate_score(self, is_correct, base_points, time_taken, time_limit):
        """Calculează scorul bazat pe corectitudine și rapiditate."""
        if not is_correct or time_taken >= time_limit:
            return 0
        
        # Formula: Scor = Base * (Timp Rămas / Timp Total)
        time_factor = (time_limit - time_taken) / time_limit
        time_factor = max(0.0, time_factor) 
        
        # Folosim int() pentru a rotunji în jos (scorul Kahoot e mereu întreg)
        return int(base_points * time_factor)
        
        
    @sync_to_async
    def publish_scores(self):
        """Publică clasamentul curent (Score Update)."""
        self.session.status = 'score_display' # Nouă stare
        self.session.save()
        
        players_data = self.get_all_players_data() 
        
        # Anulează task-ul de timer la publicarea scorurilor (pentru siguranță)
        if self.question_timer_task:
            self.question_timer_task.cancel()
            self.question_timer_task = None
        
        self.channel_layer.group_send(self.group_name, {
            'type': 'send.score_update',
            'players': players_data
        })
        
        
    # ----------------------------------------------------
    # 5. HANDLERE PENTRU MESAJELE PRIMITE DIN CHANNEL LAYER
    # ----------------------------------------------------
    
    async def send_current_lobby_state(self):
        """Trimite starea lobby-ului la conectarea inițială."""
        players_data = await self.get_all_players_data()
        await self.send_json({
            'type': 'lobby_update', 
            'payload': {'players': players_data, 'status': self.session.status}
        })
        
    async def send_lobby_update(self, event):
        """Handler pentru 'send.lobby_update' (Actualizare Playeri)."""
        await self.send_json({
            'type': 'lobby_update', 
            'payload': {'players': event['players'], 'status': self.session.status}
        })
        
    async def send_question(self, event):
        """Handler pentru 'send.question' (Trimite noua întrebare)."""
        # Trimite întrebarea, dar fără răspunsurile corecte
        await self.send_json({
            'type': 'question', 
            'payload': {
                'question': event['question'],
                'time_limit': event['time_limit']
            }
        })
        
    async def send_score_update(self, event):
        """Handler pentru 'send.score_update' (Afișează clasamentul)."""
        await self.send_json({
            'type': 'score_update', 
            'payload': {'players': event['players']}
        })
        
    async def send_game_finished(self, event):
        """Handler pentru 'send.game_finished' (Finalul jocului)."""
        players_data = await self.get_all_players_data() 
        
        await self.send_json({
            'type': 'end', 
            'payload': {
                'message': event['message'],
                'players': players_data
            }
        })
        
    async def send_answered_count(self, event):
        """Handler pentru 'send.answered_count' (Afișat pe ecranul Gazdei)."""
        # Numărul de răspunsuri este util doar Gazdei
        if await self.is_host(): 
            await self.send_json({
                'type': 'answered_count', 
                'payload': {'count': event['answered_count']}
            })