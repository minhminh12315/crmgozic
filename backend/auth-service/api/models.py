from django.db import models
from django.contrib.auth.models import User

class employee(models.Model):
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    position = models.CharField(max_length=50, blank=True, null=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name} - {self.position}"
    
class project(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    start_date = models.DateField()
    dead_line = models.DateField(blank=True, null=True)
    priority = models.CharField(max_length=20, choices=[
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    ], default='medium')
    image = models.ImageField(upload_to='project_images/', blank=True, null=True)

    def __str__(self):
        return self.name
    
class task(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    assigned_to = models.ForeignKey(employee, on_delete=models.CASCADE, related_name='tasks')
    estimate = models.IntegerField(help_text="Estimated hours to complete the task")
    dead_line = models.DateField(blank=True, null=True)
    priority = models.CharField(max_length=20, choices=[
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    ], default='medium')
    project = models.ForeignKey(project, on_delete=models.CASCADE, related_name='tasks')
    status = models.CharField(max_length=20, choices=[
        ('not_started', 'Not Started'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('on_hold', 'On Hold'),
    ], default='not_started')

    def __str__(self):
        return self.title
    
class event(models.Model):
    DAYS_OF_WEEK = [
        ('Mon', 'Monday'),
        ('Tue', 'Tuesday'),
        ('Wed', 'Wednesday'),
        ('Thu', 'Thursday'),
        ('Fri', 'Friday'),
        ('Sat', 'Saturday'),
        ('Sun', 'Sunday'),
    ]

    event_name = models.CharField(max_length=100)
    event_category = models.CharField(max_length=50, choices=[
        ('Corporate Event', 'Corporate Event'),
        ('Birthday', 'Birthday'),
        ('Meeting', 'Meeting'),
        ('Reminder', 'Reminder'),
    ], default='Corporate Event')
    priority = models.CharField(max_length=10, choices=[
        ('Low', 'Low'),
        ('Medium', 'Medium'),
        ('High', 'High'),
    ], default='Medium')
    date = models.DateField()
    time = models.TimeField()
    description = models.TextField(null=True, blank=True)
    
    repeat_event = models.BooleanField(default=False)
    repeat_type = models.CharField(max_length=10, choices=[
        ('Daily', 'Daily'),
        ('Weekly', 'Weekly'),
        ('Monthly', 'Monthly'),
    ], null=True, blank=True)
    
    repeat_days = models.CharField(max_length=100, blank=True, null=True)
    repeat_every_day = models.BooleanField(default=False)
    repeat_time = models.TimeField(blank=True, null=True)

    # created_by = models.ForeignKey(employee, on_delete=models.CASCADE, related_name='events')
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.event_name
    
    def get_repeat_days_list(self):
        """Chuyển repeat_days từ chuỗi -> list ['Mon', 'Tue'] hoặc trả về tất cả các ngày nếu repeat_every_day=True"""
        if self.repeat_every_day:
            return [day[0] for day in self.DAYS_OF_WEEK]  # Trả về tất cả các ngày
        if self.repeat_days:
            return [day.strip() for day in self.repeat_days.split(',')]
        return []
    
    def save(self, *args, **kwargs):
        if self.repeat_every_day == True:
            self.repeat_days = 'Mon, Tue, Wed, Thu, Fri, Sat, Sun'
        super().save(*args, **kwargs)

class ChatRoom(models.Model):
    name = models.CharField(max_length=255, blank=True, null=True)  # optional group name
    is_group = models.BooleanField(default=False)
    members = models.ManyToManyField(User, related_name='chatrooms')
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"ChatRoom {self.id} - {self.name} - {self.is_group}"
    
    def get_members(self):
        return self.members.all()
    


class Message(models.Model):
    chatroom = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField(null=True, blank=True)
    file = models.FileField(upload_to='chat_files/', blank=True, null=True)
    mentioned_users = models.ManyToManyField(User, related_name='mentions', blank=True)
    link = models.URLField(blank=True, null=True)
    is_edited = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.content}"

class TypingStatus(models.Model):
    chatroom = models.ForeignKey(ChatRoom, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    is_typing = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)