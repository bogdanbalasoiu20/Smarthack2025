"use client";

import React, { useState, useEffect, useRef } from 'react';

// Am adăugat timeLimit la tipul Question, presupunând că vine de la backend
type Question = { id: string; text: string; options: string[]; timeLimit: number };

// --- STYLING OBJECTS ---
const styles = {
  container: {
    padding: '20px',
    maxWidth: '800px',
    margin: '0 auto',
    textAlign: 'center' as 'center',
  },
  // ... (Restul stilurilor tale rămân neschimbate) ...
  questionText: {
    fontSize: '2.5rem',
    fontWeight: '800',
    marginBottom: '40px',
    padding: '20px',
    backgroundColor: '#fff',
    borderRadius: '15px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
    color: '#333',
  },
  optionsGrid: {
    display: 'grid',
    gap: '15px',
    gridTemplateColumns: '1fr 1fr',
    width: '100%',
  },
  baseButton: {
    height: '150px', 
    width: '100%',
    display: 'flex',
    flexDirection: 'column' as 'column',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '1.2rem',
    fontWeight: '700',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'transform 0.1s, opacity 0.3s',
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
  },
  buttonColors: [
    { backgroundColor: '#CC0000', symbol: '▲' },
    { backgroundColor: '#3876FF', symbol: '◆' },
    { backgroundColor: '#FF8C00', symbol: '●' },
    { backgroundColor: '#228B22', symbol: '■' },
  ],
  disabledButton: {
    opacity: 0.5,
    cursor: 'not-allowed',
    transform: 'scale(0.98)',
  },
  selectedButton: {
    opacity: 1,
    border: '4px solid #fff',
    boxShadow: '0 0 10px 5px rgba(255, 255, 255, 0.5)',
  },
  symbol: {
    fontSize: '3rem',
    lineHeight: 1,
    marginBottom: '5px',
  },
  // Stiluri noi pentru Timer
  timerContainer: {
    position: 'absolute' as 'absolute',
    top: '30px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: '#333',
    color: 'white',
    borderRadius: '50%',
    width: '80px',
    height: '80px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '2rem',
    fontWeight: '900',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
    zIndex: 10,
  }
};
// -----------------------------


export default function QuestionView({
  question,
  onAnswer,
}: {
  question: Question;
  onAnswer: (index: number, timeTaken: number) => void; // onAnswer acceptă și timpul
}) {
  // Starea: urmărește dacă jucătorul a răspuns (indexul ales)
  const [hasAnswered, setHasAnswered] = useState<number | null>(null);
  // Starea: timpul rămas din numărătoarea inversă
  const [timeLeft, setTimeLeft] = useState(question.timeLimit);
  
  // Ref: Păstrează timpul inițial la care a fost afișată întrebarea
  const startTimeRef = useRef<number>(Date.now());
  
  // Ref: Urmărește ID-ul intervalului pentru a-l curăța
  const timerIdRef = useRef<NodeJS.Timeout | null>(null);

  if (!question) return null;

  // --- LOGICA CRONOMETRULUI ---
  useEffect(() => {
    // Resetarea stării la o întrebare nouă (schimbarea question.id)
    setHasAnswered(null);
    setTimeLeft(question.timeLimit);
    startTimeRef.current = Date.now();
    
    // Pornește cronometrul dacă timpul limită este > 0
    if (question.timeLimit > 0) {
      timerIdRef.current = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            // Cazul 1: Timpul a expirat (Timeout)
            clearInterval(timerIdRef.current as NodeJS.Timeout);
            
            // Dacă nu a răspuns, trimite răspunsul ca fiind -1 sau alt marker
            if (hasAnswered === null) {
              onAnswer(-1, question.timeLimit); 
            }
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    // Cleanup la demontarea componentei sau la schimbarea întrebării
    return () => {
      if (timerIdRef.current) {
        clearInterval(timerIdRef.current);
      }
    };
  // Dependențe: Rerun la schimbarea întrebării (question.id)
  }, [question.id, question.timeLimit, onAnswer, hasAnswered]); 
  
  
  // --- LOGICA BUTOANELOR ---
  const handleButtonClick = (index: number) => {
    // 1. Verificare: Nu poți răspunde dacă ai răspuns deja SAU dacă timpul a expirat
    if (hasAnswered !== null || timeLeft === 0) return; 

    // 2. Calculează Timpul de Răspuns (timeTaken)
    const timeElapsed = (Date.now() - startTimeRef.current) / 1000;
    
    // 3. Stopează Timer-ul vizual
    if (timerIdRef.current) {
      clearInterval(timerIdRef.current);
      timerIdRef.current = null;
    }

    // 4. Actualizează Starea Locală
    setHasAnswered(index);

    // 5. Trimite Răspunsul și Timpul către Backend
    // Backend-ul (consumers.py) așteaptă { answer: index, time_taken: float }
    onAnswer(index, timeElapsed); 
  };
  
  // Jocul este terminat sau blocat dacă timpul a expirat sau s-a răspuns
  const gameIsOverForPlayer = hasAnswered !== null || timeLeft === 0;

  return (
    <div style={{ ...styles.container, position: 'relative' as 'relative' }}> 
      
      {/* 1. Afișare Timer */}
      {question.timeLimit > 0 && (
         <div 
            style={{ 
                ...styles.timerContainer,
                backgroundColor: timeLeft <= 5 ? '#CC0000' : '#3876FF' // Roșu la final
            }}
         >
            {timeLeft}
         </div>
      )}
      
      {/* 2. Textul Întrebării */}
      <h2 style={{...styles.questionText, marginTop: '100px'}}> 
        {question.text}
      </h2>

      {/* 3. Grila de Răspunsuri */}
      <div style={styles.optionsGrid}>
        {question.options.map((opt, idx) => {
          const colorStyle = styles.buttonColors[idx % 4]; 
          const isSelected = hasAnswered === idx;
          const isDisabled = gameIsOverForPlayer; // Butoanele sunt dezactivate dacă timpul a expirat sau s-a răspuns
          
          const finalButtonStyle = {
            ...styles.baseButton,
            ...colorStyle,
            // Aplică stilurile de dezactivare, dar evidențiază răspunsul ales
            ...(isDisabled && styles.disabledButton), 
            ...(isSelected && styles.selectedButton),
          };

          return (
            <button
              key={idx}
              onClick={() => handleButtonClick(idx)}
              style={finalButtonStyle}
              disabled={isDisabled}
              title={opt}
            >
              <span style={styles.symbol}>
                {colorStyle.symbol}
              </span>
              
              {/* Afișează textul doar dacă nu s-a răspuns, altfel un mesaj de confirmare */}
              {hasAnswered === null && (
                <span>{String.fromCharCode(65 + idx)}. {opt}</span>
              )}
              {hasAnswered !== null && isSelected && (
                <span style={{ fontSize: '1.2rem' }}>Răspuns trimis!</span>
              )}
            </button>
          );
        })}
      </div>
      
      {/* 4. Mesaje Finale */}
      {timeLeft === 0 && hasAnswered === null && (
         <div style={{ marginTop: '20px', fontSize: '1.4rem', fontWeight: '700', color: '#CC0000' }}>
            TIMP EXPIRAT!
         </div>
      )}
      {hasAnswered !== null && (
        <div style={{ marginTop: '20px', fontSize: '1.2rem', color: '#555' }}>
          Așteptați rezultatele.
        </div>
      )}
    </div>
  );
}