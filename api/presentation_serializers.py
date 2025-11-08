"""
Serializers pentru modulul de prezentări
"""
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    BrandKit, Asset, PresentationTemplate, Presentation, PresentationAccess,
    Frame, FrameConnection, Element, Comment, PresentationVersion, Recording
)
import json


# ===== USER SERIALIZER (minimal) =====
class UserMinimalSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name')
        read_only_fields = fields


# ===== BRAND KIT =====
class BrandKitSerializer(serializers.ModelSerializer):
    created_by = UserMinimalSerializer(read_only=True)
    colors_parsed = serializers.SerializerMethodField()
    fonts_parsed = serializers.SerializerMethodField()
    logos_parsed = serializers.SerializerMethodField()

    class Meta:
        model = BrandKit
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'created_by')

    def get_colors_parsed(self, obj):
        try:
            return json.loads(obj.colors)
        except:
            return []

    def get_fonts_parsed(self, obj):
        try:
            return json.loads(obj.fonts)
        except:
            return ["Inter", "Arial", "Helvetica"]

    def get_logos_parsed(self, obj):
        try:
            return json.loads(obj.logos)
        except:
            return []

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


# ===== ASSET =====
class AssetSerializer(serializers.ModelSerializer):
    uploaded_by = UserMinimalSerializer(read_only=True)
    tags_parsed = serializers.SerializerMethodField()

    class Meta:
        model = Asset
        fields = '__all__'
        read_only_fields = ('created_at', 'uploaded_by')

    def get_tags_parsed(self, obj):
        try:
            return json.loads(obj.tags) if obj.tags else []
        except:
            return []

    def create(self, validated_data):
        validated_data['uploaded_by'] = self.context['request'].user
        return super().create(validated_data)


# ===== PRESENTATION TEMPLATE =====
class PresentationTemplateSerializer(serializers.ModelSerializer):
    created_by = UserMinimalSerializer(read_only=True)
    structure_parsed = serializers.SerializerMethodField()

    class Meta:
        model = PresentationTemplate
        fields = '__all__'
        read_only_fields = ('created_at', 'created_by')

    def get_structure_parsed(self, obj):
        try:
            return json.loads(obj.structure)
        except:
            return {}

    def create(self, validated_data):
        if 'created_by' not in validated_data:
            validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


# ===== ELEMENT =====
class ElementSerializer(serializers.ModelSerializer):
    position_parsed = serializers.SerializerMethodField()
    content_parsed = serializers.SerializerMethodField()

    class Meta:
        model = Element
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')

    def get_position_parsed(self, obj):
        try:
            return json.loads(obj.position)
        except:
            return {"x": 0, "y": 0, "width": 100, "height": 100, "rotation": 0, "z_index": 1}

    def get_content_parsed(self, obj):
        try:
            return json.loads(obj.content)
        except:
            return {}


# ===== FRAME CONNECTION =====
class FrameConnectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = FrameConnection
        fields = '__all__'


# ===== FRAME =====
class FrameSerializer(serializers.ModelSerializer):
    elements = ElementSerializer(many=True, read_only=True)
    connections_from = FrameConnectionSerializer(many=True, read_only=True)
    connections_to = FrameConnectionSerializer(many=True, read_only=True)
    position_parsed = serializers.SerializerMethodField()

    class Meta:
        model = Frame
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')

    def get_position_parsed(self, obj):
        try:
            return json.loads(obj.position)
        except:
            return {"x": 0, "y": 0, "width": 1920, "height": 1080, "rotation": 0}


class FrameMinimalSerializer(serializers.ModelSerializer):
    """Fără elements - pentru listări rapide"""
    position_parsed = serializers.SerializerMethodField()

    class Meta:
        model = Frame
        fields = ('id', 'presentation', 'title', 'position', 'position_parsed',
                  'background_color', 'background_image', 'order', 'thumbnail_url')
        read_only_fields = ('id',)

    def get_position_parsed(self, obj):
        try:
            return json.loads(obj.position)
        except:
            return {"x": 0, "y": 0, "width": 1920, "height": 1080, "rotation": 0}


# ===== COMMENT =====
class CommentSerializer(serializers.ModelSerializer):
    author = UserMinimalSerializer(read_only=True)
    position_parsed = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'author')

    def get_position_parsed(self, obj):
        if obj.position:
            try:
                return json.loads(obj.position)
            except:
                return None
        return None

    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)


# ===== PRESENTATION ACCESS =====
class PresentationAccessSerializer(serializers.ModelSerializer):
    user = UserMinimalSerializer(read_only=True)
    granted_by = UserMinimalSerializer(read_only=True)
    user_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = PresentationAccess
        fields = '__all__'
        read_only_fields = ('granted_at', 'granted_by', 'user')

    def create(self, validated_data):
        validated_data['granted_by'] = self.context['request'].user
        user_id = validated_data.pop('user_id')
        validated_data['user'] = User.objects.get(id=user_id)
        return super().create(validated_data)


# ===== PRESENTATION =====
class PresentationSerializer(serializers.ModelSerializer):
    owner = UserMinimalSerializer(read_only=True)
    brand_kit_data = BrandKitSerializer(source='brand_kit', read_only=True)
    frames = FrameSerializer(many=True, read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    access_grants = PresentationAccessSerializer(many=True, read_only=True)

    canvas_settings_parsed = serializers.SerializerMethodField()
    presentation_path_parsed = serializers.SerializerMethodField()

    # Permisiune curentă pentru user-ul care face request
    current_user_permission = serializers.SerializerMethodField()

    class Meta:
        model = Presentation
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'owner', 'share_token')

    def get_canvas_settings_parsed(self, obj):
        try:
            return json.loads(obj.canvas_settings)
        except:
            return {"zoom": 1.0, "viewport": {"x": 0, "y": 0}, "background": "#ffffff"}

    def get_presentation_path_parsed(self, obj):
        try:
            return json.loads(obj.presentation_path)
        except:
            return []

    def get_current_user_permission(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return None

        if obj.owner == request.user:
            return 'OWNER'

        access = PresentationAccess.objects.filter(
            presentation=obj,
            user=request.user
        ).first()

        return access.permission if access else None

    def create(self, validated_data):
        validated_data['owner'] = self.context['request'].user
        return super().create(validated_data)


class PresentationMinimalSerializer(serializers.ModelSerializer):
    """Fără frames/comments - pentru listări"""
    owner = UserMinimalSerializer(read_only=True)
    current_user_permission = serializers.SerializerMethodField()

    class Meta:
        model = Presentation
        fields = ('id', 'title', 'description', 'owner', 'group', 'thumbnail_url',
                  'is_public', 'created_at', 'updated_at', 'current_user_permission')
        read_only_fields = ('created_at', 'updated_at', 'owner')

    def get_current_user_permission(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return None

        if obj.owner == request.user:
            return 'OWNER'

        access = PresentationAccess.objects.filter(
            presentation=obj,
            user=request.user
        ).first()

        return access.permission if access else None


# ===== PRESENTATION VERSION =====
class PresentationVersionSerializer(serializers.ModelSerializer):
    created_by = UserMinimalSerializer(read_only=True)
    snapshot_parsed = serializers.SerializerMethodField()

    class Meta:
        model = PresentationVersion
        fields = '__all__'
        read_only_fields = ('created_at', 'created_by')

    def get_snapshot_parsed(self, obj):
        try:
            return json.loads(obj.snapshot)
        except:
            return {}

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


# ===== RECORDING =====
class RecordingSerializer(serializers.ModelSerializer):
    created_by = UserMinimalSerializer(read_only=True)
    metadata_parsed = serializers.SerializerMethodField()

    class Meta:
        model = Recording
        fields = '__all__'
        read_only_fields = ('created_at', 'created_by', 'share_token')

    def get_metadata_parsed(self, obj):
        try:
            return json.loads(obj.metadata)
        except:
            return {}

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)
