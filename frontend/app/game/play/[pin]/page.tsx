"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';

type Player = {
  id: number;
  nickname: string;
  score: number;
  streak: number;
};

type Question = {
  id: number;
  text: string;
  time_limit: number;
  choices: Array<{
    id: number;
    text: string;
    order: number;
  }>;
};

type GameState = 'lobby' | 'question' | 'score' | 'podium' | 'finished';

const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://127.0.0.1:8000';

const ANSWER_COLORS = [
  { bg: 'bg-red-500', hover: 'hover:bg-red-600', border: 'border-red-400', shadow: 'shadow-red-500/50' },
  { bg: 'bg-blue-500', hover: 'hover:bg-blue-600', border: 'border-blue-400', shadow: 'shadow-blue-500/50' },
  { bg: 'bg-yellow-500', hover: 'hover:bg-yellow-600', border: 'border-yellow-400', shadow: 'shadow-yellow-500/50' },
  { bg: 'bg-green-500', hover: 'hover:bg-green-600', border: 'border-green-400', shadow: 'shadow-green-500/50' },
];

export default function GamePlayPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const pin = params.pin as string;
  const urlNickname = searchParams.get('nickname') || '';

  const [gameState, setGameState] = useState<GameState>('lobby');
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [myScore, setMyScore] = useState(0);
  const [myStreak, setMyStreak] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const questionStartTime = useRef<number>(0);

  useEffect(() => {
    if (!urlNickname) {
      router.push(`/game/join?pin=${pin}`);
      return;
    }

    // Connect to WebSocket (players don't need authentication)
    const ws = new WebSocket(`${WS_BASE_URL}/ws/game/${pin}/`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);

      // Join the game
      ws.send(JSON.stringify({
        type: 'join',
        payload: {
          name: urlNickname,
        },
      }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('WebSocket message:', data);

      if (data.type === 'lobby_update') {
        setPlayers(data.payload.players);
        setGameState('lobby');
      } else if (data.type === 'question') {
        const question = data.payload.question;
        const timeLimit = data.payload.time_limit;

        setCurrentQuestion(question);
        setTimeLeft(timeLimit);
        setSelectedAnswer(null);
        setHasAnswered(false);
        setGameState('question');
        questionStartTime.current = Date.now();

        // Start countdown timer
        let remaining = timeLimit;
        timerRef.current = setInterval(() => {
          remaining -= 1;
          setTimeLeft(remaining);
          if (remaining <= 0) {
            if (timerRef.current) clearInterval(timerRef.current);
          }
        }, 1000);
      } else if (data.type === 'score_update') {
        setPlayers(data.payload.players);
        setGameState('score');
        if (timerRef.current) clearInterval(timerRef.current);

        // Update my own score
        const me = data.payload.players.find((p: Player) => p.nickname === urlNickname);
        if (me) {
          setMyScore(me.score);
          setMyStreak(me.streak);
        }
      } else if (data.type === 'end') {
        setPlayers(data.payload.players);
        setGameState('finished');
        if (timerRef.current) clearInterval(timerRef.current);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [pin, urlNickname]);

  const handleAnswerSelect = (choiceIndex: number) => {
    if (hasAnswered || !wsRef.current || !currentQuestion) return;

    setSelectedAnswer(choiceIndex);
    setHasAnswered(true);

    const timeTaken = (Date.now() - questionStartTime.current) / 1000;

    wsRef.current.send(JSON.stringify({
      type: 'answer',
      payload: {
        answer: choiceIndex,
        time_taken: timeTaken,
      },
    }));
  };

  // Lobby View
  if (gameState === 'lobby') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="max-w-3xl w-full text-center">
          <h1 className="text-6xl font-black text-white mb-8" style={{
            textShadow: '0 0 40px rgba(255,255,255,0.5)',
          }}>
            Get Ready!
          </h1>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-12 mb-8">
            <p className="text-3xl text-white font-bold mb-4">
              You joined as <span className="text-purple-300">{urlNickname}</span>
            </p>
            <p className="text-xl text-purple-200">
              Waiting for the host to start the game...
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <h3 className="text-white font-bold text-xl mb-4">
              Players in lobby ({players.length})
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {players.map((player, index) => (
                <div
                  key={player.id}
                  className={`p-3 rounded-xl ${
                    player.nickname === urlNickname
                      ? 'bg-purple-500/30 border-2 border-purple-400'
                      : 'bg-white/10'
                  }`}
                >
                  <p className="text-white font-semibold truncate">{player.nickname}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Question View
  if (gameState === 'question' && currentQuestion) {
    const progress = ((currentQuestion.time_limit - timeLeft) / currentQuestion.time_limit) * 100;

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex flex-col p-4">
        {/* Timer Bar */}
        <div className="w-full bg-white/20 rounded-full h-4 mb-6 overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ${
              timeLeft > 10 ? 'bg-green-500' : timeLeft > 5 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${100 - progress}%` }}
          />
        </div>

        {/* Time Display */}
        <div className="text-center mb-8">
          <div className={`text-8xl font-black ${
            timeLeft > 10 ? 'text-white' : timeLeft > 5 ? 'text-yellow-300' : 'text-red-400 animate-pulse'
          }`} style={{
            textShadow: '0 0 40px rgba(255,255,255,0.5)',
          }}>
            {timeLeft}
          </div>
        </div>

        {/* Question */}
        <div className="flex-1 flex flex-col max-w-6xl mx-auto w-full">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white text-center">
              {currentQuestion.text}
            </h2>
          </div>

          {/* Answer Choices */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
            {currentQuestion.choices.sort((a, b) => a.order - b.order).map((choice, index) => {
              const colorScheme = ANSWER_COLORS[index % ANSWER_COLORS.length];
              const isSelected = selectedAnswer === index;

              return (
                <button
                  key={choice.id}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={hasAnswered}
                  className={`${colorScheme.bg} ${!hasAnswered && colorScheme.hover} border-4 ${colorScheme.border} rounded-3xl p-8 text-white font-bold text-2xl md:text-3xl transition-all duration-200 transform ${
                    !hasAnswered ? 'hover:scale-105' : ''
                  } ${hasAnswered && !isSelected ? 'opacity-50 cursor-not-allowed' : ''} ${
                    isSelected ? `scale-105 ${colorScheme.shadow} shadow-2xl` : ''
                  }`}
                  style={{
                    boxShadow: isSelected ? `0 20px 60px rgba(168, 85, 247, 0.4)` : 'none',
                  }}
                >
                  {choice.text}
                </button>
              );
            })}
          </div>

          {hasAnswered && (
            <div className="mt-6 text-center">
              <div className="bg-green-500/20 border border-green-400 rounded-2xl p-4 inline-block">
                <p className="text-green-300 font-bold text-xl">
                  ✓ Answer Submitted!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Score View
  if (gameState === 'score') {
    const myRank = players.findIndex(p => p.nickname === urlNickname) + 1;
    const topPlayers = players.slice(0, 5);

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full">
          <h1 className="text-6xl font-black text-white text-center mb-12" style={{
            textShadow: '0 0 40px rgba(255,255,255,0.5)',
          }}>
            Leaderboard
          </h1>

          {/* My Stats */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl p-8 mb-8 shadow-2xl">
            <h2 className="text-white text-3xl font-bold mb-4">Your Stats</h2>
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-5xl font-black text-white mb-2">#{myRank}</div>
                <div className="text-purple-100">Rank</div>
              </div>
              <div>
                <div className="text-5xl font-black text-white mb-2">{myScore}</div>
                <div className="text-purple-100">Score</div>
              </div>
              <div>
                <div className="text-5xl font-black text-white mb-2">{myStreak}</div>
                <div className="text-purple-100">Streak</div>
              </div>
            </div>
          </div>

          {/* Top 5 */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8">
            <h3 className="text-white text-2xl font-bold mb-6">Top Players</h3>
            <div className="space-y-4">
              {topPlayers.map((player, index) => (
                <div
                  key={player.id}
                  className={`flex items-center justify-between p-4 rounded-2xl ${
                    player.nickname === urlNickname
                      ? 'bg-purple-500/30 border-2 border-purple-400'
                      : 'bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 flex items-center justify-center rounded-full font-black text-white ${
                      index === 0 ? 'bg-yellow-500' :
                      index === 1 ? 'bg-gray-400' :
                      index === 2 ? 'bg-orange-600' : 'bg-gray-600'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-white font-bold text-xl">{player.nickname}</p>
                      {player.streak > 0 && (
                        <p className="text-orange-300 text-sm">🔥 {player.streak} streak</p>
                      )}
                    </div>
                  </div>
                  <div className="text-white font-black text-2xl">{player.score}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mt-8">
            <p className="text-purple-200 text-xl">Next question coming soon...</p>
          </div>
        </div>
      </div>
    );
  }

  // Finished/Podium View
  if (gameState === 'finished') {
    const top3 = players.slice(0, 3);
    const myRank = players.findIndex(p => p.nickname === urlNickname) + 1;

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="max-w-5xl w-full text-center">
          <h1 className="text-7xl font-black text-white mb-12" style={{
            textShadow: '0 0 60px rgba(255,255,255,0.6)',
          }}>
            Game Over!
          </h1>

          {/* Podium */}
          {top3.length >= 3 && (
            <div className="flex items-end justify-center gap-4 mb-12">
              {/* 2nd Place */}
              <div className="flex-1 max-w-xs">
                <div className="bg-gradient-to-br from-gray-300 to-gray-500 rounded-t-3xl p-6 text-center">
                  <div className="text-6xl mb-2">🥈</div>
                  <p className="text-gray-900 font-black text-2xl mb-2">{top3[1].nickname}</p>
                  <p className="text-gray-700 font-bold text-3xl">{top3[1].score}</p>
                </div>
                <div className="bg-gray-400 h-32 rounded-b-2xl flex items-center justify-center">
                  <div className="text-gray-900 font-black text-4xl">2</div>
                </div>
              </div>

              {/* 1st Place */}
              <div className="flex-1 max-w-xs">
                <div className="bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-t-3xl p-8 text-center transform scale-110">
                  <div className="text-7xl mb-2">👑</div>
                  <p className="text-yellow-900 font-black text-3xl mb-2">{top3[0].nickname}</p>
                  <p className="text-yellow-800 font-bold text-4xl">{top3[0].score}</p>
                </div>
                <div className="bg-yellow-400 h-48 rounded-b-2xl flex items-center justify-center">
                  <div className="text-yellow-900 font-black text-5xl">1</div>
                </div>
              </div>

              {/* 3rd Place */}
              <div className="flex-1 max-w-xs">
                <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-t-3xl p-6 text-center">
                  <div className="text-6xl mb-2">🥉</div>
                  <p className="text-orange-900 font-black text-2xl mb-2">{top3[2].nickname}</p>
                  <p className="text-orange-800 font-bold text-3xl">{top3[2].score}</p>
                </div>
                <div className="bg-orange-500 h-24 rounded-b-2xl flex items-center justify-center">
                  <div className="text-orange-900 font-black text-4xl">3</div>
                </div>
              </div>
            </div>
          )}

          {/* Your final rank */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 mb-8">
            <p className="text-purple-200 text-xl mb-2">You finished in</p>
            <p className="text-white font-black text-6xl mb-2">#{myRank}</p>
            <p className="text-purple-200 text-xl">with {myScore} points</p>
          </div>

          <button
            onClick={() => router.push('/game/join')}
            className="px-12 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-xl rounded-2xl hover:scale-105 transition-transform duration-300 shadow-lg"
          >
            Play Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
      <div className="text-white text-2xl">Loading...</div>
    </div>
  );
}
