"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import QuestionEditor from '@/components/game/QuestionEditor';
import { API_BASE_URL } from '@/lib/api';
import { getStoredToken } from '@/lib/authToken'; 

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
    const router = useRouter();
    const isMounted = useIsMounted();

    const [game, setGame] = useState<GameData>({ title: '', questions: [] });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const token = getStoredToken();
        if (!token) {
            router.replace('/login');
        }
    }, [router]);

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
            const token = getStoredToken();
            if (!token) {
                throw new Error('Nu ești autentificat. Te rugăm să te autentifici.');
            }

            const gameResponse = await fetch(`${API_BASE_URL}/games/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${token}`,
                },
                body: JSON.stringify(finalPayload),
            });

            if (!gameResponse.ok) {
                const errorData = await gameResponse.json(); 
                throw new Error(`Eroare la salvare: ${JSON.stringify(errorData)}`);
            }
            
            const createdGame = await gameResponse.json();

            alert(`Jocul "${createdGame.title}" (ID: ${createdGame.id}) a fost salvat cu succes!`);

            // Redirect to dashboard
            router.push('/dashboard'); 
            
        } catch (e) {
            setError(e instanceof Error ? e.message : 'A aparut o eroare necunoscută.');
        } finally {
            setLoading(false);
        }
    };

    const totalQuestions = game.questions.length;
    const avgTime = totalQuestions
        ? Math.round(
            game.questions.reduce((sum, q) => sum + q.timeLimit, 0) / totalQuestions
          )
        : 0;
    const disableSave =
        loading || totalQuestions === 0 || game.title.trim().length === 0;

    if (!isMounted) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-200">
                Se încarcă studio-ul de quiz...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white">
            <div className="app-page">
                <div className="game-shell">
                    <header className="flex flex-col gap-6 rounded-[32px] border border-white/10 bg-white/5 p-8 text-white shadow-[0_40px_120px_rgba(2,6,23,0.65)] backdrop-blur-2xl lg:flex-row lg:items-center lg:justify-between">
                        <div className="space-y-3">
                            <p className="app-pill">Teachium quiz studio</p>
                            <h1 className="text-4xl font-semibold">Build a Kahoot-style game</h1>
                            <p className="text-sm text-slate-300">
                                Turn your lesson into a fast-paced challenge. Draft questions, set timers,
                                and save once you are happy with the deck.
                            </p>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-3">
                            <StatCard label="Questions" value={totalQuestions.toString()} footer="min. 1 required" />
                            <StatCard label="Avg. Timer" value={`${avgTime || 20}s`} footer="per slide" />
                            <StatCard label="Status" value={disableSave ? 'Draft' : 'Ready'} footer="save when ready" />
                        </div>
                    </header>

                    <div className="grid gap-6 lg:grid-cols-[2.1fr,0.9fr]">
                        <section className="space-y-6 rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-[0_35px_120px_rgba(2,6,23,0.5)] backdrop-blur-2xl">
                            <div className="space-y-4">
                                <label className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
                                    Game title
                                </label>
                                <input
                                    id="game-title"
                                    value={game.title}
                                    onChange={handleTitleChange}
                                    placeholder="Ex: Geografie Europa - capitolul 1"
                                    className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-lg text-white placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Question bank</p>
                                    <h3 className="text-xl font-semibold">Întrebări ({totalQuestions})</h3>
                                </div>
                                <button
                                    onClick={addQuestion}
                                    className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/40"
                                >
                                    + Adaugă întrebare
                                </button>
                            </div>

                            {game.questions.length === 0 ? (
                                <div className="rounded-3xl border border-dashed border-white/15 p-10 text-center text-sm text-slate-400">
                                    Nicio întrebare încă. Apasă „Adaugă întrebare” pentru a începe.
                                </div>
                            ) : (
                                <div className="space-y-5">
                                    {game.questions.map((q, index) => (
                                        <article
                                            key={q.id}
                                            className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-inner shadow-white/5"
                                        >
                                            <header className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
                                                        Întrebarea #{index + 1}
                                                    </p>
                                                    <h4 className="text-lg font-semibold">{q.text || 'Completează întrebarea'}</h4>
                                                </div>
                                                <button
                                                    onClick={() => removeQuestion(q.id)}
                                                    className="rounded-full border border-red-500/40 px-3 py-1 text-xs font-semibold text-red-200 transition hover:border-red-400/90 hover:text-white"
                                                >
                                                    Șterge
                                                </button>
                                            </header>

                                            <div className="mt-4 rounded-2xl border border-white/10 bg-slate-900/30 p-4">
                                                <QuestionEditor
                                                    question={q}
                                                    onChange={(updatedFields) => updateQuestion(q.id, updatedFields)}
                                                />
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            )}

                            {error && (
                                <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                                    {error}
                                </div>
                            )}

                            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                                <button
                                    onClick={handleSubmit}
                                    disabled={disableSave}
                                    className={`app-button w-full justify-center sm:w-auto ${
                                        disableSave ? 'opacity-50' : ''
                                    }`}
                                >
                                    {loading ? 'Se salvează...' : 'Salvează jocul'}
                                </button>
                            </div>
                        </section>

                        <aside className="space-y-6">
                            <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-[0_25px_80px_rgba(2,6,23,0.45)] backdrop-blur-2xl">
                                <h3 className="text-lg font-semibold">Checklist rapid</h3>
                                <ul className="mt-4 space-y-3 text-sm text-slate-200">
                                    <ChecklistItem checked={game.title.trim().length > 0} label="Titlu adăugat" />
                                    <ChecklistItem checked={totalQuestions > 0} label="Cel puțin o întrebare" />
                                    <ChecklistItem
                                        checked={game.questions.every(q => q.options.some(opt => opt.isCorrect))}
                                        label="Răspuns corect definit"
                                    />
                                    <ChecklistItem
                                        checked={game.questions.every(q => q.timeLimit > 0)}
                                        label="Timp setat pentru fiecare întrebare"
                                    />
                                </ul>
                            </div>

                            <div className="rounded-[32px] border border-white/10 bg-gradient-to-br from-indigo-500/40 via-purple-500/30 to-pink-500/30 p-6 shadow-[0_25px_80px_rgba(2,6,23,0.45)] backdrop-blur-2xl">
                                <p className="text-xs uppercase tracking-[0.35em] text-white/70">Tip</p>
                                <h4 className="mt-2 text-xl font-semibold text-white">
                                    Păstrează întrebările concise
                                </h4>
                                <p className="mt-3 text-sm text-white/80">
                                    Elevii citesc pe telefoane. Încearcă să păstrezi 80-120 de caractere și oferă
                                    un singur răspuns corect clar.
                                </p>
                            </div>
                        </aside>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, footer }: { label: string; value: string; footer: string }) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">{label}</p>
            <p className="mt-2 text-2xl font-semibold">{value}</p>
            <p className="text-[11px] uppercase tracking-widest text-slate-500">{footer}</p>
        </div>
    );
}

function ChecklistItem({ checked, label }: { checked: boolean; label: string }) {
    return (
        <li className="flex items-center gap-2">
            <span
                className={`inline-flex h-5 w-5 items-center justify-center rounded-full border text-xs ${
                    checked
                        ? 'border-emerald-400 bg-emerald-400/20 text-emerald-100'
                        : 'border-white/20 text-white/50'
                }`}
            >
                {checked ? '✓' : '•'}
            </span>
            <span className={checked ? 'text-white' : 'text-slate-400'}>{label}</span>
        </li>
    );
}
