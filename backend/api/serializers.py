from rest_framework import serializers
from .models import event, Message, ChatRoom
from django.contrib.auth.models import User

class EventSerializer(serializers.ModelSerializer):
    repeat_days_list = serializers.ListField(
        child=serializers.CharField(),
        source='get_repeat_days_list',
        read_only=True
    )

    class Meta:
        model = event
        fields = [
            'event_name',
            'event_category',
            'priority',
            'date',
            'time',
            'description',
            'repeat_event',
            'repeat_type',
            'repeat_days',
            'repeat_every_day',
            'repeat_time',
            'created_at',
            'repeat_days_list',  # để tiện xử lý phía frontend
        ]
        read_only_fields = ['created_at']

# class MessageSerializer(serializers.ModelSerializer):
#     sender_username = serializers.CharField(source='sender.username', read_only=True)

#     class Meta:
#         model = Message
#         fields = ['id', 'chatroom', 'sender_username', 'content', 'file', 'created_at']
        
class MessageSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(source='sender.username', read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'chatroom', 'sender_username', 'content', 'file', 'link', 'created_at']
        read_only_fields = ['sender_username', 'created_at']

class ChatRoomSerializer(serializers.ModelSerializer):
    members = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        many=True
    )
    class Meta:
        model = ChatRoom
        fields = ['id', 'name', 'members', 'is_group', 'created_at']
        read_only_fields = ['created_at']

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username']
        
        
class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(max_length=50, write_only=True)
    
    def validate(self, data):
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return serializers.ValidationError('Username và mật khẩu là bắt buộc.')

        return data


