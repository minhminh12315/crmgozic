from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EventViewSet
from .views import AuthCheck
from .views import signIn

router = DefaultRouter()
router.register(r'events', EventViewSet, basename='event')

urlpatterns = [
    path('auth/check-auth', AuthCheck.as_view(), name="authcheck"),
    path('auth/signin', signIn.as_view() , name="signin"),
]
