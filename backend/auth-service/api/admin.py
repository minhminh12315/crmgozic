from django.contrib import admin
from .models import *
# Register your models here.
admin.site.register(event)
admin.site.register(ChatRoom)
admin.site.register(Message)
admin.site.register(TypingStatus)

