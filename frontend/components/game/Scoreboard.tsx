"use client";

import React from 'react';

type Player = { id: string; name: string; score?: number };

// --- STYLING OBJECTS (Reutilizate) ---
const styles = {
  container: {
    padding: '30px',
    maxWidth: '600px',
    margin: '0 auto',
    backgroundColor: '#fff',
    borderRadius: '15px',
    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.1)',
    textAlign: 'center' as 'center',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '800',
    marginBottom: '30px',
    color: '#3876FF', 
    borderBottom: '4px solid #f0f0f0',
    paddingBottom: '10px',
  },
  list: {
    listStyle: 'none',
    padding: 0,
  },
  listItemBase: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 20px',
    marginBottom: '10px',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '1.2rem',
  },
  podium: {
    1: {
      backgroundColor: '#FFD700', // Aur
      color: '#333',
      transform: 'scale(1.05)',
      boxShadow: '0 4px 10px rgba(255, 215, 0, 0.5)',
      fontWeight: '900',
    },
    2: {
      backgroundColor: '#C0C0C0', // Argint
      color: '#333',
      fontWeight: '800',
    },
    3: {
      backgroundColor: '#CD7F32', // Bronz
      color: '#fff',
      fontWeight: '800',
    },
  },
  standardRank: {
    backgroundColor: '#f9f9f9',
    color: '#555',
    border: '1px solid #eee',
  },
  playerName: {
    textAlign: 'left' as 'left',
    flexGrow: 1,
    marginLeft: '15px',
  },
  score: {
    fontWeight: '900',
    color: '#008000',
    fontSize: '1.4rem',
  },
  rankNumber: {
    width: '30px',
    fontWeight: '900',
    fontSize: '1.5rem',
    textAlign: 'center' as 'center',
  }
};
// -----------------------------


export default function Scoreboard({ players }: { players: Player[] }) {
  // Sortează descrescător după scor
  const sorted = [...players].sort((a, b) => (b.score || 0) - (a.score || 0));

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🏆 Clasament</h2>
      
      {sorted.length === 0 ? (
        <div style={{ padding: '20px', color: '#888' }}>Așteptăm datele de scor.</div>
      ) : (
        <ol style={styles.list}>
          {sorted.map((p, index) => {
            const rank = index + 1;
            
            // Determină stilul pe baza locului
            const rankStyle = (styles.podium as any)[rank] || styles.standardRank;
            
            return (
              <li 
                key={p.id} 
                style={{ 
                  ...styles.listItemBase,
                  ...rankStyle,
                }}
              >
                <span style={styles.rankNumber}>
                  {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank}
                </span>
                
                <span style={styles.playerName}>
                  {p.name}
                </span>
                
                <span style={{ 
                    ...styles.score,
                    color: rank <= 3 ? (rank === 3 ? '#fff' : '#333') : styles.score.color,
                  }}
                >
                  {p.score ?? 0} p
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}