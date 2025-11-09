from django.db import models
from django.contrib.auth import get_user_model
import random
import string

User = get_user_model()

QUESTION_TYPES = [
    ('choice', 'Multiple Choice'),
    ('true_false', 'True/False'),
    ('puzzle', 'Puzzle/Order'),
    ('type_answer', 'Type Answer (Exact Match)'),
    ('open_ended', 'Open-Ended'), 
]

class Game(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    host = models.ForeignKey(User, on_delete=models.CASCADE, related_name='hosted_games')
    
    base_points = models.IntegerField(default=1000) 
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class GameSession(models.Model):
    """Instanța live a unui joc rulat (cea la care se conectează elevii)."""
    game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name='sessions')
    host = models.ForeignKey(User, on_delete=models.CASCADE, related_name='hosted_sessions', null=True, blank=True)

    pin = models.CharField(max_length=6, unique=True, db_index=True)

    STATUS_CHOICES = [
    ('lobby', 'Lobby'),
    ('running', 'Running'), # Întrebare activă
    ('score_display', 'Score Display'), # Afișare clasament intermediar
    ('finished', 'Finished'),
]
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='lobby')

    current_question = models.ForeignKey('Question', on_delete=models.SET_NULL, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.pin:
            self.pin = ''.join(random.choices(string.digits, k=6))
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Session {self.pin} ({self.game.title})"

class Question(models.Model):
    game = models.ForeignKey(Game, related_name='questions', on_delete=models.CASCADE)
    text = models.TextField()
    
    type = models.CharField(max_length=20, choices=QUESTION_TYPES, default='choice') 
    
    time_limit = models.IntegerField(default=20) 
    order = models.IntegerField(default=0)
    media_url = models.URLField(blank=True, null=True)

    def __str__(self):
        return f"Q{self.order}: {self.text[:50]}..."

class Choice(models.Model):
    question = models.ForeignKey(Question, related_name='choices', on_delete=models.CASCADE)
    text = models.CharField(max_length=400)
    is_correct = models.BooleanField(default=False)

    order = models.IntegerField(default=0) 

    def __str__(self):
        return f"{self.text[:30]} ({'C' if self.is_correct else 'I'})"


class Player(models.Model):
    """Reprezintă o participare unică la o sesiune de joc."""
    session = models.ForeignKey(GameSession, related_name='players', on_delete=models.CASCADE) 
    user = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL)
    nickname = models.CharField(max_length=100)
    
    
    score = models.IntegerField(default=0)
    streak = models.IntegerField(default=0) 

    joined_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.nickname} in {self.session.pin}"


class Answer(models.Model):
    player = models.ForeignKey(Player, related_name='answers', on_delete=models.CASCADE)
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
 
    choice = models.ForeignKey(Choice, null=True, blank=True, on_delete=models.SET_NULL) 
    
    submitted_answer_text = models.TextField(blank=True, null=True) 
    
    time_taken = models.FloatField(null=True, blank=True)
    
    points_awarded = models.IntegerField(default=0)
    
    answered_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Ans by {self.player.nickname} to Q{self.question.order}"