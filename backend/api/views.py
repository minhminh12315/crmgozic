from rest_framework import viewsets, permissions
from .models import event
from .serializers import EventSerializer

class EventViewSet(viewsets.ModelViewSet):
    serializer_class = EventSerializer
    # permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return event.objects.all().order_by('time')
