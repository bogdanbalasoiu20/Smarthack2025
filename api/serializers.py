from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth import get_user_model
from .models import (
    Presentation, Frame, Element,
    Comment, CollaborationSession, AccessControlEntry
)

User = get_user_model()


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        username = data.get('username')
        password = data.get('password')

        if username and password:
            user = authenticate(username=username, password=password)
            if user:
                if user.is_active:
                    data['user'] = user
                else:
                    raise serializers.ValidationError('User account is disabled.')
            else:
                raise serializers.ValidationError('Unable to log in with provided credentials.')
        else:
            raise serializers.ValidationError('Must include "username" and "password".')

        return data


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name')
        read_only_fields = ('id',)


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password2', 'first_name', 'last_name')

    def validate(self, data):
        if data.get('password') != data.get('password2'):
            raise serializers.ValidationError({"password2": "Passwords do not match."})
        return data

    def create(self, validated_data):
        validated_data.pop('password2', None)
        password = validated_data.pop('password')
        user = User.objects.create_user(
            password=password,
            **validated_data
        )
        return user


class ElementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Element
        fields = ('id', 'frame', 'presentation', 'type', 'x', 'y',
                 'width', 'height', 'rotation', 'scale_x', 'scale_y',
                 'z_index', 'content', 'style', 'locked',
                 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')


class FrameSerializer(serializers.ModelSerializer):
    elements = ElementSerializer(many=True, read_only=True)
    element_count = serializers.IntegerField(source='elements.count', read_only=True)

    class Meta:
        model = Frame
        fields = ('id', 'presentation', 'title', 'x', 'y', 'width', 'height',
                 'rotation', 'z_index', 'background_color', 'background_image',
                 'border_style', 'order_index', 'elements', 'element_count',
                 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')


class PresentationListSerializer(serializers.ModelSerializer):
    owner_name = serializers.CharField(source='owner.username', read_only=True)
    frame_count = serializers.IntegerField(source='frames.count', read_only=True)

    class Meta:
        model = Presentation
        fields = ('id', 'title', 'description', 'thumbnail_url',
                 'owner', 'owner_name',
                 'is_public', 'frame_count', 'view_count',
                 'created_at', 'updated_at', 'last_presented_at')
        read_only_fields = ('id', 'owner', 'created_at', 'updated_at')


class PresentationDetailSerializer(serializers.ModelSerializer):
    owner_name = serializers.CharField(source='owner.username', read_only=True)
    frames = FrameSerializer(many=True, read_only=True)
    elements = ElementSerializer(many=True, read_only=True)

    class Meta:
        model = Presentation
        fields = ('id', 'title', 'description', 'owner', 'owner_name',
                 'canvas_config', 'viewport_state',
                 'thumbnail_url', 'is_template', 'is_public', 'share_token',
                 'frames', 'elements', 'view_count', 'created_at',
                 'updated_at', 'last_presented_at')
        read_only_fields = ('id', 'owner', 'created_at', 'updated_at')


class CommentSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.username', read_only=True)
    replies = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ('id', 'presentation', 'frame', 'element', 'author',
                 'author_name', 'parent', 'content',
                 'position', 'is_resolved', 'resolved_by', 'resolved_at',
                 'replies', 'created_at', 'updated_at')
        read_only_fields = ('id', 'author', 'created_at', 'updated_at')

    def get_replies(self, obj):
        if obj.replies.exists():
            return CommentSerializer(obj.replies.all(), many=True).data
        return []


class CollaborationSessionSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = CollaborationSession
        fields = ('id', 'presentation', 'user', 'user_name',
                 'cursor_position', 'selected_element_id', 'viewport_state',
                 'color', 'joined_at', 'last_seen')
        read_only_fields = ('id', 'joined_at', 'last_seen')


class AccessControlEntrySerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = AccessControlEntry
        fields = ('id', 'presentation', 'user', 'user_name', 'user_email',
                 'role', 'granted_by', 'granted_at')
        read_only_fields = ('id', 'granted_at')
