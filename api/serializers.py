from django.contrib.auth import authenticate
from django.contrib.auth.models import Group, User
from rest_framework import serializers

from .constants import ROLE_CHOICES
from .models import Student, StudentGroup

DEFAULT_ROLE = next((value for value, _ in ROLE_CHOICES if value == 'ELEV'), ROLE_CHOICES[0][0])


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
    groups = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'groups', 'role')
        read_only_fields = ('id',)

    def get_groups(self, obj):
        return [group.name for group in obj.groups.all()]

    def get_role(self, obj):
        role_group = obj.groups.first()
        if role_group:
            return role_group.name
        if obj.is_superuser or obj.is_staff:
            return "ADMIN"
        # Default fallback so legacy accounts without explicit groups keep working.
        return "ELEV"


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True, min_length=8)
    role = serializers.ChoiceField(choices=ROLE_CHOICES, default=ROLE_CHOICES[0][0])

    class Meta:
        model = User
        fields = (
            'username',
            'email',
            'password',
            'password2',
            'first_name',
            'last_name',
            'role',
        )

    def validate(self, data):
        if data.get('password') != data.get('password2'):
            raise serializers.ValidationError({"password2": "Passwords do not match."})
        return data

    def create(self, validated_data):
        validated_data.pop('password2', None)
        role = validated_data.pop('role', ROLE_CHOICES[0][0])
        password = validated_data.pop('password')
        username = validated_data.get('username')
        email = validated_data.get('email', '')
        first_name = validated_data.get('first_name', '')
        last_name = validated_data.get('last_name', '')
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name
        )
        group, _ = Group.objects.get_or_create(name=role)
        user.groups.set([group])
        return user


class ManagementUserSerializer(serializers.ModelSerializer):
    """
    Serializer dedicated to the admin dashboard user management section.
    Allows full CRUD operations, including role assignment and password resets.
    """
    role = serializers.CharField(write_only=True, required=False)
    password = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True,
        min_length=8,
    )

    class Meta:
        model = User
        fields = (
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'is_active',
            'password',
            'role',
            'date_joined',
            'last_login',
        )
        read_only_fields = ('id', 'date_joined', 'last_login')

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['role'] = self._get_role(instance)
        return data

    def validate_role(self, value):
        if not value:
            return value
        valid_values = [choice[0] for choice in ROLE_CHOICES]
        if value not in valid_values:
            raise serializers.ValidationError('Invalid role selected.')
        return value

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        role = validated_data.pop('role', DEFAULT_ROLE)

        if not password:
            raise serializers.ValidationError({'password': 'Password is required when creating a user.'})

        user = User.objects.create_user(password=password, **validated_data)
        self._assign_role(user, role)
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        role = validated_data.pop('role', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if password:
            instance.set_password(password)

        if role:
            self._assign_role(instance, role)

        instance.save()
        return instance

    def _assign_role(self, user, role):
        if not role:
            return
        group, _ = Group.objects.get_or_create(name=role)
        user.groups.set([group])
        # Basic convenience: treat admins as staff for Django admin usage
        user.is_staff = True if role == 'ADMIN' or user.is_superuser else False

    def _get_role(self, user):
        group = user.groups.first()
        if group:
            return group.name
        if user.is_superuser or user.is_staff:
            return 'ADMIN'
        return DEFAULT_ROLE


class StudentGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentGroup
        fields = ('id', 'slug', 'name', 'description', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')


class StudentSerializer(serializers.ModelSerializer):
    class_id = serializers.SlugRelatedField(
        source='group',
        slug_field='slug',
        queryset=StudentGroup.objects.all(),
        write_only=True,
    )
    classId = serializers.CharField(source='group.slug', read_only=True)
    className = serializers.CharField(source='group.name', read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        source='user',
        queryset=User.objects.all(),
        allow_null=True,
        required=False,
    )

    class Meta:
        model = Student
        fields = (
            'id',
            'first_name',
            'last_name',
            'email',
            'user_id',
            'class_id',
            'classId',
            'className',
            'created_at',
            'updated_at',
        )
        read_only_fields = (
            'id',
            'created_at',
            'updated_at',
            'classId',
            'className',
        )
