"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getStoredToken } from '@/lib/authToken';
import QRCode from 'qrcode';

type Player = {
  id: number;
  nickname: string;
  score: number;
  streak: number;
};

const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://127.0.0.1:8000';

export default function GameLobbyPage() {
  const router = useRouter();
  const params = useParams();
  const pin = params.pin as string;

  const [players, setPlayers] = useState<Player[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [gameTitle, setGameTitle] = useState('');
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Generate QR code
    const joinUrl = `${window.location.origin}/game/join?pin=${pin}`;
    QRCode.toDataURL(joinUrl, { width: 256, margin: 2 }).then(setQrCodeUrl);

    // Connect to WebSocket
    const token = getStoredToken();
    if (!token) {
      router.replace('/login');
      return;
    }

    // Pass token in WebSocket URL query string for authentication
    const ws = new WebSocket(`${WS_BASE_URL}/ws/game/${pin}/?token=${token}`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('WebSocket message:', data);

      if (data.type === 'lobby_update') {
        setPlayers(data.payload.players);
      } else if (data.type === 'question') {
        // Game has started, navigate to host control
        router.push(`/game/host-control/${pin}`);
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
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [pin]);

  const startGame = () => {
    if (wsRef.current && isConnected && players.length > 0) {
      wsRef.current.send(JSON.stringify({
        type: 'host_start',
        payload: {},
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header with PIN */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black text-white mb-6" style={{
            textShadow: '0 0 40px rgba(255,255,255,0.5)',
          }}>
            Game Lobby
          </h1>

          {/* PIN Display */}
          <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-3xl p-8 shadow-2xl inline-block mb-8">
            <div className="text-sm font-bold text-gray-800 uppercase tracking-widest mb-2">
              Game PIN
            </div>
            <div className="text-8xl font-black text-gray-900 tracking-[0.3em]" style={{
              fontFamily: '"Courier New", monospace',
              textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
            }}>
              {pin}
            </div>
          </div>

          {/* Join Instructions */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 max-w-2xl mx-auto mb-8">
            <p className="text-purple-200 text-lg mb-2">Players can join at:</p>
            <p className="text-white text-2xl font-bold">{window.location.origin}/game/join</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: QR Code */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 text-center">
              <h3 className="text-2xl font-bold text-white mb-4">Scan to Join</h3>
              {qrCodeUrl && (
                <div className="bg-white p-4 rounded-2xl inline-block">
                  <img src={qrCodeUrl} alt="QR Code" className="w-full max-w-xs" />
                </div>
              )}
              <p className="text-purple-200 text-sm mt-4">
                Scan with phone camera
              </p>
            </div>
          </div>

          {/* Right: Players List */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-3xl font-bold text-white">
                  Players <span className="text-purple-300">({players.length})</span>
                </h3>
                <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
                  isConnected ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                }`}>
                  {isConnected ? '● Connected' : '● Disconnected'}
                </div>
              </div>

              {/* Players Grid */}
              {players.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">👥</div>
                  <p className="text-purple-200 text-xl">Waiting for players to join...</p>
                  <div className="mt-8 flex justify-center">
                    <div className="animate-pulse flex space-x-2">
                      <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-purple-400 rounded-full animation-delay-200"></div>
                      <div className="w-3 h-3 bg-purple-400 rounded-full animation-delay-400"></div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-96 overflow-y-auto pr-2">
                  {players.map((player, index) => (
                    <div
                      key={player.id}
                      className="bg-white/10 border border-white/20 rounded-2xl p-4 hover:bg-white/15 transition-all duration-200 animate-fadeIn"
                      style={{
                        animationDelay: `${index * 50}ms`,
                      }}
                    >
                      <div className="text-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-bold text-lg">
                          {player.nickname.charAt(0).toUpperCase()}
                        </div>
                        <p className="text-white font-semibold truncate">
                          {player.nickname}
                        </p>
                        <p className="text-purple-300 text-xs mt-1">
                          #{index + 1}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Start Button */}
        <div className="mt-12 text-center">
          <button
            onClick={startGame}
            disabled={!isConnected || players.length === 0}
            className={`px-16 py-6 text-3xl font-black rounded-3xl shadow-2xl transition-all duration-300 transform ${
              isConnected && players.length > 0
                ? 'bg-gradient-to-r from-green-400 to-blue-500 text-white hover:scale-110 hover:shadow-3xl cursor-pointer'
                : 'bg-gray-500/50 text-gray-300 cursor-not-allowed'
            }`}
            style={{
              boxShadow: isConnected && players.length > 0 ? '0 20px 60px rgba(34, 197, 94, 0.4)' : 'none',
            }}
          >
            {isConnected && players.length > 0 ?
              `START GAME (${players.length} ${players.length === 1 ? 'Player' : 'Players'})` :
              !isConnected ? 'CONNECTING...' :
              'WAITING FOR PLAYERS'
            }
          </button>

          <button
            onClick={() => router.push('/game/host')}
            className="mt-6 px-8 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white font-semibold hover:bg-white/20 transition-all duration-300"
          >
            Cancel & Go Back
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
        }

        .animation-delay-400 {
          animation-delay: 0.4s;
        }
      `}</style>
    </div>
  );
}
