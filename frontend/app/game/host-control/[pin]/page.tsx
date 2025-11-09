"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getStoredToken } from '@/lib/authToken';

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

type GameState = 'question' | 'score' | 'finished';

const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://127.0.0.1:8000';

export default function HostControlPage() {
  const router = useRouter();
  const params = useParams();
  const pin = params.pin as string;

  const [gameState, setGameState] = useState<GameState>('question');
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      router.replace('/login');
      return;
    }

    // Connect to WebSocket with token authentication
    const ws = new WebSocket(`${WS_BASE_URL}/ws/game/${pin}/?token=${token}`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('Host WebSocket connected');
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Host WebSocket message:', data);

      if (data.type === 'question') {
        const question = data.payload.question;
        const timeLimit = data.payload.time_limit;

        setCurrentQuestion(question);
        setTimeLeft(timeLimit);
        setAnsweredCount(0);
        setGameState('question');

        // Start countdown timer
        let remaining = timeLimit;
        timerRef.current = setInterval(() => {
          remaining -= 1;
          setTimeLeft(remaining);
          if (remaining <= 0) {
            if (timerRef.current) clearInterval(timerRef.current);
          }
        }, 1000);
      } else if (data.type === 'answered_count') {
        setAnsweredCount(data.payload.count);
      } else if (data.type === 'score_update') {
        setPlayers(data.payload.players);
        setGameState('score');
        if (timerRef.current) clearInterval(timerRef.current);
      } else if (data.type === 'end') {
        setPlayers(data.payload.players);
        setGameState('finished');
        if (timerRef.current) clearInterval(timerRef.current);
      } else if (data.type === 'lobby_update') {
        // Ignore lobby updates on host control page
        console.log('Ignoring lobby_update on host control page');
      }
    };

    ws.onclose = (event) => {
      console.log('Host WebSocket disconnected', event.code, event.reason);
      setIsConnected(false);
    };

    ws.onerror = (error) => {
      console.error('Host WebSocket error:', error);
      console.error('WebSocket readyState:', ws.readyState);
      console.error('WebSocket URL:', ws.url);
      setIsConnected(false);
    };

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [pin]);

  const handleNext = () => {
    if (wsRef.current && isConnected) {
      wsRef.current.send(JSON.stringify({
        type: 'host_next',
        payload: {},
      }));
    }
  };

  // Question View
  if (gameState === 'question' && currentQuestion) {
    const progress = ((currentQuestion.time_limit - timeLeft) / currentQuestion.time_limit) * 100;
    const answerRate = players.length > 0 ? Math.round((answeredCount / players.length) * 100) : 0;

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-4xl font-black text-white">Host Control</h1>
              <p className="text-purple-300">PIN: {pin}</p>
            </div>
            <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
              isConnected ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
            }`}>
              {isConnected ? '● Live' : '● Disconnected'}
            </div>
          </div>

          {/* Timer and Progress */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Timer */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 text-center">
              <p className="text-purple-300 text-sm font-semibold uppercase tracking-wider mb-2">Time Remaining</p>
              <div className={`text-8xl font-black mb-4 ${
                timeLeft > 10 ? 'text-white' : timeLeft > 5 ? 'text-yellow-300' : 'text-red-400 animate-pulse'
              }`}>
                {timeLeft}s
              </div>
              <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 ${
                    timeLeft > 10 ? 'bg-green-500' : timeLeft > 5 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${100 - progress}%` }}
                />
              </div>
            </div>

            {/* Answer Stats */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8">
              <p className="text-purple-300 text-sm font-semibold uppercase tracking-wider mb-2">Answers</p>
              <div className="flex items-end justify-between mb-4">
                <div className="text-6xl font-black text-white">{answeredCount}</div>
                <div className="text-2xl text-purple-300">/ {players.length}</div>
              </div>
              <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden mb-2">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                  style={{ width: `${answerRate}%` }}
                />
              </div>
              <p className="text-purple-300 text-sm">{answerRate}% of players answered</p>
            </div>
          </div>

          {/* Current Question */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 mb-6">
            <p className="text-purple-300 text-sm font-semibold uppercase tracking-wider mb-4">Current Question</p>
            <h2 className="text-4xl font-bold text-white mb-6">{currentQuestion.text}</h2>
            <div className="grid grid-cols-2 gap-4">
              {currentQuestion.choices.sort((a, b) => a.order - b.order).map((choice, index) => (
                <div
                  key={choice.id}
                  className="bg-white/10 border-2 border-white/30 rounded-2xl p-6"
                >
                  <span className="text-purple-300 font-bold mr-2">Option {index + 1}:</span>
                  <span className="text-white font-semibold text-lg">{choice.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex justify-center gap-4">
            <button
              onClick={handleNext}
              className="px-12 py-4 bg-gradient-to-r from-green-500 to-blue-500 text-white font-black text-xl rounded-2xl hover:scale-105 transition-transform duration-300 shadow-lg"
            >
              Show Results →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Score View
  if (gameState === 'score') {
    const top5 = players.slice(0, 5);

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-5xl font-black text-white">Leaderboard</h1>
            <div className="text-purple-300">PIN: {pin}</div>
          </div>

          {/* Top 5 Leaderboard */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 mb-8">
            <h2 className="text-3xl font-bold text-white mb-6">Top 5 Players</h2>
            <div className="space-y-4">
              {top5.map((player, index) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between bg-white/10 border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all"
                >
                  <div className="flex items-center gap-6">
                    <div className={`w-16 h-16 flex items-center justify-center rounded-full font-black text-white text-2xl ${
                      index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                      index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500' :
                      index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600' :
                      'bg-gradient-to-br from-blue-400 to-blue-600'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-white font-bold text-2xl">{player.nickname}</p>
                      {player.streak > 0 && (
                        <p className="text-orange-300 text-sm font-semibold">
                          🔥 {player.streak} answer streak
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-white font-black text-3xl">{player.score}</div>
                </div>
              ))}
            </div>
          </div>

          {/* All Players */}
          {players.length > 5 && (
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">All Players ({players.length})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                {players.map((player, index) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between bg-white/10 rounded-xl p-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-purple-300 font-bold">#{index + 1}</span>
                      <span className="text-white font-semibold">{player.nickname}</span>
                    </div>
                    <span className="text-white font-bold">{player.score}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Control Buttons */}
          <div className="flex justify-center gap-4">
            <button
              onClick={handleNext}
              className="px-12 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-black text-xl rounded-2xl hover:scale-105 transition-transform duration-300 shadow-lg"
            >
              Next Question →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Finished View
  if (gameState === 'finished') {
    const top3 = players.slice(0, 3);

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-6xl font-black text-white text-center mb-12">Game Over!</h1>

          {/* Podium */}
          {top3.length >= 3 && (
            <div className="flex items-end justify-center gap-6 mb-12">
              {/* 2nd Place */}
              <div className="flex-1 max-w-sm">
                <div className="bg-gradient-to-br from-gray-300 to-gray-500 rounded-t-3xl p-8 text-center">
                  <div className="text-7xl mb-4">🥈</div>
                  <p className="text-gray-900 font-black text-3xl mb-2">{top3[1].nickname}</p>
                  <p className="text-gray-700 font-bold text-4xl">{top3[1].score}</p>
                </div>
                <div className="bg-gray-400 h-40 rounded-b-3xl flex items-center justify-center">
                  <div className="text-gray-900 font-black text-6xl">2</div>
                </div>
              </div>

              {/* 1st Place */}
              <div className="flex-1 max-w-sm">
                <div className="bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-t-3xl p-10 text-center transform scale-110">
                  <div className="text-8xl mb-4">👑</div>
                  <p className="text-yellow-900 font-black text-4xl mb-2">{top3[0].nickname}</p>
                  <p className="text-yellow-800 font-bold text-5xl">{top3[0].score}</p>
                </div>
                <div className="bg-yellow-400 h-56 rounded-b-3xl flex items-center justify-center">
                  <div className="text-yellow-900 font-black text-7xl">1</div>
                </div>
              </div>

              {/* 3rd Place */}
              <div className="flex-1 max-w-sm">
                <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-t-3xl p-8 text-center">
                  <div className="text-7xl mb-4">🥉</div>
                  <p className="text-orange-900 font-black text-3xl mb-2">{top3[2].nickname}</p>
                  <p className="text-orange-800 font-bold text-4xl">{top3[2].score}</p>
                </div>
                <div className="bg-orange-500 h-32 rounded-b-3xl flex items-center justify-center">
                  <div className="text-orange-900 font-black text-6xl">3</div>
                </div>
              </div>
            </div>
          )}

          {/* Final Stats */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">Final Standings</h2>
            <div className="space-y-3">
              {players.map((player, index) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between bg-white/10 rounded-xl p-4"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-purple-300 font-bold text-xl">#{index + 1}</span>
                    <span className="text-white font-semibold text-lg">{player.nickname}</span>
                  </div>
                  <span className="text-white font-bold text-xl">{player.score}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex justify-center gap-4">
            <button
              onClick={() => router.push('/game/host')}
              className="px-12 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-black text-xl rounded-2xl hover:scale-105 transition-transform duration-300 shadow-lg"
            >
              Back to Games
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center">
      <div className="text-white text-2xl">Connecting...</div>
    </div>
  );
}
