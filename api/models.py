from django.db import models
from django.contrib.auth.models import User, Group


# ===== BRAND KIT =====
class BrandKit(models.Model):
    """Brand identity settings (colors, fonts, logos) per group/organization"""
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()
    colors = models.TextField()  # JSON stored as text
    fonts = models.TextField()   # JSON stored as text
    logos = models.TextField()   # JSON stored as text
    is_default = models.IntegerField()
    created_by = models.ForeignKey(User, models.DO_NOTHING, db_column='created_by_id')
    group = models.ForeignKey(Group, models.DO_NOTHING, blank=True, null=True, db_column='group_id')

    class Meta:
        managed = False
        db_table = 'api_brandkit'

    def __str__(self):
        return self.name


# ===== ASSET =====
class Asset(models.Model):
    """Uploaded media assets (images, videos, icons)"""
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=255)
    asset_type = models.CharField(max_length=20)
    file_url = models.CharField(max_length=500)
    thumbnail_url = models.CharField(max_length=500)
    tags = models.TextField()  # JSON stored as text
    file_size = models.IntegerField()
    created_at = models.DateTimeField()
    group = models.ForeignKey(Group, models.DO_NOTHING, blank=True, null=True, db_column='group_id')
    uploaded_by = models.ForeignKey(User, models.DO_NOTHING, db_column='uploaded_by_id')

    class Meta:
        managed = False
        db_table = 'api_asset'

    def __str__(self):
        return self.name


# ===== PRESENTATION TEMPLATE =====
class PresentationTemplate(models.Model):
    """Reusable presentation templates"""
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=255)
    description = models.TextField()
    category = models.CharField(max_length=50)
    thumbnail_url = models.CharField(max_length=500)
    structure = models.TextField()  # JSON stored as text
    is_public = models.IntegerField()
    created_at = models.DateTimeField()
    created_by = models.ForeignKey(User, models.DO_NOTHING, db_column='created_by_id')

    class Meta:
        managed = False
        db_table = 'api_presentationtemplate'

    def __str__(self):
        return self.name


# ===== PRESENTATION =====
class Presentation(models.Model):
    """Main presentation entity"""
    id = models.BigAutoField(primary_key=True)
    title = models.CharField(max_length=255)
    description = models.TextField()
    canvas_settings = models.TextField()  # JSON stored as text
    presentation_path = models.TextField()  # JSON stored as text
    thumbnail_url = models.CharField(max_length=500)
    share_token = models.CharField(unique=True, max_length=64)
    is_public = models.IntegerField()
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()
    brand_kit = models.ForeignKey(BrandKit, models.DO_NOTHING, blank=True, null=True, db_column='brand_kit_id')
    group = models.ForeignKey(Group, models.DO_NOTHING, blank=True, null=True, db_column='group_id')
    owner = models.ForeignKey(User, models.DO_NOTHING, db_column='owner_id', related_name='owned_presentations')
    template = models.ForeignKey(PresentationTemplate, models.DO_NOTHING, blank=True, null=True, db_column='template_id')

    class Meta:
        managed = False
        db_table = 'api_presentation'
        ordering = ['-updated_at']

    def __str__(self):
        return self.title


# ===== PRESENTATION ACCESS =====
class PresentationAccess(models.Model):
    """Granular access control for presentations"""
    id = models.BigAutoField(primary_key=True)
    permission = models.CharField(max_length=20)
    granted_at = models.DateTimeField()
    presentation = models.ForeignKey(Presentation, models.DO_NOTHING, db_column='presentation_id',
                                    related_name='access_grants')
    user = models.ForeignKey(User, models.DO_NOTHING, db_column='user_id')
    granted_by = models.ForeignKey(User, models.DO_NOTHING, blank=True, null=True,
                                   db_column='granted_by_id', related_name='granted_accesses')

    class Meta:
        managed = False
        db_table = 'api_presentationaccess'

    def __str__(self):
        return f"{self.user.username} - {self.permission}"


# ===== FRAME =====
class Frame(models.Model):
    """Individual frames/slides in a presentation"""
    id = models.BigAutoField(primary_key=True)
    title = models.CharField(max_length=255)
    position = models.TextField()  # JSON stored as text
    background_color = models.CharField(max_length=20)
    background_image = models.CharField(max_length=500)
    order = models.IntegerField()
    thumbnail_url = models.CharField(max_length=500)
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()
    presentation = models.ForeignKey(Presentation, models.DO_NOTHING, db_column='presentation_id',
                                    related_name='frames')

    class Meta:
        managed = False
        db_table = 'api_frame'
        ordering = ['order']

    def __str__(self):
        return self.title or 'Untitled'


# ===== FRAME CONNECTION =====
class FrameConnection(models.Model):
    """Connections between frames for non-linear navigation"""
    id = models.BigAutoField(primary_key=True)
    label = models.CharField(max_length=100)
    from_frame = models.ForeignKey(Frame, models.DO_NOTHING, db_column='from_frame_id',
                                  related_name='outgoing_connections')
    to_frame = models.ForeignKey(Frame, models.DO_NOTHING, db_column='to_frame_id',
                                related_name='incoming_connections')

    class Meta:
        managed = False
        db_table = 'api_frameconnection'
        unique_together = (('from_frame', 'to_frame'),)

    def __str__(self):
        return self.label or f"Connection {self.id}"


# ===== ELEMENT =====
class Element(models.Model):
    """Content elements within frames"""
    id = models.BigAutoField(primary_key=True)
    element_type = models.CharField(max_length=20)
    position = models.TextField()  # JSON stored as text
    content = models.TextField()   # JSON stored as text
    link_url = models.CharField(max_length=500)
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()
    frame = models.ForeignKey(Frame, models.DO_NOTHING, db_column='frame_id', related_name='elements')

    class Meta:
        managed = False
        db_table = 'api_element'

    def __str__(self):
        return f"{self.element_type} - {self.id}"


# ===== COMMENT =====
class Comment(models.Model):
    """Comments on presentations or specific frames"""
    id = models.BigAutoField(primary_key=True)
    text = models.TextField()
    position = models.TextField()  # JSON stored as text
    is_resolved = models.IntegerField()
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()
    author = models.ForeignKey(User, models.DO_NOTHING, db_column='author_id')
    element = models.ForeignKey(Element, models.DO_NOTHING, blank=True, null=True,
                               db_column='element_id', related_name='comments')
    frame = models.ForeignKey(Frame, models.DO_NOTHING, blank=True, null=True,
                             db_column='frame_id', related_name='comments')
    presentation = models.ForeignKey(Presentation, models.DO_NOTHING, db_column='presentation_id',
                                    related_name='comments')

    class Meta:
        managed = False
        db_table = 'api_comment'
        ordering = ['created_at']

    def __str__(self):
        return f"Comment by {self.author.username}"


# ===== PRESENTATION VERSION =====
class PresentationVersion(models.Model):
    """Version snapshots of presentations"""
    id = models.BigAutoField(primary_key=True)
    version_number = models.IntegerField()
    snapshot = models.TextField()  # JSON stored as text
    notes = models.TextField()
    created_at = models.DateTimeField()
    created_by = models.ForeignKey(User, models.DO_NOTHING, db_column='created_by_id')
    presentation = models.ForeignKey(Presentation, models.DO_NOTHING, db_column='presentation_id',
                                    related_name='versions')

    class Meta:
        managed = False
        db_table = 'api_presentationversion'
        ordering = ['-version_number']

    def __str__(self):
        return f"v{self.version_number}"


# ===== RECORDING =====
class Recording(models.Model):
    """Recorded presentation sessions"""
    id = models.BigAutoField(primary_key=True)
    title = models.CharField(max_length=255)
    recording_url = models.CharField(max_length=500)
    duration = models.IntegerField()
    share_token = models.CharField(max_length=64)
    created_at = models.DateTimeField()
    created_by = models.ForeignKey(User, models.DO_NOTHING, db_column='created_by_id')
    presentation = models.ForeignKey(Presentation, models.DO_NOTHING, db_column='presentation_id',
                                    related_name='recordings')

    class Meta:
        managed = False
        db_table = 'api_recording'
        ordering = ['-created_at']

    def __str__(self):
        return self.title


# ===== COLLABORATION SESSION =====
class CollaborationSession(models.Model):
    """Active real-time collaboration sessions"""
    id = models.BigAutoField(primary_key=True)
    cursor_position = models.TextField()  # JSON stored as text
    selected_element_id = models.CharField(max_length=36, blank=True, null=True)
    color = models.CharField(max_length=7)
    channel_name = models.CharField(max_length=255)
    joined_at = models.DateTimeField()
    last_seen = models.DateTimeField()
    presentation = models.ForeignKey(Presentation, models.DO_NOTHING, db_column='presentation_id',
                                    related_name='sessions')
    user = models.ForeignKey(User, models.DO_NOTHING, db_column='user_id')

    class Meta:
        managed = False
        db_table = 'api_collaborationsession'

    def __str__(self):
        return f"{self.user.username} in session"


# ===== ACCESS CONTROL ENTRY (legacy/compatibility) =====
class AccessControlEntry(models.Model):
    """Legacy access control - use PresentationAccess instead"""
    id = models.BigAutoField(primary_key=True)
    role = models.CharField(max_length=20)
    granted_at = models.DateTimeField()
    presentation = models.ForeignKey(Presentation, models.DO_NOTHING, db_column='presentation_id')
    user = models.ForeignKey(User, models.DO_NOTHING, db_column='user_id')
    granted_by = models.ForeignKey(User, models.DO_NOTHING, blank=True, null=True,
                                  db_column='granted_by_id', related_name='granted_entries')

    class Meta:
        managed = False
        db_table = 'api_accesscontrolentry'

    def __str__(self):
        return f"{self.user.username} - {self.role}"
