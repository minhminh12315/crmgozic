from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    EventViewSet,
    MessageViewSet,
    ChatRoomViewSet,
    UserViewSet,
    login,
    logout,
    me
)
from rest_framework_simplejwt.views import (
    TokenRefreshView,
)

router = DefaultRouter()
router.register(r'events', EventViewSet, basename='event')
router.register(r'messages', MessageViewSet, basename='message')
router.register(r'chatrooms', ChatRoomViewSet, basename='chatroom')
router.register(r'users', UserViewSet, basename='user')

urlpatterns = [
    path('', include(router.urls)),
    path('login/', login, name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', logout, name='logout'),
    path('me/', me, name='me'),
]
