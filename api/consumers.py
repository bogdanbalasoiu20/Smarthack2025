"""
WebSocket consumers pentru colaborare în timp real pe prezentări
"""
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import User
from .models import Presentation, PresentationAccess


class PresentationConsumer(AsyncWebsocketConsumer):
    """
    Consumer pentru colaborare pe o prezentare.

    URL: ws://localhost:8000/ws/presentations/<presentation_id>/

    Mesaje suportate:
    - element_update: actualizare element
    - frame_update: actualizare frame
    - comment_added: comentariu nou
    - cursor_move: poziție cursor colaborator
    """

    async def connect(self):
        self.presentation_id = self.scope['url_route']['kwargs']['presentation_id']
        self.room_group_name = f'presentation_{self.presentation_id}'
        self.user = self.scope['user']

        # Verifică permisiuni
        has_access = await self.check_user_access()

        if not has_access:
            await self.close()
            return

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

        # Notifică ceilalți că user-ul s-a conectat
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'user_joined',
                'user_id': self.user.id,
                'username': self.user.username,
            }
        )

    async def disconnect(self, close_code):
        # Notifică că user-ul a plecat
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'user_left',
                'user_id': self.user.id,
                'username': self.user.username,
            }
        )

        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        """Primește mesaj de la client"""
        try:
            data = json.loads(text_data)
            message_type = data.get('type')

            # Validează permisiuni pentru edit
            if message_type in ['element_update', 'frame_update', 'element_delete', 'frame_delete']:
                can_edit = await self.check_user_can_edit()
                if not can_edit:
                    await self.send(text_data=json.dumps({
                        'error': 'No edit permission'
                    }))
                    return

            message_payload = {
                **data,
                'user_id': self.user.id,
                'username': self.user.username,
            }

            # Broadcast la toți membrii grupului
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'broadcast_message',
                    'message': message_payload,
                    'sender_id': self.user.id,
                    'sender_username': self.user.username,
                }
            )
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'error': 'Invalid JSON'
            }))

    async def broadcast_message(self, event):
        """Broadcast mesaj către client"""
        message = event['message']
        sender_id = event['sender_id']

        # Nu trimite înapoi către expeditor
        if sender_id != self.user.id:
            await self.send(text_data=json.dumps(message))

    async def user_joined(self, event):
        """Notificare: user nou s-a alăturat"""
        if event['user_id'] != self.user.id:
            await self.send(text_data=json.dumps({
                'type': 'user_joined',
                'user_id': event['user_id'],
                'username': event['username'],
            }))

    async def user_left(self, event):
        """Notificare: user a plecat"""
        if event['user_id'] != self.user.id:
            await self.send(text_data=json.dumps({
                'type': 'user_left',
                'user_id': event['user_id'],
                'username': event['username'],
            }))

    @database_sync_to_async
    def check_user_access(self):
        """Verifică dacă user-ul are acces la prezentare"""
        if not self.user.is_authenticated:
            return False

        try:
            presentation = Presentation.objects.get(id=self.presentation_id)

            # Owner
            if presentation.owner == self.user:
                return True

            # Public
            if presentation.is_public:
                return True

            # Access grant
            access = PresentationAccess.objects.filter(
                presentation=presentation,
                user=self.user
            ).first()

            return access is not None
        except Presentation.DoesNotExist:
            return False

    @database_sync_to_async
    def check_user_can_edit(self):
        """Verifică dacă user-ul poate edita prezentarea"""
        if not self.user.is_authenticated:
            return False

        try:
            presentation = Presentation.objects.get(id=self.presentation_id)

            # Owner
            if presentation.owner == self.user:
                return True

            # Access grant cu EDITOR
            access = PresentationAccess.objects.filter(
                presentation=presentation,
                user=self.user,
                permission='EDITOR'
            ).first()

            return access is not None
        except Presentation.DoesNotExist:
            return False
