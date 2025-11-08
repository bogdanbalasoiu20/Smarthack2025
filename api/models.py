from django.db import models
from django.contrib.auth.models import AbstractUser
import uuid


class User(AbstractUser):
    """Extended user model with organization support"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    avatar_url = models.URLField(blank=True, null=True)
    organization = models.ForeignKey('Organization', on_delete=models.SET_NULL,
                                    null=True, blank=True, related_name='members')
    role = models.CharField(max_length=20, choices=[
        ('admin', 'Admin'),
        ('member', 'Member'),
        ('viewer', 'Viewer')
    ], default='member')
    preferences = models.JSONField(default=dict, blank=True)
    last_active = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    class Meta:
        db_table = 'users'
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['organization', 'role'])
        ]

    def __str__(self):
        return self.email


class Organization(models.Model):
    """Company, School, or Institution"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    plan = models.CharField(max_length=20, choices=[
        ('free', 'Free'),
        ('pro', 'Pro'),
        ('enterprise', 'Enterprise')
    ], default='free')
    settings = models.JSONField(default=dict, blank=True)
    max_members = models.IntegerField(default=10)
    max_storage_gb = models.IntegerField(default=5)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'organizations'

    def __str__(self):
        return self.name


class Presentation(models.Model):
    """Main presentation entity"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE,
                             related_name='owned_presentations')
    organization = models.ForeignKey(Organization,
                                    on_delete=models.SET_NULL, null=True,
                                    blank=True, related_name='presentations')

    # Canvas settings
    canvas_config = models.JSONField(default=dict)
    viewport_state = models.JSONField(default=dict)

    # Metadata
    thumbnail_url = models.URLField(blank=True, null=True)
    is_template = models.BooleanField(default=False)
    is_public = models.BooleanField(default=False)
    share_token = models.CharField(max_length=64, unique=True, blank=True, null=True)

    # Stats
    view_count = models.IntegerField(default=0)
    last_presented_at = models.DateTimeField(null=True, blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'presentations'
        indexes = [
            models.Index(fields=['owner', 'created_at']),
            models.Index(fields=['organization']),
        ]
        ordering = ['-updated_at']

    def __str__(self):
        return self.title


class Frame(models.Model):
    """Logical grouping on canvas (like a slide but positioned freely)"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    presentation = models.ForeignKey(Presentation, on_delete=models.CASCADE,
                                    related_name='frames')
    title = models.CharField(max_length=255, blank=True)

    # Position & Size on canvas
    x = models.FloatField(default=0)
    y = models.FloatField(default=0)
    width = models.FloatField(default=1920)
    height = models.FloatField(default=1080)
    rotation = models.FloatField(default=0)
    z_index = models.IntegerField(default=0)

    # Styling
    background_color = models.CharField(max_length=7, default='#FFFFFF')
    background_image = models.URLField(blank=True, null=True)
    border_style = models.JSONField(default=dict)

    # Navigation
    order_index = models.IntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'frames'
        indexes = [
            models.Index(fields=['presentation', 'order_index']),
        ]
        ordering = ['order_index']

    def __str__(self):
        return f"{self.presentation.title} - {self.title or 'Untitled'}"


class Element(models.Model):
    """Any content element on canvas"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    frame = models.ForeignKey(Frame, on_delete=models.CASCADE,
                             related_name='elements', null=True, blank=True)
    presentation = models.ForeignKey(Presentation, on_delete=models.CASCADE,
                                    related_name='elements')

    # Element type
    ELEMENT_TYPES = [
        ('text', 'Text'),
        ('image', 'Image'),
        ('video', 'Video'),
        ('shape', 'Shape'),
        ('line', 'Line'),
        ('arrow', 'Arrow'),
        ('icon', 'Icon'),
    ]
    type = models.CharField(max_length=20, choices=ELEMENT_TYPES)

    # Position & Transform
    x = models.FloatField(default=0)
    y = models.FloatField(default=0)
    width = models.FloatField(default=100)
    height = models.FloatField(default=100)
    rotation = models.FloatField(default=0)
    scale_x = models.FloatField(default=1)
    scale_y = models.FloatField(default=1)
    z_index = models.IntegerField(default=0)

    # Content (type-specific data)
    content = models.JSONField(default=dict)

    # Styling
    style = models.JSONField(default=dict)

    # Locking
    locked = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'elements'
        indexes = [
            models.Index(fields=['presentation', 'frame']),
            models.Index(fields=['type'])
        ]
        ordering = ['z_index', 'created_at']

    def __str__(self):
        return f"{self.type} element in {self.presentation.title}"


class Comment(models.Model):
    """Comments on frames or elements"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    presentation = models.ForeignKey(Presentation, on_delete=models.CASCADE,
                                    related_name='comments')
    frame = models.ForeignKey(Frame, on_delete=models.CASCADE,
                             null=True, blank=True, related_name='comments')
    element = models.ForeignKey(Element, on_delete=models.CASCADE,
                               null=True, blank=True, related_name='comments')

    author = models.ForeignKey(User, on_delete=models.CASCADE)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True,
                              blank=True, related_name='replies')

    content = models.TextField()
    position = models.JSONField(null=True, blank=True)

    is_resolved = models.BooleanField(default=False)
    resolved_by = models.ForeignKey(User, on_delete=models.SET_NULL,
                                   null=True, blank=True,
                                   related_name='resolved_comments')
    resolved_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'comments'
        indexes = [
            models.Index(fields=['presentation', 'is_resolved']),
        ]
        ordering = ['created_at']

    def __str__(self):
        return f"Comment by {self.author.username} on {self.presentation.title}"


class CollaborationSession(models.Model):
    """Active editing sessions for presence tracking"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    presentation = models.ForeignKey(Presentation, on_delete=models.CASCADE,
                                    related_name='sessions')
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    # Cursor & selection state
    cursor_position = models.JSONField(default=dict)
    selected_element_id = models.UUIDField(null=True, blank=True)
    viewport_state = models.JSONField(default=dict)

    # Connection info
    channel_name = models.CharField(max_length=255)
    color = models.CharField(max_length=7)

    joined_at = models.DateTimeField(auto_now_add=True)
    last_seen = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'collaboration_sessions'
        indexes = [
            models.Index(fields=['presentation', 'user']),
        ]

    def __str__(self):
        return f"{self.user.username} in {self.presentation.title}"


class AccessControlEntry(models.Model):
    """Fine-grained permissions per presentation"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    presentation = models.ForeignKey(Presentation, on_delete=models.CASCADE,
                                    related_name='access_entries')

    user = models.ForeignKey(User, on_delete=models.CASCADE,
                            null=True, blank=True)

    # Permission level
    ROLES = [
        ('owner', 'Owner'),
        ('editor', 'Editor'),
        ('commenter', 'Commenter'),
        ('viewer', 'Viewer')
    ]
    role = models.CharField(max_length=20, choices=ROLES)

    granted_by = models.ForeignKey(User, on_delete=models.SET_NULL,
                                  null=True, related_name='granted_permissions')
    granted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'access_control_entries'
        unique_together = [['presentation', 'user']]
        indexes = [
            models.Index(fields=['presentation', 'role']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.role} on {self.presentation.title}"
