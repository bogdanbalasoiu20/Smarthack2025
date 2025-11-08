from rest_framework import serializers
from .models import Game, GameSession, Question, Choice, Player, Answer

class ChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Choice
        fields = ['id', 'text', 'is_correct', 'order']

class QuestionSerializer(serializers.ModelSerializer):
    choices = ChoiceSerializer(many=True) 

    class Meta:
        model = Question
        fields = ['id', 'text', 'type', 'time_limit', 'order', 'media_url', 'choices']


class GameSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True) 

    class Meta:
        model = Game
        fields = ['id', 'title', 'description', 'base_points', 'host', 'questions']
        read_only_fields = ['id', 'host']

    def create(self, validated_data):
        questions_data = validated_data.pop('questions')
        game = Game.objects.create(**validated_data)

        for question_data in questions_data:
            choices_data = question_data.pop('choices', []) 
            question = Question.objects.create(game=game, **question_data)
            
            for choice_data in choices_data:
                Choice.objects.create(question=question, **choice_data)
        
        return game


class GameSessionSerializer(serializers.ModelSerializer):
    game_title = serializers.CharField(source='game.title', read_only=True) 

    class Meta:
        model = GameSession
        fields = ['id', 'pin', 'status', 'game', 'current_question', 'game_title']
        read_only_fields = ['pin', 'status', 'current_question', 'game_title', 'game'] 
        
        
class PlayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Player
        fields = ['id', 'session', 'nickname', 'score', 'streak', 'joined_at']
        read_only_fields = ['session', 'score', 'streak', 'joined_at']
        
        
class AnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = ['id', 'player', 'question', 'choice', 'submitted_answer_text', 'time_taken']
        read_only_fields = ['id']