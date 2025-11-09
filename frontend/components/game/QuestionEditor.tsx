"use client";

import React, { useCallback, useMemo } from 'react';

// Tipuri de Date (Trebuie să le definești undeva, ex: în GameForm)
type Choice = { text: string; isCorrect: boolean };
type QuestionData = { id: number; text: string; timeLimit: number; options: Choice[] };

// --- STYLING OBJECTS ---
const styles = {
  input: {
    padding: '10px',
    width: '100%',
    boxSizing: 'border-box' as 'border-box',
    borderRadius: '6px',
    border: '1px solid #ccc',
    fontSize: '0.95rem',
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    fontWeight: '500',
    color: '#333',
  },
  optionInput: (isCorrect: boolean) => ({
    padding: '10px',
    width: 'calc(100% - 35px)',
    boxSizing: 'border-box' as 'border-box',
    borderRadius: '6px',
    border: isCorrect ? '2px solid #228B22' : '1px solid #ccc',
    backgroundColor: isCorrect ? '#e6ffe6' : '#fff',
    fontSize: '0.95rem',
    display: 'inline-block',
  }),
  checkbox: {
    width: '20px',
    height: '20px',
    marginLeft: '10px',
    cursor: 'pointer',
  },
  optionContainer: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '10px',
    gap: '5px',
  },
  optionColors: ['#CC0000', '#3876FF', '#FF8C00', '#228B22'],
};
// -----------------------------


export default function QuestionEditor({
  question,
  onChange,
}: {
  question: QuestionData;
  onChange: (updatedFields: Partial<QuestionData>) => void;
}) {
  
  // Asigură-te că sunt afișate cel puțin 4 opțiuni (pentru consistența Kahoot)
  const options = useMemo(() => {
    const defaultOptions = Array(4).fill(null).map((_, i) => question.options[i] || { text: '', isCorrect: false });
    return defaultOptions;
  }, [question.options]);

  const handleOptionChange = useCallback((index: number, value: string) => {
    const updatedOptions = options.map((opt, i) =>
      i === index ? { ...opt, text: value } : opt
    );
    onChange({ options: updatedOptions });
  }, [options, onChange]);

  const handleCorrectToggle = useCallback((index: number) => {
    const updatedOptions = options.map((opt, i) =>
      // Setăm doar opțiunea curentă ca fiind corectă (ca în Kahoot standard)
      i === index ? { ...opt, isCorrect: !opt.isCorrect } : { ...opt, isCorrect: false } 
    );
    onChange({ options: updatedOptions });
  }, [options, onChange]);


  return (
    <div>
      {/* Textul Întrebării */}
      <div style={{ marginBottom: '15px' }}>
        <label style={styles.label}>Textul Intrebarii</label>
        <textarea
          value={question.text}
          onChange={(e) => onChange({ text: e.target.value })}
          style={{ ...styles.input, minHeight: '80px' }}
          placeholder="Introduceți textul întrebării"
        />
      </div>

      {/* Timp Limită */}
      <div style={{ marginBottom: '20px', maxWidth: '200px' }}>
        <label style={styles.label}>Timp Limita (secunde)</label>
        <input
          type="number"
          value={question.timeLimit}
          onChange={(e) => onChange({ timeLimit: parseInt(e.target.value) || 0 })}
          style={styles.input}
          min={5}
          max={120}
        />
      </div>

      {/* Opțiuni de Răspuns */}
      <label style={{ ...styles.label, marginBottom: '10px' }}>Optiuni (Marcati o optiune corecta)</label>
      {options.map((opt, idx) => (
        <div key={idx} style={styles.optionContainer}>
          {/* Simbolul colorat */}
          <div style={{ width: '30px', height: '30px', borderRadius: '5px', backgroundColor: styles.optionColors[idx % 4] }}></div>
          <input
            value={opt.text}
            onChange={(e) => handleOptionChange(idx, e.target.value)}
            style={styles.optionInput(opt.isCorrect)}
            placeholder={`Opțiunea ${idx + 1}`}
          />
          <input
            type="checkbox"
            checked={opt.isCorrect}
            onChange={() => handleCorrectToggle(idx)}
            style={styles.checkbox}
          />
        </div>
      ))}
    </div>
  );
}