"use client";

import React, { useMemo } from 'react';

// Tipuri de date
type Question = { id: string; text: string; options: { text: string; isCorrect: boolean }[]; timeLimit: number };
type HostQuestionProps = {
  question: Question;
  answeredCount: number; // Numărul de jucători care au răspuns
  playerCount: number;  // Numărul total de jucători
  onHostAction: (action: 'next' | 'show_score') => void; // Funcția pentru a trimite acțiunea
  sessionStatus: 'running' | 'score_display' | 'finished';
};


// --- STYLING OBJECTS ---
const styles = {
  container: {
    padding: '30px',
    maxWidth: '1000px',
    margin: '0 auto',
    backgroundColor: '#fff',
    borderRadius: '15px',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.1)',
    textAlign: 'center' as 'center',
  },
  questionText: {
    fontSize: '3rem',
    fontWeight: '800',
    marginBottom: '30px',
    color: '#3876FF', // Albastru Kahoot
    padding: '20px 0',
  },
  statsContainer: {
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: '30px',
    backgroundColor: '#f5f5f5',
    padding: '15px',
    borderRadius: '10px',
  },
  statsBox: {
    fontSize: '1.2rem',
    fontWeight: '600',
    color: '#555',
  },
  answeredCount: (total: number, answered: number) => ({
    fontSize: '2.5rem',
    fontWeight: '900',
    color: answered === total ? '#228B22' : '#FF8C00', // Verde dacă toți au răspuns
    lineHeight: 1,
  }),
  optionsGrid: {
    display: 'grid',
    gap: '15px',
    gridTemplateColumns: '1fr 1fr',
    marginTop: '20px',
  },
  optionBase: {
    height: '100px',
    display: 'flex',
    justifyContent: 'flex-start' as 'flex-start',
    alignItems: 'center',
    padding: '0 20px',
    fontSize: '1.2rem',
    fontWeight: '700',
    color: 'white',
    borderRadius: '10px',
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
  },
  // Culorile și simbolurile (identice cu QuestionView.tsx)
  optionStyles: [
    { backgroundColor: '#CC0000', symbol: '▲' },
    { backgroundColor: '#3876FF', symbol: '◆' },
    { backgroundColor: '#FF8C00', symbol: '●' },
    { backgroundColor: '#228B22', symbol: '■' },
  ],
  correctIndicator: {
    marginLeft: 'auto',
    fontSize: '1.5rem',
    color: 'white',
    fontWeight: '900',
  },
  // Butonul de progres
  progressButton: (isScoring: boolean) => ({
    backgroundColor: isScoring ? '#FF8C00' : '#3876FF', // Portocaliu pt Scor, Albastru pt Next
    color: 'white',
    padding: '15px 40px',
    fontSize: '1.5rem',
    fontWeight: '700',
    borderRadius: '10px',
    border: 'none',
    cursor: 'pointer',
    marginTop: '40px',
    width: '100%',
    maxWidth: '400px',
  }),
};
// -----------------------------


export default function HostQuestionView({
  question,
  answeredCount,
  playerCount,
  onHostAction,
  sessionStatus,
}: HostQuestionProps) {
  
  // În modul 'running', Host-ul vede doar opțiunile. 
  // Răspunsurile corecte sunt dezvăluite când se trece la 'score_display'
  const isRunning = sessionStatus === 'running';
  const isShowingAnswers = sessionStatus === 'score_display';

  // Setează textul butonului și acțiunea corespunzătoare
  const buttonAction = useMemo(() => {
    if (isRunning) {
      return { text: 'Afișează Scor', action: 'show_score' };
    } 
    return { text: 'Întrebarea Următoare', action: 'next' };
  }, [isRunning]);

  return (
    <div style={styles.container}>
      
      {/* Textul Intrebarii */}
      <h2 style={styles.questionText}>
        {question.text}
      </h2>

      {/* Statistici Raspunsuri */}
      <div style={styles.statsContainer}>
          <div style={styles.statsBox}>
              Răspunsuri primite:
              <div style={styles.answeredCount(playerCount, answeredCount)}>
                  {answeredCount} / {playerCount}
              </div>
          </div>
          <div style={styles.statsBox}>
              Timp Limită:
              <div style={{...styles.answeredCount(1, 0), color: '#333'}}>
                  {question.timeLimit}s
              </div>
          </div>
      </div>


      {/* Optiunile cu Indicatori de Raspuns Corect (daca se afiseaza scorul) */}
      <div style={styles.optionsGrid}>
        {question.options.map((opt, idx) => {
          const styleProps = styles.optionStyles[idx % 4]; 
          
          return (
            <div
              key={idx}
              style={{ ...styles.optionBase, ...styleProps }}
            >
                {/* Simbolul */}
                <span style={{ fontSize: '2rem', marginRight: '10px' }}>{styleProps.symbol}</span>
                
                {/* Textul Opțiunii */}
                <span>{opt.text}</span>
                
                {/* Indicator Răspuns Corect (Vizibil doar după ce Host-ul apasă "Afișează Scor") */}
                {!isRunning && opt.isCorrect && (
                   <span style={styles.correctIndicator}>
                       ✅ CORECT
                   </span>
                )}
            </div>
          );
        })}
      </div>
      
      
      {/* Butonul de Progres */}
      <button 
        onClick={() => onHostAction(buttonAction.action as 'next' | 'show_score')}
        style={styles.progressButton(buttonAction.action === 'show_score')}
        disabled={sessionStatus === 'finished'}
      >
        {buttonAction.text}
      </button>
      
    </div>
  );
}