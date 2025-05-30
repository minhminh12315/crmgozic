from rest_framework import viewsets, permissions
from .models import event
from .serializers import EventSerializer
from rest_framework.views import APIView
class EventViewSet(viewsets.ModelViewSet):
    serializer_class = EventSerializer
    # permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return event.objects.all().order_by('time')

class AuthCheck(APIView):
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return Response({"message": "Login successful"})
        return Response(
            {"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED
        )
    
class signIn(APIView):
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        