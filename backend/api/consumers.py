from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
import json
from .models import ChatRoom, Message
from django.contrib.auth.models import User

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # print("HEADERS:", self.scope['headers'])
        # print("USER:", self.scope["user"])
        if self.scope["user"].is_anonymous:
            print("❌ Anonymous user - closing WebSocket")
            await self.close()
            return

        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_group_name = f'chat_{self.room_id}'
        print("✅ WebSocket connected - room:", self.room_group_name)

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()


    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
    
    @database_sync_to_async
    def get_user(self):
        return User.objects.get(username=self.scope['user'].username)
    
    @database_sync_to_async
    def save_message(self, user, message):
        chatroom = ChatRoom.objects.get(id=self.room_id)
        return Message.objects.create(
            chatroom=chatroom,
            sender=user,
            content=message
        )
        
    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data['message']
        file = data.get('file')  # Lấy file URL nếu có
        link = data.get('link')  # Lấy link nếu có
        client_id = data.get('clientId')
        user = await self.get_user()
        
        # Lưu tin nhắn vào DB nếu không có file (vì tin nhắn có file đã được lưu qua HTTP)
        # if user.is_authenticated and not file:
        #     await self.save_message(user, message)
            
        # Broadcast tới các client khác trong phòng
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message,
                'user': user.username,
                'file': file,
                'link': link,
                'clientId': client_id
            }
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'message': event['message'],
            'user': event['user'],
            'file': event.get('file'),
            'link': event.get('link'),
            'clientId': event.get('clientId')   
        }))
