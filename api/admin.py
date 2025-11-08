from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import (
    User, Organization, Presentation, Frame, Element,
    Comment, CollaborationSession, AccessControlEntry
)


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('email', 'username', 'organization', 'role', 'is_staff', 'created_at')
    list_filter = ('role', 'is_staff', 'is_superuser', 'organization')
    search_fields = ('email', 'username', 'first_name', 'last_name')
    ordering = ('-created_at',)

    fieldsets = BaseUserAdmin.fieldsets + (
        ('Additional Info', {'fields': ('avatar_url', 'organization', 'role', 'preferences')}),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Additional Info', {'fields': ('email', 'avatar_url', 'organization', 'role')}),
    )


@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'plan', 'max_members', 'created_at')
    list_filter = ('plan',)
    search_fields = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Presentation)
class PresentationAdmin(admin.ModelAdmin):
    list_display = ('title', 'owner', 'organization', 'is_public', 'view_count', 'created_at')
    list_filter = ('is_public', 'is_template', 'created_at')
    search_fields = ('title', 'description', 'owner__username')
    raw_id_fields = ('owner', 'organization')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(Frame)
class FrameAdmin(admin.ModelAdmin):
    list_display = ('title', 'presentation', 'order_index', 'x', 'y', 'width', 'height')
    list_filter = ('created_at',)
    search_fields = ('title', 'presentation__title')
    raw_id_fields = ('presentation',)


@admin.register(Element)
class ElementAdmin(admin.ModelAdmin):
    list_display = ('type', 'presentation', 'frame', 'x', 'y', 'width', 'height', 'z_index')
    list_filter = ('type', 'locked', 'created_at')
    search_fields = ('presentation__title',)
    raw_id_fields = ('presentation', 'frame')


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('author', 'presentation', 'content_preview', 'is_resolved', 'created_at')
    list_filter = ('is_resolved', 'created_at')
    search_fields = ('content', 'author__username', 'presentation__title')
    raw_id_fields = ('presentation', 'frame', 'element', 'author', 'parent')

    def content_preview(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    content_preview.short_description = 'Content'


@admin.register(CollaborationSession)
class CollaborationSessionAdmin(admin.ModelAdmin):
    list_display = ('user', 'presentation', 'color', 'joined_at', 'last_seen')
    list_filter = ('joined_at', 'last_seen')
    search_fields = ('user__username', 'presentation__title')
    raw_id_fields = ('presentation', 'user')


@admin.register(AccessControlEntry)
class AccessControlEntryAdmin(admin.ModelAdmin):
    list_display = ('user', 'presentation', 'role', 'granted_by', 'granted_at')
    list_filter = ('role', 'granted_at')
    search_fields = ('user__username', 'presentation__title')
    raw_id_fields = ('presentation', 'user', 'granted_by')
