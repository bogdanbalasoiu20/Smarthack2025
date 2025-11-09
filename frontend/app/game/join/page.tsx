"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function GameJoinPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlPin = searchParams.get('pin') || '';

  const [nickname, setNickname] = useState('');
  const [pin, setPin] = useState(urlPin);
  const [joining, setJoining] = useState(false);

  const handleJoin = async () => {
    if (!nickname.trim() || !pin.trim()) {
      return;
    }

    setJoining(true);
    // Navigate to player lobby
    router.push(`/game/play/${pin}?nickname=${encodeURIComponent(nickname.trim())}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && nickname.trim() && pin.trim()) {
      handleJoin();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center py-12 px-4">
      <div className="max-w-2xl w-full">
        {/* Logo/Title */}
        <div className="text-center mb-12">
          <div className="text-8xl font-black text-white mb-4" style={{
            textShadow: '0 0 60px rgba(255,255,255,0.6)',
            background: 'linear-gradient(135deg, #fff 0%, #a78bfa 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            KAHOOT!
          </div>
          <p className="text-2xl text-purple-200 font-semibold">Join the game</p>
        </div>

        {/* Join Form */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 sm:p-12 shadow-2xl">
          <div className="space-y-6">
            {/* PIN Input */}
            <div>
              <label className="block text-sm font-bold text-purple-200 uppercase tracking-widest mb-3">
                Game PIN
              </label>
              <input
                type="text"
                value={pin}
                onChange={(e) => setPin(e.target.value.trim())}
                onKeyPress={handleKeyPress}
                placeholder="Enter game PIN"
                maxLength={6}
                className="w-full px-6 py-5 bg-white/10 border-2 border-white/30 rounded-2xl text-white text-3xl text-center font-bold tracking-[0.3em] placeholder-white/30 focus:outline-none focus:border-purple-400 focus:bg-white/20 transition-all duration-200"
                style={{ fontFamily: '"Courier New", monospace' }}
              />
            </div>

            {/* Nickname Input */}
            <div>
              <label className="block text-sm font-bold text-purple-200 uppercase tracking-widest mb-3">
                Your Nickname
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter your name"
                maxLength={20}
                className="w-full px-6 py-5 bg-white/10 border-2 border-white/30 rounded-2xl text-white text-2xl placeholder-white/30 focus:outline-none focus:border-purple-400 focus:bg-white/20 transition-all duration-200"
              />
              <p className="text-purple-300 text-sm mt-2">
                {nickname.length}/20 characters
              </p>
            </div>

            {/* Join Button */}
            <button
              onClick={handleJoin}
              disabled={!nickname.trim() || !pin.trim() || joining}
              className={`w-full py-6 rounded-2xl text-2xl font-black transition-all duration-300 transform ${
                nickname.trim() && pin.trim() && !joining
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:scale-105 hover:shadow-2xl shadow-lg cursor-pointer'
                  : 'bg-gray-500/50 text-gray-300 cursor-not-allowed'
              }`}
              style={{
                boxShadow: nickname.trim() && pin.trim() && !joining ? '0 20px 60px rgba(168, 85, 247, 0.4)' : 'none',
              }}
            >
              {joining ? 'JOINING...' : 'JOIN GAME'}
            </button>
          </div>
        </div>

        {/* Quick Tips */}
        <div className="mt-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <h3 className="text-white font-bold text-lg mb-3">Quick Tips:</h3>
          <ul className="text-purple-200 space-y-2 text-sm">
            <li className="flex items-start">
              <span className="text-purple-400 mr-2">•</span>
              <span>Get the game PIN from your teacher or host</span>
            </li>
            <li className="flex items-start">
              <span className="text-purple-400 mr-2">•</span>
              <span>Choose a fun nickname that others will recognize</span>
            </li>
            <li className="flex items-start">
              <span className="text-purple-400 mr-2">•</span>
              <span>Make sure you have a stable internet connection</span>
            </li>
            <li className="flex items-start">
              <span className="text-purple-400 mr-2">•</span>
              <span>Answer quickly to earn more points!</span>
            </li>
          </ul>
        </div>

        {/* Back Button */}
        <div className="text-center mt-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-purple-300 hover:text-white underline transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
