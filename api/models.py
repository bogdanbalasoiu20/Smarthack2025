from django.db import models
from django.contrib.auth.models import User


class Presentation(models.Model):
    """Main presentation entity."""

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="presentations",
    )

    canvas_config = models.JSONField(default=dict, blank=True)
    viewport_state = models.JSONField(default=dict, blank=True)

    thumbnail_url = models.URLField(blank=True, null=True)
    is_template = models.BooleanField(default=False)
    is_public = models.BooleanField(default=False)
    share_token = models.CharField(max_length=64, unique=True, blank=True, null=True)

    view_count = models.IntegerField(default=0)
    last_presented_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self) -> str:
        return self.title


class Frame(models.Model):
    """Canvas frame (slide)."""

    presentation = models.ForeignKey(
        Presentation,
        on_delete=models.CASCADE,
        related_name="frames",
    )
    title = models.CharField(max_length=255, blank=True)

    x = models.FloatField(default=0)
    y = models.FloatField(default=0)
    width = models.FloatField(default=1920)
    height = models.FloatField(default=1080)
    rotation = models.FloatField(default=0)
    z_index = models.IntegerField(default=0)

    background_color = models.CharField(max_length=7, default="#FFFFFF")
    background_image = models.URLField(blank=True, null=True)
    border_style = models.JSONField(default=dict, blank=True)

    order_index = models.IntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["order_index"]

    def __str__(self) -> str:
        return f"{self.presentation.title} - {self.title or 'Frame'}"


class Element(models.Model):
    """Content element inside a frame."""

    ELEMENT_TYPES = [
        ("text", "Text"),
        ("image", "Image"),
        ("video", "Video"),
        ("shape", "Shape"),
        ("line", "Line"),
        ("arrow", "Arrow"),
        ("icon", "Icon"),
    ]

    presentation = models.ForeignKey(
        Presentation,
        on_delete=models.CASCADE,
        related_name="elements",
    )
    frame = models.ForeignKey(
        Frame,
        on_delete=models.CASCADE,
        related_name="elements",
        null=True,
        blank=True,
    )

    type = models.CharField(max_length=20, choices=ELEMENT_TYPES)
    x = models.FloatField(default=0)
    y = models.FloatField(default=0)
    width = models.FloatField(default=100)
    height = models.FloatField(default=100)
    rotation = models.FloatField(default=0)
    scale_x = models.FloatField(default=1)
    scale_y = models.FloatField(default=1)
    z_index = models.IntegerField(default=0)
    content = models.JSONField(default=dict, blank=True)
    style = models.JSONField(default=dict, blank=True)
    locked = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["z_index", "created_at"]

    def __str__(self) -> str:
        return f"{self.type} element in {self.presentation.title}"


class Comment(models.Model):
    """Comments on frames or elements."""

    presentation = models.ForeignKey(
        Presentation,
        on_delete=models.CASCADE,
        related_name="comments",
    )
    frame = models.ForeignKey(
        Frame,
        on_delete=models.CASCADE,
        related_name="comments",
        null=True,
        blank=True,
    )
    element = models.ForeignKey(
        Element,
        on_delete=models.CASCADE,
        related_name="comments",
        null=True,
        blank=True,
    )
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    parent = models.ForeignKey(
        "self",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="replies",
    )

    content = models.TextField()
    position = models.JSONField(null=True, blank=True)
    is_resolved = models.BooleanField(default=False)
    resolved_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="resolved_comments",
    )
    resolved_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self) -> str:
        return f"Comment by {self.author.username} on {self.presentation.title}"


class CollaborationSession(models.Model):
    """Active live-editing sessions for presence tracking."""

    presentation = models.ForeignKey(
        Presentation,
        on_delete=models.CASCADE,
        related_name="sessions",
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    cursor_position = models.JSONField(default=dict, blank=True)
    selected_element_id = models.IntegerField(null=True, blank=True)
    viewport_state = models.JSONField(default=dict, blank=True)
    channel_name = models.CharField(max_length=255)
    color = models.CharField(max_length=7)

    joined_at = models.DateTimeField(auto_now_add=True)
    last_seen = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return f"{self.user.username} in {self.presentation.title}"


class AccessControlEntry(models.Model):
    """Fine grained permissions per presentation."""

    ROLES = [
        ("owner", "Owner"),
        ("editor", "Editor"),
        ("commenter", "Commenter"),
        ("viewer", "Viewer"),
    ]

    presentation = models.ForeignKey(
        Presentation,
        on_delete=models.CASCADE,
        related_name="access_entries",
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=ROLES, default="viewer")
    granted_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name="granted_permissions",
    )
    granted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("presentation", "user")
        ordering = ["-granted_at"]

    def __str__(self) -> str:
        return f"{self.user.username} - {self.role} on {self.presentation.title}"


PresentationAccess = AccessControlEntry
