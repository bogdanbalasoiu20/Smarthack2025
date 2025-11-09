from django.contrib import admin
from .models import (
    BrandKit, Asset, PresentationTemplate,
    Presentation, PresentationAccess,
    Frame, FrameConnection, Element,
    Comment, PresentationVersion, Recording,
    CollaborationSession, StudentGroup, Student
)


@admin.register(BrandKit)
class BrandKitAdmin(admin.ModelAdmin):
    list_display = ("name", "group", "created_by", "created_at")
    list_filter = ("created_at", "group")
    search_fields = ("name",)
    raw_id_fields = ("created_by", "group")


@admin.register(Asset)
class AssetAdmin(admin.ModelAdmin):
    list_display = ("name", "asset_type", "group", "uploaded_by", "created_at")
    list_filter = ("asset_type", "created_at")
    search_fields = ("name",)
    raw_id_fields = ("uploaded_by", "group")


@admin.register(PresentationTemplate)
class PresentationTemplateAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "is_public", "created_by", "created_at")
    list_filter = ("category", "is_public", "created_at")
    search_fields = ("name", "description")
    raw_id_fields = ("created_by",)


@admin.register(Presentation)
class PresentationAdmin(admin.ModelAdmin):
    list_display = ("title", "owner", "group", "is_public", "created_at")
    list_filter = ("is_public", "created_at")
    search_fields = ("title", "description", "owner__username")
    raw_id_fields = ("owner", "group", "brand_kit", "template")
    readonly_fields = ("created_at", "updated_at")


@admin.register(PresentationAccess)
class PresentationAccessAdmin(admin.ModelAdmin):
    list_display = ("user", "presentation", "permission", "granted_by", "granted_at")
    list_filter = ("permission", "granted_at")
    search_fields = ("user__username", "presentation__title")
    raw_id_fields = ("presentation", "user", "granted_by")


@admin.register(Frame)
class FrameAdmin(admin.ModelAdmin):
    list_display = ("title", "presentation", "order", "background_color", "created_at")
    list_filter = ("created_at",)
    search_fields = ("title", "presentation__title")
    raw_id_fields = ("presentation",)


@admin.register(FrameConnection)
class FrameConnectionAdmin(admin.ModelAdmin):
    list_display = ("from_frame", "to_frame", "label")
    search_fields = ("label",)
    raw_id_fields = ("from_frame", "to_frame")


@admin.register(Element)
class ElementAdmin(admin.ModelAdmin):
    list_display = ("element_type", "frame", "created_at")
    list_filter = ("element_type", "created_at")
    search_fields = ("frame__title", "frame__presentation__title")
    raw_id_fields = ("frame",)


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ("author", "presentation", "text_preview", "is_resolved", "created_at")
    list_filter = ("is_resolved", "created_at")
    search_fields = ("text", "author__username", "presentation__title")
    raw_id_fields = ("presentation", "frame", "author", "element")

    def text_preview(self, obj):
        return obj.text[:50] + "..." if len(obj.text) > 50 else obj.text
    text_preview.short_description = "Text"


@admin.register(PresentationVersion)
class PresentationVersionAdmin(admin.ModelAdmin):
    list_display = ("presentation", "version_number", "created_by", "created_at")
    list_filter = ("created_at",)
    search_fields = ("presentation__title", "notes")
    raw_id_fields = ("presentation", "created_by")


@admin.register(Recording)
class RecordingAdmin(admin.ModelAdmin):
    list_display = ("title", "presentation", "duration", "created_by", "created_at")
    list_filter = ("created_at",)
    search_fields = ("title", "presentation__title")
    raw_id_fields = ("presentation", "created_by")


@admin.register(CollaborationSession)
class CollaborationSessionAdmin(admin.ModelAdmin):
    list_display = ("user", "presentation", "color", "joined_at", "last_seen")
    list_filter = ("joined_at", "last_seen")
    search_fields = ("user__username", "presentation__title")
    raw_id_fields = ("presentation", "user")


@admin.register(StudentGroup)
class StudentGroupAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "created_at", "updated_at")
    search_fields = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ("first_name", "last_name", "group", "email", "user")
    search_fields = ("first_name", "last_name", "email")
    list_filter = ("group",)
    raw_id_fields = ("group", "user")
