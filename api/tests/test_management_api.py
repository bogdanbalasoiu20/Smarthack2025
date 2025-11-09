from django.contrib.auth.models import Group, User
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from api.models import StudentGroup


class BaseManagementTestCase(APITestCase):
    def setUp(self):
        super().setUp()
        admin_group, _ = Group.objects.get_or_create(name='ADMIN')
        self.admin = User.objects.create_user(
            username='admin',
            email='admin@example.com',
            password='StrongPass123!',
            first_name='Admin',
            last_name='User',
            is_staff=True,
        )
        self.admin.groups.add(admin_group)
        self.client.force_authenticate(self.admin)


class ManagementUserTests(BaseManagementTestCase):
    def test_admin_can_create_user_with_role(self):
        url = reverse('management-users-list')
        payload = {
            'username': 'newuser',
            'email': 'new@example.com',
            'first_name': 'New',
            'last_name': 'User',
            'password': 'SecretPass321!',
            'role': 'PROFESOR',
        }

        response = self.client.post(url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['username'], 'newuser')
        self.assertEqual(response.data['role'], 'PROFESOR')

    def test_non_admin_is_rejected(self):
        teacher = User.objects.create_user(
            username='teacher',
            password='TeacherPass456!',
        )
        self.client.force_authenticate(teacher)

        response = self.client.get(reverse('management-users-list'))

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class StudentManagementTests(BaseManagementTestCase):
    def setUp(self):
        super().setUp()
        self.group = StudentGroup.objects.create(slug='clasa-9a', name='Clasa 9A')

    def test_admin_can_create_student(self):
        url = reverse('management-students-list')
        payload = {
            'first_name': 'Alexandru',
            'last_name': 'Popescu',
            'email': 'alexandru@example.com',
            'class_id': self.group.slug,
        }

        response = self.client.post(url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['first_name'], 'Alexandru')
        self.assertEqual(response.data['classId'], self.group.slug)
        self.assertEqual(response.data['className'], self.group.name)

    def test_filter_students_by_group(self):
        other_group = StudentGroup.objects.create(slug='clasa-10b', name='Clasa 10B')
        # Create students in both groups
        self.client.post(
            reverse('management-students-list'),
            {
                'first_name': 'Maria',
                'last_name': 'Ionescu',
                'class_id': self.group.slug,
            },
            format='json',
        )
        self.client.post(
            reverse('management-students-list'),
            {
                'first_name': 'Dan',
                'last_name': 'Georgescu',
                'class_id': other_group.slug,
            },
            format='json',
        )

        response = self.client.get(
            reverse('management-students-list'),
            {'group': self.group.slug},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['classId'], self.group.slug)
