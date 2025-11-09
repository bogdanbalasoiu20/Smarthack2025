"use client";

import React, { useState, useCallback, useMemo } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket'; 
import { WS_BASE_URL } from '@/lib/api'; 
import Lobby from '@/components/game/Lobby';
import QuestionView from '@/components/game/QuestionView';
import Scoreboard from '@/components/game/Scoreboard';

// --- TYPE DEFINITIONS ---
type Player = { id: string; name: string; score?: number };
// Am actualizat tipul Question să includă timeLimit, care vine de la backend
type Question = { id: string; text: string; options: string[]; timeLimit: number } | null; 

// --- STYLING OBJECTS (Păstrate din versiunea ta) ---
const styles = {
    // ... (Toate stilurile containerului tău: container, header, statusIndicator etc.)
    container: {
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column' as 'column',
        alignItems: 'center',
        padding: '40px 20px',
        backgroundColor: '#f5f5f5', 
        fontFamily: 'Inter, Arial, sans-serif',
    },
    header: {
        fontSize: '2rem',
        fontWeight: '700',
        marginBottom: '20px',
        color: '#333',
        textAlign: 'center' as 'center',
    },
    statusIndicator: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '30px',
        padding: '8px 15px',
        borderRadius: '8px',
        fontSize: '0.9rem',
        fontWeight: '600',
    },
    statusConnected: {
        backgroundColor: '#e6ffe6',
        color: '#008000',
        border: '1px solid #008000',
    },
    statusDisconnected: {
        backgroundColor: '#ffe6e6',
        color: '#ff0000',
        border: '1px solid #ff0000',
    },
    dot: {
        width: '10px',
        height: '10px',
        borderRadius: '50%',
        marginRight: '8px',
    },
    contentWrapper: {
        width: '100%', 
        maxWidth: '800px', 
        flexGrow: 1,
    }
};
// ---------------------------------------------


export default function GamePage() {
    const [stage, setStage] = useState<'lobby' | 'question' | 'scoreboard'>('lobby');
    const [players, setPlayers] = useState<Player[]>([]);
    const [question, setQuestion] = useState<Question>(null);
    const [code, setCode] = useState<string>(''); // PIN-ul jocului
    const [name, setName] = useState<string>(''); // Numele jucătorului
    const [joinAttempted, setJoinAttempted] = useState(false); 

    // URL dinamic care include PIN-ul (din pașii anteriori)
    const wsUrl = useMemo(() => {
        if (typeof window === 'undefined' || !code) {
          return '';
        }
        return `${WS_BASE_URL}/ws/game/${code}/`; 
    }, [code]);


    const { isConnected, sendMessage } = useWebSocket(wsUrl, {
        onMessage: (data) => {
            // Aici se face tranziția între etape pe baza mesajului din Django Channels
            if (!data || !data.type) return;

            switch (data.type) {
                case 'lobby_update':
                    setPlayers(data.payload?.players || []);
                    setStage('lobby');
                    break;
                case 'question':
                    // Primiți noua întrebare cu timeLimit din backend
                    setQuestion(data.payload?.question || null);
                    // Asigură-te că QuestionView primește timpul corect
                    setStage('question'); 
                    break;
                case 'score_update':
                    // Backend-ul a semnalat că o întrebare s-a terminat și trimite scorul
                    setPlayers(data.payload?.players || players);
                    setStage('scoreboard');
                    break;
                case 'end':
                    // Sfârșitul jocului
                    setPlayers(data.payload?.players || players);
                    setStage('scoreboard');
                    break;
                default:
                    console.debug('Unhandled ws message type', data.type);
            }
        },
    });

    const handleJoin = useCallback(() => {
        if (!name.trim() || !code.trim()) return;

        setJoinAttempted(true);
        // Trimite mesajul 'join'. PIN-ul este deja în Consumer prin URL.
        sendMessage({ type: 'join', payload: { name: name.trim() } });
    }, [name, code, sendMessage]);


    // 🎯 FUNCȚIA ACTUALIZATĂ PENTRU RĂSPUNS 🎯
    // Acum acceptă indexul răspunsului ȘI timpul consumat
    const handleAnswer = useCallback(
        (answerIndex: number, timeTaken: number) => { 
            if (!question) return;

            // Trimite Indexul și Timpul consumat (în secunde) către Django Channels
            sendMessage({ 
                type: 'answer', 
                payload: { 
                    answer: answerIndex, 
                    time_taken: timeTaken 
                } 
            });
            
            // Nu mai e nevoie de logică de tranziție aici; așteptăm confirmarea scorului de la backend ('score_update')

        },
        [sendMessage, question]
    );

    // Logica de stilizare (păstrată)
    const statusStyle = isConnected
        ? { ...styles.statusIndicator, ...styles.statusConnected }
        : { ...styles.statusIndicator, ...styles.statusDisconnected };
    
    const dotColor = isConnected ? '#008000' : '#ff0000';

    return (
        <div style={styles.container}> 
            <h1 style={styles.header}>🎮 Smarthack Kahoot — Joc</h1>

            <div style={statusStyle}>
                <div style={{ ...styles.dot, backgroundColor: dotColor }} />
                **Conexiune WebSocket:** {isConnected ? 'Activă' : 'Întreruptă'}
            </div>
            
            <div style={styles.contentWrapper}> 
                
                {stage === 'lobby' && (
                    <Lobby
                        players={players}
                        name={name}
                        code={code}
                        onNameChange={setName}
                        onCodeChange={setCode}
                        onJoin={handleJoin}
                    />
                )}

                {/* QuestionView necesită Question și că prop-ul Question să nu fie null */}
                {stage === 'question' && question && (
                    <QuestionView question={question} onAnswer={handleAnswer} />
                )}

                {stage === 'scoreboard' && <Scoreboard players={players} />}
            </div>
        </div>
    );
}