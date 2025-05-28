from rest_framework import serializers
from .models import event

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
