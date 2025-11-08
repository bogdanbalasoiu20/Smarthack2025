from django.contrib import admin
from .models import (
    Presentation,
    Frame,
    Element,
    Comment,
    CollaborationSession,
    AccessControlEntry,
)


@admin.register(Presentation)
class PresentationAdmin(admin.ModelAdmin):
    list_display = ("title", "owner", "is_public", "view_count", "created_at")
    list_filter = ("is_public", "is_template", "created_at")
    search_fields = ("title", "description", "owner__username")
    raw_id_fields = ("owner",)
    readonly_fields = ("created_at", "updated_at")


@admin.register(Frame)
class FrameAdmin(admin.ModelAdmin):
    list_display = ("title", "presentation", "order_index", "x", "y", "width", "height")
    list_filter = ("created_at",)
    search_fields = ("title", "presentation__title")
    raw_id_fields = ("presentation",)


@admin.register(Element)
class ElementAdmin(admin.ModelAdmin):
    list_display = ("type", "presentation", "frame", "x", "y", "width", "height", "z_index")
    list_filter = ("type", "locked", "created_at")
    search_fields = ("presentation__title",)
    raw_id_fields = ("presentation", "frame")


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ("author", "presentation", "content_preview", "is_resolved", "created_at")
    list_filter = ("is_resolved", "created_at")
    search_fields = ("content", "author__username", "presentation__title")
    raw_id_fields = ("presentation", "frame", "element", "author", "parent")

    def content_preview(self, obj):
        return obj.content[:50] + "..." if len(obj.content) > 50 else obj.content

    content_preview.short_description = "Content"


@admin.register(CollaborationSession)
class CollaborationSessionAdmin(admin.ModelAdmin):
    list_display = ("user", "presentation", "color", "joined_at", "last_seen")
    list_filter = ("joined_at", "last_seen")
    search_fields = ("user__username", "presentation__title")
    raw_id_fields = ("presentation", "user")


@admin.register(AccessControlEntry)
class AccessControlEntryAdmin(admin.ModelAdmin):
    list_display = ("user", "presentation", "role", "granted_by", "granted_at")
    list_filter = ("role", "granted_at")
    search_fields = ("user__username", "presentation__title")
    raw_id_fields = ("presentation", "user", "granted_by")
