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
        try:
            self.pin = self.scope['url_route']['kwargs']['pin']
            self.group_name = f'game_{self.pin}'
            self.is_player = False

            print(f"WebSocket connection attempt for PIN: {self.pin}")

            # Preluarea sesiunii de joc
            try:
                self.session = await sync_to_async(GameSession.objects.get)(pin=self.pin)
                print(f"Session found: {self.session.id}, status: {self.session.status}")
            except GameSession.DoesNotExist:
                print(f"Session not found for PIN: {self.pin}")
                await self.close()
                return

            await self.channel_layer.group_add(self.group_name, self.channel_name)
            await self.accept()
            print(f"WebSocket accepted for PIN: {self.pin}")

            # Odată conectat, trimite imediat starea curentă a lobby-ului (Playeri existenți)
            await self.send_current_lobby_state()
            print(f"Lobby state sent for PIN: {self.pin}")

        except Exception as e:
            print(f"Error in WebSocket connect: {e}")
            import traceback
            traceback.print_exc()
            await self.close() 


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
        print(f"Received message: {action}, content: {content}")

        if action == 'join':
            nickname = content.get('payload', {}).get('name') or content.get('payload', {}).get('nickname')
            if nickname:
                await self.handle_join(nickname)

        elif action == 'answer':
            await self.handle_answer(content.get('payload'))

        # Acțiunile Gazdei (Host)
        elif action == 'host_start' or action == 'host_next':
            is_host_result = await self.is_host()
            print(f"Is host check: {is_host_result}, user: {self.scope.get('user')}")

            if is_host_result:
                # Dacă Gazda apasă Next/Start, anulăm timer-ul automat
                if self.question_timer_task:
                    self.question_timer_task.cancel()
                    self.question_timer_task = None

                print(f"Processing host action: {action}, session status: {self.session.status}")
                await self.process_host_action(self.session.status)
            else:
                print(f"User is not host, ignoring action: {action}")


    # ----------------------------------------------------
    # 3. ACȚIUNI GAZDA (Host)
    # ----------------------------------------------------
    
    async def process_host_action(self, current_status):
        """Gestionează acțiunile Gazdei pe baza stării curente a sesiunii."""

        try:
            # Re-preluăm starea sesiunii după ce timer-ul a fost anulat (pentru siguranță)
            self.session = await sync_to_async(GameSession.objects.get)(pin=self.pin)
            current_status = self.session.status

            print(f"Processing host action for status: {current_status}")

            if current_status == 'lobby':
                await self.start_next_question()

            elif current_status == 'running':
                # Timer-ul a fost anulat, deci publicăm scorurile imediat
                await self.publish_scores()

            elif current_status == 'score_display':
                await self.start_next_question()

            elif current_status == 'finished':
                pass

        except Exception as e:
            print(f"Error in process_host_action: {e}")
            import traceback
            traceback.print_exc()
            

    @sync_to_async
    def is_host(self):
        """Verifică dacă utilizatorul curent este Gazda sesiunii."""
        user = self.scope.get('user')
        if user and user.is_authenticated:
            # Check both session host and game host for backward compatibility
            return user == self.session.host or user == self.session.game.host
        return False
        
        
    # ----------------------------------------------------
    # 4. LOGICA JOCULUI ȘI ACTUALIZAREA STĂRII
    # ----------------------------------------------------
    
    async def handle_join(self, nickname):
        """Creează un jucător și actualizează lobby-ul."""

        # Create player in sync context
        player = await sync_to_async(self._create_player)(nickname)
        self.is_player = True
        self.player_id = player.id  # Store player ID for later reference
        self.player_nickname = nickname

        print(f"Player {nickname} joined with ID: {player.id}")

        # Get all players data
        players_data = await self.get_all_players_data()

        # Send lobby update to all connected clients
        await self.channel_layer.group_send(self.group_name, {
            'type': 'send.lobby_update',
            'players': players_data
        })

    def _create_player(self, nickname):
        """Helper to create player in sync context."""
        player, created = Player.objects.get_or_create(
            session=self.session,
            nickname=nickname,
            defaults={'user': self.scope.get('user') if self.scope.get('user', None) and self.scope['user'].is_authenticated else None}
        )
        return player
        
    
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
        
    
    async def start_next_question(self):
        """Trece sesiunea la următoarea întrebare sau finalizează jocul."""

        # Get next question
        next_question = await sync_to_async(self._get_next_question)()

        if next_question:
            # Update session with new question
            await sync_to_async(self._set_current_question)(next_question)

            # Serialize question data
            q_data = await sync_to_async(lambda: QuestionSerializer(next_question).data)()

            # Send question to all clients
            await self.channel_layer.group_send(self.group_name, {
                'type': 'send.question',
                'question': q_data,
                'time_limit': next_question.time_limit
            })

            # Start timer
            self.question_timer_task = asyncio.create_task(
                self.start_question_timer(next_question.time_limit)
            )

        else:
            # Game finished
            await sync_to_async(self._update_session_status)('finished')
            await self.channel_layer.group_send(self.group_name, {
                'type': 'send.game_finished',
                'message': 'Jocul s-a terminat! Afișează clasamentul final.'
            })

    def _get_next_question(self):
        """Get next question in sync context."""
        current_q_order = self.session.current_question.order if self.session.current_question else -1
        return Question.objects.filter(
            game=self.session.game,
            order__gt=current_q_order
        ).order_by('order').first()

    def _set_current_question(self, question):
        """Set current question in sync context."""
        self.session.current_question = question
        self.session.status = 'running'
        self.session.save()
            
            
    # --- LOGICA RĂSPUNSULUI ȘI SCORULUI ---
    
    async def handle_answer(self, content):
        """Procesează răspunsul unui jucător."""

        # Refresh session status
        await sync_to_async(self.session.refresh_from_db)()

        # Verifică dacă sesiunea este în starea corectă pentru a primi răspunsuri
        if self.session.status != 'running':
            print(f"Answer rejected: session status is {self.session.status}")
            return

        # 1. Identifică Jucătorul folosind player_id stocat
        if not hasattr(self, 'player_id'):
            print("Answer rejected: no player_id found")
            return

        # Get player and process answer
        result = await sync_to_async(self._process_answer)(content)
        if not result:
            return

        total_answered, points_awarded = result
        print(f"Answer processed: player {self.player_nickname}, points: {points_awarded}, total answered: {total_answered}")

        # Send answered count to group
        await self.channel_layer.group_send(self.group_name, {
            'type': 'send.answered_count',
            'answered_count': total_answered
        })

    def _process_answer(self, content):
        """Process answer in sync context."""
        try:
            player = Player.objects.get(id=self.player_id, session=self.session)
        except Player.DoesNotExist:
            print(f"Player not found: {self.player_id}")
            return None

        question = self.session.current_question
        submitted_choice_index = content.get('answer')
        time_taken = content.get('time_taken', 1.0)

        if not question or Answer.objects.filter(player=player, question=question).exists():
            print(f"Question not found or already answered")
            return None

        # 2. Identifică Opțiunea
        try:
            submitted_choice = question.choices.order_by('order')[submitted_choice_index]
        except IndexError:
            print(f"Invalid choice index: {submitted_choice_index}")
            return None
            
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

        # 5. Get total answered count
        total_answered = Answer.objects.filter(question=question).count()

        return (total_answered, points_awarded)
        
    
    def calculate_score(self, is_correct, base_points, time_taken, time_limit):
        """Calculează scorul bazat pe corectitudine și rapiditate."""
        if not is_correct or time_taken >= time_limit:
            return 0
        
        # Formula: Scor = Base * (Timp Rămas / Timp Total)
        time_factor = (time_limit - time_taken) / time_limit
        time_factor = max(0.0, time_factor) 
        
        # Folosim int() pentru a rotunji în jos (scorul Kahoot e mereu întreg)
        return int(base_points * time_factor)
        
        
    async def publish_scores(self):
        """Publică clasamentul curent (Score Update)."""
        # Update session status
        await sync_to_async(self._update_session_status)('score_display')

        # Get all players data
        players_data = await self.get_all_players_data()

        # Cancel timer if running
        if self.question_timer_task:
            self.question_timer_task.cancel()
            self.question_timer_task = None

        # Send score update to all connected clients
        await self.channel_layer.group_send(self.group_name, {
            'type': 'send.score_update',
            'players': players_data
        })

    def _update_session_status(self, status):
        """Helper to update session status in sync context."""
        self.session.status = status
        self.session.save()
        
        
    # ----------------------------------------------------
    # 5. HANDLERE PENTRU MESAJELE PRIMITE DIN CHANNEL LAYER
    # ----------------------------------------------------
    
    async def send_current_lobby_state(self):
        """Trimite starea curentă a jocului la conectarea inițială."""
        try:
            # Refresh session to get latest status
            await sync_to_async(self.session.refresh_from_db)()
            players_data = await self.get_all_players_data()

            print(f"Sending current state: {self.session.status}")

            # Send different messages based on current game state
            if self.session.status == 'lobby':
                await self.send_json({
                    'type': 'lobby_update',
                    'payload': {'players': players_data, 'status': self.session.status}
                })
            elif self.session.status == 'running':
                # Game is active, send current question
                if self.session.current_question:
                    q_data = await sync_to_async(lambda: QuestionSerializer(self.session.current_question).data)()
                    await self.send_json({
                        'type': 'question',
                        'payload': {
                            'question': q_data,
                            'time_limit': self.session.current_question.time_limit
                        }
                    })
                else:
                    # No current question, send lobby state
                    await self.send_json({
                        'type': 'lobby_update',
                        'payload': {'players': players_data, 'status': self.session.status}
                    })
            elif self.session.status == 'score_display':
                # Show scores
                await self.send_json({
                    'type': 'score_update',
                    'payload': {'players': players_data}
                })
            elif self.session.status == 'finished':
                # Game finished
                await self.send_json({
                    'type': 'end',
                    'payload': {
                        'message': 'Game finished',
                        'players': players_data
                    }
                })
            else:
                # Default to lobby update
                await self.send_json({
                    'type': 'lobby_update',
                    'payload': {'players': players_data, 'status': self.session.status}
                })

        except Exception as e:
            print(f"Error sending current state: {e}")
            import traceback
            traceback.print_exc()
        
    async def send_lobby_update(self, event):
        """Handler pentru 'send.lobby_update' (Actualizare Playeri)."""
        try:
            # Refresh session to get latest status
            await sync_to_async(self.session.refresh_from_db)()
            await self.send_json({
                'type': 'lobby_update',
                'payload': {'players': event['players'], 'status': self.session.status}
            })
        except Exception as e:
            print(f"Error sending lobby update: {e}")
        
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