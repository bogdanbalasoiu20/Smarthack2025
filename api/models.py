from django.db import models
from django.contrib.auth.models import User, Group
import uuid


# ===== BRAND KIT =====
class BrandKit(models.Model):
    """Brand identity settings (colors, fonts, logos) per group/organization"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='brand_kits')

    # JSON fields for flexibility
    colors = models.JSONField(default=list, help_text="List of brand colors")
    fonts = models.JSONField(default=list, help_text="List of font families")
    logos = models.JSONField(default=list, help_text="List of logo URLs")

    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'brand_kits'

    def __str__(self):
        return f"{self.name} - {self.group.name}"


# ===== ASSET =====
class Asset(models.Model):
    """Uploaded media assets (images, videos, icons)"""
    ASSET_TYPES = [
        ('IMAGE', 'Image'),
        ('VIDEO', 'Video'),
        ('ICON', 'Icon'),
        ('AUDIO', 'Audio'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    asset_type = models.CharField(max_length=20, choices=ASSET_TYPES)
    file_url = models.URLField()
    thumbnail_url = models.URLField(blank=True, null=True)

    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='assets', null=True, blank=True)
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)

    tags = models.JSONField(default=list, blank=True)
    metadata = models.JSONField(default=dict, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'assets'
        indexes = [
            models.Index(fields=['asset_type']),
            models.Index(fields=['group']),
        ]

    def __str__(self):
        return self.name


# ===== PRESENTATION TEMPLATE =====
class PresentationTemplate(models.Model):
    """Reusable presentation templates"""
    CATEGORIES = [
        ('EDUCATION', 'Education'),
        ('BUSINESS', 'Business'),
        ('MARKETING', 'Marketing'),
        ('PITCH', 'Pitch Deck'),
        ('REPORT', 'Report'),
        ('OTHER', 'Other'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=50, choices=CATEGORIES, default='OTHER')

    thumbnail_url = models.URLField(blank=True, null=True)
    structure = models.JSONField(default=dict, help_text="Template structure definition")

    is_public = models.BooleanField(default=False)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'presentation_templates'

    def __str__(self):
        return self.name


# ===== PRESENTATION =====
class Presentation(models.Model):
    """Main presentation entity"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)

    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='owned_presentations')
    group = models.ForeignKey(Group, on_delete=models.SET_NULL, null=True, blank=True, related_name='presentations')
    brand_kit = models.ForeignKey(BrandKit, on_delete=models.SET_NULL, null=True, blank=True)

    # Canvas settings
    canvas_settings = models.JSONField(default=dict)
    presentation_path = models.JSONField(default=list, help_text="Ordered frame IDs for presentation flow")

    # Metadata
    thumbnail_url = models.URLField(blank=True, null=True)
    is_template = models.BooleanField(default=False)
    is_public = models.BooleanField(default=False)
    share_token = models.CharField(max_length=64, unique=True, blank=True, null=True)

    # Stats
    view_count = models.IntegerField(default=0)
    last_presented_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'presentations'
        indexes = [
            models.Index(fields=['owner', 'created_at']),
            models.Index(fields=['group']),
        ]
        ordering = ['-updated_at']

    def __str__(self):
        return self.title


# ===== PRESENTATION ACCESS =====
class PresentationAccess(models.Model):
    """Granular access control for presentations"""
    PERMISSIONS = [
        ('VIEWER', 'Viewer'),
        ('COMMENTER', 'Commenter'),
        ('EDITOR', 'Editor'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    presentation = models.ForeignKey(Presentation, on_delete=models.CASCADE, related_name='access_grants')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    permission = models.CharField(max_length=20, choices=PERMISSIONS)

    granted_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='granted_accesses')
    granted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'presentation_access'
        unique_together = [['presentation', 'user']]

    def __str__(self):
        return f"{self.user.username} - {self.permission} on {self.presentation.title}"


# ===== FRAME =====
class Frame(models.Model):
    """Individual frames/slides in a presentation"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    presentation = models.ForeignKey(Presentation, on_delete=models.CASCADE, related_name='frames')
    title = models.CharField(max_length=255, blank=True)

    # Position on canvas
    position = models.JSONField(default=dict, help_text="x, y, width, height, rotation")

    # Styling
    background_color = models.CharField(max_length=7, default='#FFFFFF')
    background_image = models.URLField(blank=True, null=True)

    # Order for presentation flow
    order = models.IntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'frames'
        indexes = [
            models.Index(fields=['presentation', 'order']),
        ]
        ordering = ['order']

    def __str__(self):
        return f"{self.presentation.title} - {self.title or 'Untitled'}"


# ===== FRAME CONNECTION =====
class FrameConnection(models.Model):
    """Connections between frames for non-linear navigation"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    from_frame = models.ForeignKey(Frame, on_delete=models.CASCADE, related_name='outgoing_connections')
    to_frame = models.ForeignKey(Frame, on_delete=models.CASCADE, related_name='incoming_connections')

    label = models.CharField(max_length=100, blank=True)
    trigger_type = models.CharField(max_length=50, default='click', help_text="click, hover, auto")

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'frame_connections'
        unique_together = [['from_frame', 'to_frame']]

    def __str__(self):
        return f"{self.from_frame.title} -> {self.to_frame.title}"


# ===== ELEMENT =====
class Element(models.Model):
    """Content elements within frames"""
    ELEMENT_TYPES = [
        ('TEXT', 'Text'),
        ('IMAGE', 'Image'),
        ('VIDEO', 'Video'),
        ('SHAPE', 'Shape'),
        ('ICON', 'Icon'),
        ('CHART', 'Chart'),
        ('TABLE', 'Table'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    frame = models.ForeignKey(Frame, on_delete=models.CASCADE, related_name='elements')
    element_type = models.CharField(max_length=20, choices=ELEMENT_TYPES)

    # Position within frame
    position = models.JSONField(default=dict, help_text="x, y, width, height, rotation, z-index")

    # Content (type-specific data)
    content = models.JSONField(default=dict)

    # Styling
    style = models.JSONField(default=dict, blank=True)

    # Interactions
    link_url = models.URLField(blank=True, null=True)
    locked = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'elements'
        indexes = [
            models.Index(fields=['frame', 'element_type']),
        ]

    def __str__(self):
        return f"{self.element_type} in {self.frame.title}"


# ===== COMMENT =====
class Comment(models.Model):
    """Comments on presentations or specific frames"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    presentation = models.ForeignKey(Presentation, on_delete=models.CASCADE, related_name='comments')
    frame = models.ForeignKey(Frame, on_delete=models.CASCADE, null=True, blank=True, related_name='comments')

    author = models.ForeignKey(User, on_delete=models.CASCADE)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies')

    content = models.TextField()
    position = models.JSONField(null=True, blank=True, help_text="Optional position marker on canvas")

    is_resolved = models.BooleanField(default=False)
    resolved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='resolved_comments')
    resolved_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'comments'
        ordering = ['created_at']

    def __str__(self):
        return f"Comment by {self.author.username} on {self.presentation.title}"


# ===== PRESENTATION VERSION =====
class PresentationVersion(models.Model):
    """Version snapshots of presentations"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    presentation = models.ForeignKey(Presentation, on_delete=models.CASCADE, related_name='versions')
    version_number = models.IntegerField()

    snapshot = models.JSONField(help_text="Full presentation data snapshot")
    notes = models.TextField(blank=True)

    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'presentation_versions'
        ordering = ['-version_number']
        unique_together = [['presentation', 'version_number']]

    def __str__(self):
        return f"{self.presentation.title} v{self.version_number}"


# ===== RECORDING =====
class Recording(models.Model):
    """Recorded presentation sessions"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    presentation = models.ForeignKey(Presentation, on_delete=models.CASCADE, related_name='recordings')

    title = models.CharField(max_length=255)
    recording_url = models.URLField()
    duration = models.IntegerField(help_text="Duration in seconds")

    share_token = models.CharField(max_length=64, unique=True, blank=True, null=True)

    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'recordings'
        ordering = ['-created_at']

    def __str__(self):
        return self.title


# ===== COLLABORATION SESSION =====
class CollaborationSession(models.Model):
    """Active real-time collaboration sessions"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    presentation = models.ForeignKey(Presentation, on_delete=models.CASCADE, related_name='sessions')
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    # Presence data
    cursor_position = models.JSONField(default=dict)
    selected_element_id = models.UUIDField(null=True, blank=True)
    color = models.CharField(max_length=7, default='#3B82F6')

    # WebSocket connection
    channel_name = models.CharField(max_length=255)

    joined_at = models.DateTimeField(auto_now_add=True)
    last_seen = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'collaboration_sessions'
        indexes = [
            models.Index(fields=['presentation', 'user']),
        ]

    def __str__(self):
        return f"{self.user.username} in {self.presentation.title}"
