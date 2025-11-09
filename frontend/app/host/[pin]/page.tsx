'use client';

import React, { useState, useCallback, useMemo } from 'react';
import HostLobbyView from '@/components/game/HostLobbyView';
import HostQuestionView from '@/components/game/HostQuestionView';
import Scoreboard from '@/components/game/Scoreboard'; // Folosim Scoreboard-ul existent pentru scor
import { useWebSocket } from '@/hooks/useWebSocket'; 
import { WS_BASE_URL } from '@/lib/api'; 


// --- TIPURI DE DATE ---
type Player = { id: string; name: string; score?: number };
// Question trebuie să includă tot ce are nevoie HostQuestionView
type Question = { id: string; text: string; options: { text: string; isCorrect: boolean }[]; timeLimit: number }; 
type SessionStatus = 'lobby' | 'running' | 'score_display' | 'finished';


export default function HostPage({ params }: { params: { pin: string } }) {
  const gamePin = params.pin;

  const [players, setPlayers] = useState<Player[]>([]);
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>('lobby');
  const [question, setQuestion] = useState<Question | null>(null);
  const [answeredCount, setAnsweredCount] = useState(0); // Contorul pentru răspunsuri

  // --- LOGICA WEBSOCKET HOST ---
  const wsUrl = useMemo(() => {
    // URL-ul se conectează direct, deoarece PIN-ul este în URL-ul paginii
    if (typeof window === 'undefined' || !gamePin) return '';
    return `${WS_BASE_URL}/ws/game/${gamePin}/`; 
  }, [gamePin]);

  const { isConnected, sendMessage } = useWebSocket(wsUrl, {
    onMessage: (data) => {
      if (!data || !data.type) return;

      switch (data.type) {
        case 'lobby_update':
          setPlayers(data.payload?.players || []);
          setSessionStatus(data.payload?.status || 'lobby');
          break;
        case 'question':
          // Când backend-ul trimite o întrebare nouă, actualizăm starea
          setQuestion(data.payload?.question || null);
          setPlayers(data.payload?.players || players); // Preia orice actualizare de jucători
          setAnsweredCount(0); // Resetăm contorul de răspunsuri
          setSessionStatus('running');
          break;
        case 'score_update':
          setPlayers(data.payload?.players || players);
          setSessionStatus('score_display');
          break;
        case 'answered_count':
          // Primește actualizarea numărului de răspunsuri de la consumatorul Django
          setAnsweredCount(data.payload?.count || answeredCount);
          break;
        case 'end':
          setPlayers(data.payload?.players || players);
          setSessionStatus('finished');
          break;
        default:
          console.debug('Unhandled host ws message type', data.type);
      }
    },
  });

  // --- LOGICA ACȚIUNILOR GAZDEI ---
  const handleHostAction = useCallback((action: 'start' | 'next' | 'show_score') => {
    if (!isConnected) return;
    
    // Mapează acțiunile frontend la tipurile de mesaje așteptate de backend (consumers.py)
    let messageType: 'host_start' | 'host_next' | null = null;

    if (action === 'start') {
        messageType = 'host_start';
    } else if (action === 'next' || action === 'show_score') {
        // În logica ta din consumers.py, 'host_next' gestionează tranziția de la 
        // 'running' (afișează scorul) la 'score_display' (următoarea întrebare)
        messageType = 'host_next'; 
    }
    
    if (messageType) {
        sendMessage({ type: messageType });
    }
  }, [isConnected, sendMessage]);

  // --- LOGICA RANDĂRII ---

  let content;

  if (!isConnected) {
    content = <div style={{ textAlign: 'center', color: '#CC0000' }}>Conectare la serverul jocului...</div>;
  } else if (sessionStatus === 'lobby') {
    // 1. RANDARE LOBBY
    content = (
      <HostLobbyView
        gamePin={gamePin}
        players={players}
        isConnected={isConnected}
        sessionStatus={sessionStatus}
        onHostAction={() => handleHostAction('start')} // Acțiunea de Start din Lobby
      />
    );
  } else if (sessionStatus === 'running') {
    // 2. RANDARE ÎNTREBARE
    if (!question) {
      content = <div>Se incarca intrebarea...</div>;
    } else {
      content = (
        <HostQuestionView
          question={question}
          answeredCount={answeredCount}
          playerCount={players.length}
          sessionStatus={sessionStatus}
          onHostAction={handleHostAction} // Va trimite 'host_next' când profesorul apasă NEXT
        />
      );
    }
  } else if (sessionStatus === 'score_display' || sessionStatus === 'finished') {
    // 3. RANDARE CLASAMENT
    content = (
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ color: '#3876FF', marginBottom: '20px' }}>
          {sessionStatus === 'finished' ? 'Clasament Final' : 'Clasament Intermediar'}
        </h1>
        <Scoreboard players={players} /> {/* Folosim componenta Player Scoreboard */}
        
        {sessionStatus !== 'finished' && (
          <button
            onClick={() => handleHostAction('next')} // Treci la următoarea întrebare/scor
            style={{ padding: '15px 30px', fontSize: '1.2rem', backgroundColor: '#FF8C00', color: 'white', border: 'none', borderRadius: '8px', marginTop: '30px', cursor: 'pointer' }}
          >
            {sessionStatus === 'score_display' ? 'ÎNTREBAREA URMĂTOARE >>' : 'Vezi Scor Final'}
          </button>
        )}
      </div>
    );
  }

  return (
    <div style={{ padding: 50 }}>
      {content}
    </div>
  );
}