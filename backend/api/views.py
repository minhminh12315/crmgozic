from rest_framework import viewsets, permissions, generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import serializers
from rest_framework.decorators import action, permission_classes, authentication_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authtoken.models import Token
from .models import event, Message, ChatRoom
from .serializers import *
from django.contrib.auth.models import User
from rest_framework.decorators import api_view
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
import json


@api_view(['POST'])
def login(request):
    # print("SSSSS",request.data)
    # content = request.data.get("_content")
    # data = json.loads(content)
    # username = data.get("username")
    # password = data.get("password")
    serializer = UserLoginSerializer(data=request.data)
    if serializer.is_valid():
        username = serializer.validated_data['username']
        password = serializer.validated_data['password']

        try:
            user = User.objects.get(username=username)
            if user.check_password(password):
                refresh = RefreshToken.for_user(user)
                return Response({
                    'refresh_token': str(refresh),
                    'access_token': str(refresh.access_token),
                    'userID': user.id,
                    'username': user.username
                }, status=status.HTTP_200_OK)
            else:
                return Response({'error': 'Mật khẩu không chính xác.'}, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            return Response({'error': 'Người dùng không tồn tại.'}, status=status.HTTP_400_BAD_REQUEST)
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@permission_classes([IsAuthenticated])
@api_view(['GET'])
def me(request):
    return Response({
        'id': request.user.id,
        'username': request.user.username
    })
    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    try:
        refresh_token = request.data["refresh_token"]
        token = RefreshToken(refresh_token)
        token.blacklist()

        return Response({"detail": "Đăng xuất thành công."}, status=status.HTTP_205_RESET_CONTENT)
    except KeyError:
        return Response({"error": "Thiếu refresh_token."}, status=status.HTTP_400_BAD_REQUEST)
    except TokenError as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@permission_classes([IsAuthenticated])
class EventViewSet(viewsets.ModelViewSet):
    serializer_class = EventSerializer

    def get_queryset(self):
        return event.objects.all().order_by('time')

@permission_classes([IsAuthenticated])
class ChatRoomViewSet(viewsets.ModelViewSet):
    serializer_class = ChatRoomSerializer

    def get_queryset(self):
        user = self.request.user
        return ChatRoom.objects.filter(members=user).order_by('-created_at')
    
    def perform_create(self, serializer):
        is_group = self.request.data.get("is_group")
        members = self.request.data.getlist("members")
        
        if not members:
            raise serializers.ValidationError("Phải có ít nhất một thành viên khác trong phòng chat.")
        
        for member in members:
            if member == str(self.request.user.id):
                raise serializers.ValidationError("Không thể tạo phòng chat với chính bản thân mình.")
        
        if not is_group and len(members) == 1:
            existing_room = ChatRoom.objects.filter(
                is_group=False,
                members=self.request.user
            ).filter(
                members__in=members
            ).distinct().first()

            if existing_room:
                raise serializers.ValidationError("Phòng chat 1-1 với người dùng này đã tồn tại.")

        # if is_group:
        #     # chat group: kiểm tra phòng đã tồn tại chưa
        #     existing_room = ChatRoom.objects.filter(
        #         is_group=True,
        #         members=self.request.user
        #     ).filter(
        #         members__in=members
        #     ).distinct().first()

        #     if existing_room:
        #         raise serializers.ValidationError("Phòng chat đã tồn tại.")
        
        # Tạo phòng chat mới
        serializer.save()
        chatroom = serializer.instance
        chatroom.members.add(self.request.user)
        
        for member_id in members:
            chatroom.members.add(member_id)
            
        chatroom.save()

@permission_classes([IsAuthenticated])
class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    # permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        room_id = self.request.query_params.get('room')
        if room_id:
            try:
                room = ChatRoom.objects.get(id=room_id)
                return Message.objects.filter(chatroom=room).order_by('created_at')
            except ChatRoom.DoesNotExist:
                return Message.objects.none()
        return Message.objects.none()

    def perform_create(self, serializer):
        room_id = self.request.data.get("chatroom")
        try:
            chatroom = ChatRoom.objects.get(id=room_id)
        except ChatRoom.DoesNotExist:
            raise serializers.ValidationError("Chatroom not found.")
        serializer.save(sender=self.request.user, chatroom=chatroom)

@permission_classes([IsAuthenticated])
class UserViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = UserSerializer
    
    def get_queryset(self):
        # Exclude current user from results
        return User.objects.all()
    

