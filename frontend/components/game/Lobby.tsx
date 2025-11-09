"use client";

import React from 'react';

type Player = { id: string; name: string; score?: number };

// --- STYLING OBJECTS (Reutilizate) ---
const styles = {
  container: {
    backgroundColor: '#fff',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
    maxWidth: '500px',
    margin: '0 auto',
  },
  inputGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '600',
    color: '#555',
    fontSize: '1.1rem',
  },
  input: {
    padding: '12px',
    width: '100%',
    boxSizing: 'border-box' as 'border-box',
    borderRadius: '8px',
    border: '2px solid #ccc',
    fontSize: '1rem',
  },
  joinButton: {
    backgroundColor: '#3876FF',
    color: 'white',
    padding: '15px 30px',
    fontSize: '1.2rem',
    fontWeight: '700',
    borderRadius: '10px',
    border: 'none',
    cursor: 'pointer',
    width: '100%',
  },
  playersSection: {
    marginTop: '30px',
    paddingTop: '20px',
    borderTop: '1px solid #eee',
  },
  playersTitle: {
    marginBottom: '15px',
    color: '#333',
    fontSize: '1.3rem',
    borderBottom: '2px solid #f0f0f0',
    paddingBottom: '5px',
  },
  playerList: {
    listStyle: 'none',
    padding: 0,
    maxHeight: '200px',
    overflowY: 'auto' as 'auto',
  },
  playerListItem: {
    backgroundColor: '#f2f2f2',
    padding: '10px 15px',
    marginBottom: '8px',
    borderRadius: '6px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontWeight: '500',
    color: '#444',
  },
};
// -----------------------------


export default function Lobby({
  players,
  name,
  code,
  onNameChange,
  onCodeChange,
  onJoin,
}: {
  players: Player[];
  name: string;
  code: string;
  onNameChange: (v: string) => void;
  onCodeChange: (v: string) => void;
  onJoin: () => void;
}) {
    // Verifică dacă butonul ar trebui să fie activ
    const canJoin = name.trim().length > 1 && code.trim().length > 0;

    return (
        <div style={styles.container}>
            <div style={styles.inputGroup}>
                <label style={styles.label}>Nume jucător</label>
                <input
                    value={name}
                    onChange={(e) => onNameChange(e.target.value)}
                    placeholder="Introdu numele"
                    style={styles.input}
                    maxLength={15}
                />
            </div>

            <div style={styles.inputGroup}>
                <label style={styles.label}>Cod joc (PIN)</label>
                <input
                    value={code}
                    onChange={(e) => onCodeChange(e.target.value)}
                    placeholder="Codul jocului"
                    style={styles.input}
                    type="text" // Lăsăm text pentru că PIN-ul poate avea și litere, deși cel Kahoot e numeric
                    maxLength={6} // Limita PIN-ului
                />
            </div>

            <div style={{ marginBottom: '20px' }}>
                <button 
                    onClick={onJoin} 
                    style={{ 
                        ...styles.joinButton, 
                        opacity: canJoin ? 1 : 0.6,
                    }}
                    disabled={!canJoin}
                >
                    Intră în joc
                </button>
            </div>

            <div style={styles.playersSection}>
                <h3 style={styles.playersTitle}>Jucători conectați ({players.length})</h3>
                {players.length === 0 ? (
                    <div style={{ color: '#888', fontStyle: 'italic', padding: '10px 0' }}>Așteaptă... Niciun jucător încă</div>
                ) : (
                    <ul style={styles.playerList}>
                        {players.map((p) => (
                            <li key={p.id} style={styles.playerListItem}>
                                <span>{p.name}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}