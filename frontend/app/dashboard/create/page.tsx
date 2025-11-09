"use client";

import React, { useState, useCallback, useEffect } from 'react';
import QuestionEditor from '@/components/game/QuestionEditor'; 
import { API_BASE_URL } from '@/lib/api'; 

// --- TIPURI DE DATE ---
type Choice = { text: string; isCorrect: boolean };
type QuestionData = { 
    id: number; 
    text: string; 
    timeLimit: number; 
    options: Choice[];
};
type GameData = { title: string; questions: QuestionData[] };

// --- CULORI DE BAZĂ (Definite PRIMA dată pentru a evita eroarea de referință) ---
const COLORS = {
    primary: '#007AFF', // Albastru (iOS Action)
    secondary: '#34C759', // Verde (Success)
    destructive: '#FF3B30', // Roșu (Delete/Error)
    neutralBg: '#F2F2F7', // Fundal pagină (iOS Settings Style)
    cardBg: '#FFFFFF', // Fundal Card
    lightBorder: '#D1D1D6', // Bordură fină
    darkText: '#1C1C1E', // Text principal
    lightText: '#8E8E93', // Text secundar/Label
};


// --- STYLING OBJECTS (Stil Apple) ---
const styles = {
    // Proprietăți de culoare preluate direct din COLORS
    primaryColor: COLORS.primary,
    destructiveColor: COLORS.destructive,

    shadow: '0 1px 3px rgba(0, 0, 0, 0.08)', 

    container: {
        maxWidth: '900px',
        margin: '50px auto',
        padding: '30px',
        backgroundColor: COLORS.cardBg,
        borderRadius: '16px', // Muchii rotunjite
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)', // Umbră elegantă
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
    },
    header: {
        fontSize: '2rem',
        color: COLORS.darkText, 
        marginBottom: '25px',
        fontWeight: '700', 
    },
    inputGroup: {
        marginBottom: '25px',
    },
    label: {
        display: 'block',
        marginBottom: '6px',
        fontWeight: '600',
        fontSize: '0.95rem',
        color: COLORS.lightText, 
    },
    input: {
        padding: '12px',
        width: '100%',
        boxSizing: 'border-box' as 'border-box',
        borderRadius: '10px', 
        border: `1px solid ${COLORS.lightBorder}`, 
        fontSize: '1rem',
        transition: 'border-color 0.2s',
    },
    addButton: {
        backgroundColor: '#E5E5EA', // Gri deschis
        color: COLORS.primary, // Text albastru
        padding: '12px 25px',
        borderRadius: '10px',
        border: 'none',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: '600',
        transition: 'background-color 0.2s, opacity 0.2s',
        opacity: 1,
    },
    saveButton: {
        backgroundColor: COLORS.primary, 
        color: 'white',
        padding: '15px 30px',
        borderRadius: '12px',
        fontSize: '1.1rem',
        fontWeight: '700',
        marginTop: '30px',
        boxShadow: `0 8px 20px ${COLORS.primary}33`, 
        border: 'none',
        cursor: 'pointer',
        transition: 'background-color 0.2s, opacity 0.2s',
    },
    disabledSaveButton: { 
        backgroundColor: '#A0C0E0', 
        cursor: 'not-allowed',
        boxShadow: 'none',
    },
    removeButton: {
        marginTop: '10px', 
        backgroundColor: COLORS.destructive, 
        color: 'white', 
        padding: '8px 15px', 
        border: 'none', 
        borderRadius: '8px', 
        cursor: 'pointer',
        fontWeight: '500',
        transition: 'background-color 0.2s',
    },
    questionCard: {
        marginBottom: '20px', 
        border: `1px solid ${COLORS.lightBorder}`, 
        padding: '20px', 
        borderRadius: '12px',
        backgroundColor: '#FAFAFC', // Fundal ușor diferit pentru a se evidenția
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
    },
    questionHeader: {
        color: COLORS.darkText, 
        marginBottom: '10px',
        fontSize: '1.2rem',
        fontWeight: '600',
        paddingBottom: '5px',
        borderBottom: `1px solid ${COLORS.lightBorder}`, 
    },
    error: {
        color: COLORS.destructive, // Acum funcționează corect
        marginTop: '15px',
        padding: '10px',
        backgroundColor: '#FFEBEE', 
        borderRadius: '8px',
        border: `1px solid ${COLORS.destructive}`, // Acum funcționează corect
        fontWeight: '500',
    },
};
// -----------------------------


// Hook pentru a verifica dacă randarea s-a mutat pe client (montat)
const useIsMounted = () => {
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);
    return mounted;
};


export default function CreateGamePage() {
    const isMounted = useIsMounted(); 
    
    const [game, setGame] = useState<GameData>({ title: '', questions: [] });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // --- Funcționalitatea rămâne neschimbată ---
    const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setGame(prev => ({ ...prev, title: e.target.value }));
    }, []);

    const addQuestion = useCallback(() => {
        setGame(prev => ({
            ...prev,
            questions: [
                ...prev.questions,
                { id: Date.now(), text: '', timeLimit: 20, options: [] },
            ],
        }));
    }, []);

    const updateQuestion = useCallback((id: number, updatedFields: Partial<QuestionData>) => {
        setGame(prev => ({
            ...prev,
            questions: prev.questions.map(q => 
                q.id === id ? { ...q, ...updatedFields } : q
            ),
        }));
    }, []);

    const removeQuestion = useCallback((id: number) => {
        setGame(prev => ({
            ...prev,
            questions: prev.questions.filter(q => q.id !== id),
        }));
    }, []);
    
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (game.title.trim() === '' || game.questions.length === 0) {
            setError('Titlul si cel putin o intrebare sunt necesare.');
            return;
        }
        
        setLoading(true);
        setError(null);

        const finalPayload = {
            title: game.title,
            questions: game.questions.map((q, index) => ({
                text: q.text,
                time_limit: q.timeLimit,
                order: index + 1, 
                choices: q.options.map(opt => ({ 
                    text: opt.text, 
                    is_correct: opt.isCorrect 
                }))
            }))
        };

        try {
            const gameResponse = await fetch(`${API_BASE_URL}/api/games/`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    // Aici ar trebui să fie token-ul de autentificare
                },
                body: JSON.stringify(finalPayload), 
            });

            if (!gameResponse.ok) {
                const errorData = await gameResponse.json(); 
                throw new Error(`Eroare la salvare: ${JSON.stringify(errorData)}`);
            }
            
            const createdGame = await gameResponse.json();
            
            alert(`Jocul "${createdGame.title}" (ID: ${createdGame.id}) a fost salvat cu succes!`);
            
            // TODO: Redirecționează profesorul
            
            setGame({ title: '', questions: [] }); 
            
        } catch (e) {
            setError(e instanceof Error ? e.message : 'A aparut o eroare necunoscută.');
        } finally {
            setLoading(false);
        }
    };

    // Aplicarea stilului disabled condițional
    const saveButtonStyles = {
        ...styles.saveButton,
        ...(loading || game.questions.length === 0 ? styles.disabledSaveButton : {}),
    };


    if (!isMounted) {
        return <div style={{padding: 50, textAlign: 'center'}}>Se încarcă formularul...</div>;
    }


    return (
        <div style={{ backgroundColor: COLORS.neutralBg, minHeight: '100vh', padding: '1px 0' }}>
            <div style={styles.container}>
                <h2 style={styles.header}>Kahoot Time</h2>
                
                <div style={styles.inputGroup}>
                    <label style={styles.label} htmlFor="game-title">TITLU JOC</label>
                    <input
                        id="game-title"
                        value={game.title}
                        onChange={handleTitleChange}
                        style={styles.input as React.CSSProperties}
                        placeholder="Ex: Quiz de Geografie - Capitolul 1"
                    />
                </div>

                <h3 style={{ fontSize: '1.4rem', marginBottom: '20px', fontWeight: '600', color: COLORS.darkText }}>
                    Intrebari ({game.questions.length})
                </h3>

                {game.questions.map((q, index) => (
                    <div key={q.id} style={styles.questionCard}>
                        <h4 style={styles.questionHeader}>Întrebarea #{index + 1}</h4>
                        <QuestionEditor 
                            question={q}
                            onChange={(updatedFields) => updateQuestion(q.id, updatedFields)}
                        />
                        <button 
                            onClick={() => removeQuestion(q.id)} 
                            style={styles.removeButton as React.CSSProperties}
                        >
                            Sterge Intrebarea
                        </button>
                    </div>
                ))}

                <button onClick={addQuestion} style={styles.addButton as React.CSSProperties}>
                    + Adauga Intrebare Noua
                </button>

                {error && <div style={styles.error}>{error}</div>}
                
                <button 
                    onClick={handleSubmit} 
                    style={saveButtonStyles as React.CSSProperties}
                    disabled={loading || game.questions.length === 0}
                >
                    {loading ? 'Se Salveaza..' : 'Salveaza Jocul Complet'}
                </button>
                
            </div>
        </div>
    );
}