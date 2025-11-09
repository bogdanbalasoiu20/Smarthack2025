"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getStoredToken } from '@/lib/authToken';
import { API_BASE_URL } from '@/lib/api';
import Swal from 'sweetalert2';

type Game = {
  id: number;
  title: string;
  description: string;
  base_points: number;
  questions: any[];
  created_at: string;
};

export default function GameHostPage() {
  const router = useRouter();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      router.replace('/login');
      return;
    }
    fetchGames();
  }, []);

  const fetchGames = async () => {
    const token = getStoredToken();
    try {
      const response = await fetch(`${API_BASE_URL}/games/`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Ensure data is an array
        if (Array.isArray(data)) {
          setGames(data);
        } else if (data.results && Array.isArray(data.results)) {
          // Handle paginated response
          setGames(data.results);
        } else {
          console.error('Unexpected data format:', data);
          setGames([]);
        }
      } else {
        console.error('Failed to fetch games:', response.status);
        setGames([]);
      }
    } catch (error) {
      console.error('Error fetching games:', error);
      setGames([]);
    } finally {
      setLoading(false);
    }
  };

  const startGameSession = async (gameId: number) => {
    const token = getStoredToken();

    try {
      const response = await fetch(`${API_BASE_URL}/games/${gameId}/create_session/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const session = await response.json();

        await Swal.fire({
          title: 'Game Session Created!',
          html: `
            <div style="text-align: center;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                          padding: 30px;
                          border-radius: 20px;
                          margin: 20px 0;">
                <div style="color: #fff; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 10px;">
                  Game PIN
                </div>
                <div style="color: #fff; font-size: 72px; font-weight: 900; letter-spacing: 12px; font-family: 'Courier New', monospace;">
                  ${session.pin}
                </div>
              </div>
              <p style="color: #666; margin-top: 20px;">Players can join at: <strong>localhost:3000/game/join</strong></p>
            </div>
          `,
          icon: 'success',
          confirmButtonText: 'Go to Lobby',
          confirmButtonColor: '#667eea',
          showCancelButton: true,
          cancelButtonText: 'Copy PIN',
        }).then((result) => {
          if (result.isConfirmed) {
            router.push(`/game/lobby/${session.pin}`);
          } else if (result.isDismissed) {
            navigator.clipboard.writeText(session.pin);
            Swal.fire({
              title: 'PIN Copied!',
              text: `PIN ${session.pin} copied to clipboard`,
              icon: 'success',
              timer: 2000,
              showConfirmButton: false,
            });
          }
        });
      } else {
        throw new Error('Failed to create session');
      }
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: 'Failed to create game session',
        icon: 'error',
        confirmButtonColor: '#ef4444',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-white text-2xl">Loading games...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-black text-white mb-4" style={{
            textShadow: '0 0 40px rgba(255,255,255,0.5)',
          }}>
            Host a Game
          </h1>
          <p className="text-xl text-purple-200">Select a game to start a session</p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mb-12">
          <button
            onClick={() => router.push('/dashboard/create')}
            className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white font-semibold hover:bg-white/20 transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105"
          >
            + Create New Game
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white font-semibold hover:bg-white/20 transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105"
          >
            Back to Dashboard
          </button>
        </div>

        {/* Games Grid */}
        {games.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-12 max-w-2xl mx-auto">
              <h3 className="text-3xl font-bold text-white mb-4">No Games Yet</h3>
              <p className="text-purple-200 mb-8">Create your first game to get started!</p>
              <button
                onClick={() => router.push('/dashboard/create')}
                className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-2xl hover:scale-105 transition-transform duration-300 shadow-lg"
              >
                Create Your First Game
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {games.map((game) => (
              <div
                key={game.id}
                className="group relative bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                {/* Game Card Content */}
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-white mb-3 line-clamp-2">
                    {game.title}
                  </h3>
                  {game.description && (
                    <p className="text-purple-200 text-sm line-clamp-3 mb-4">
                      {game.description}
                    </p>
                  )}

                  {/* Game Stats */}
                  <div className="flex items-center gap-6 text-sm text-purple-300">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                        <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
                      </svg>
                      <span>{game.questions?.length || 0} Questions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                      <span>{game.base_points} pts</span>
                    </div>
                  </div>
                </div>

                {/* Start Button */}
                <button
                  onClick={() => startGameSession(game.id)}
                  className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-2xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-1"
                >
                  Start Game Session
                </button>

                {/* Edit/Delete buttons */}
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => router.push(`/dashboard/create?edit=${game.id}`)}
                    className="flex-1 py-2 bg-white/10 border border-white/20 text-white text-sm font-semibold rounded-xl hover:bg-white/20 transition-all duration-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={async () => {
                      const result = await Swal.fire({
                        title: 'Delete Game?',
                        text: `Are you sure you want to delete "${game.title}"?`,
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: '#ef4444',
                        cancelButtonColor: '#6b7280',
                        confirmButtonText: 'Yes, delete it!',
                      });

                      if (result.isConfirmed) {
                        const token = getStoredToken();
                        try {
                          const response = await fetch(`${API_BASE_URL}/games/${game.id}/`, {
                            method: 'DELETE',
                            headers: {
                              'Authorization': `Token ${token}`,
                            },
                          });

                          if (response.ok) {
                            Swal.fire('Deleted!', 'Game has been deleted.', 'success');
                            fetchGames();
                          }
                        } catch (error) {
                          Swal.fire('Error', 'Failed to delete game', 'error');
                        }
                      }
                    }}
                    className="flex-1 py-2 bg-red-500/20 border border-red-500/50 text-red-300 text-sm font-semibold rounded-xl hover:bg-red-500/30 transition-all duration-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
