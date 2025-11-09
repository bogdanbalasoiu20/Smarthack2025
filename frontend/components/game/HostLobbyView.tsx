// HostLobbyView.tsx
"use client";

import React, { useState, useCallback, useEffect } from 'react';
// Eliminăm importurile useWebSocket, WS_BASE_URL și API de aici

type Player = { id: string; name: string; score?: number };
type SessionStatus = 'lobby' | 'running' | 'score_display' | 'finished';

// --- STYLING OBJECTS (Păstrate) ---
const styles = { /* ... (stilurile tale) ... */ 
    container: {
        backgroundColor: '#fff',
        padding: '35px',
        borderRadius: '15px',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.1)',
        maxWidth: '600px',
        margin: '0 auto',
        textAlign: 'center' as 'center',
    },
    pinDisplay: {
        backgroundColor: '#FFD700', 
        padding: '20px 30px',
        borderRadius: '10px',
        marginBottom: '30px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    },
    pinLabel: {
        fontSize: '1.2rem',
        fontWeight: '600',
        color: '#333',
        marginBottom: '5px',
    },
    pinCode: {
        fontSize: '3.5rem',
        fontWeight: '900',
        color: '#3876FF',
        letterSpacing: '5px',
    },
    startButton: {
        backgroundColor: '#228B22', 
        color: 'white',
        padding: '15px 40px',
        fontSize: '1.4rem',
        fontWeight: '700',
        borderRadius: '10px',
        border: 'none',
        cursor: 'pointer',
        marginTop: '20px',
    },
    playerSection: {
        marginTop: '30px',
        paddingTop: '20px',
        borderTop: '1px solid #eee',
    },
    playerTitle: {
        marginBottom: '15px',
        color: '#333',
        fontSize: '1.5rem',
    },
    playerList: {
        listStyle: 'none',
        padding: 0,
        display: 'flex',
        flexWrap: 'wrap' as 'wrap',
        gap: '10px',
        justifyContent: 'center' as 'center',
        maxHeight: '200px',
        overflowY: 'auto' as 'auto',
    },
    playerTag: {
        backgroundColor: '#f0f0f0',
        padding: '8px 15px',
        borderRadius: '20px',
        fontWeight: '500',
        fontSize: '0.95rem',
        color: '#555',
    },
    statusIndicator: {
        fontSize: '0.8rem',
        fontWeight: '600',
        color: '#FF0000',
        marginBottom: '15px',
    }
};

export default function HostLobbyView({ 
    gamePin, 
    players, 
    isConnected, 
    sessionStatus, 
    onHostAction 
}: { 
    gamePin: string; 
    players: Player[]; 
    isConnected: boolean; 
    sessionStatus: SessionStatus; 
    onHostAction: () => void; // Aici nu mai avem nevoie de argumentul 'start'
}) {
    // Logica de start
    const canStart = isConnected && players.length > 0 && sessionStatus === 'lobby';

    return (
        <div style={styles.container}>
            {/* ... Afișare PIN ... */}
             <div style={styles.pinDisplay}>
                <div style={styles.pinLabel}>Codul Jocului</div>
                <div style={styles.pinCode}>{gamePin}</div>
            </div>
            
            {/* Indicator Stare Conexiune */}
            {!isConnected && (
                <div style={styles.statusIndicator}>Conexiune WebSocket întreruptă.</div>
            )}

            {/* Lista Jucătorilor */}
            <div style={styles.playerSection}>
                <h3 style={styles.playerTitle}>Jucători Pregătiți ({players.length})</h3>
                {players.length === 0 ? (
                    <div style={{ color: '#888', fontStyle: 'italic', padding: '10px' }}>
                        Așteptăm primul jucător...
                    </div>
                ) : (
                    <ul style={styles.playerList}>
                        {players.map((p) => (<li key={p.id} style={styles.playerTag}>{p.name}</li>))}
                    </ul>
                )}
            </div>

            {/* Butonul START */}
            <button 
                onClick={onHostAction} 
                style={{
                    ...styles.startButton,
                    opacity: canStart ? 1 : 0.5,
                    cursor: canStart ? 'pointer' : 'not-allowed',
                }}
                disabled={!canStart}
            >
                {`START JOC (${players.length} juc.)`}
            </button>
        </div>
    );
}