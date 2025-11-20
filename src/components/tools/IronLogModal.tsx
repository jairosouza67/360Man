import { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { WorkoutPlan } from '../../lib/ai';
import { getPredefinedWorkout } from '../../lib/workouts';
import { ExercisePlayer } from './ExercisePlayer';
import { ArrowLeft, X, Zap, Play, CheckCircle2 } from 'lucide-react';

export const IronLogModal = ({ onClose }: { onClose: () => void }) => {
    const { profile, saveWorkoutPlan } = useAuthStore();
    const [step, setStep] = useState<'input' | 'loading' | 'result'>(profile?.workoutPlan ? 'result' : 'input');
    const [level, setLevel] = useState('Iniciante');
    const [days, setDays] = useState('3');
    const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(profile?.workoutPlan || null);
    const [viewingExercise, setViewingExercise] = useState<any | null>(null);

    const generateRoutine = async () => {
        setStep('loading');
        
        // Simulate a small delay for UX "processing" feel
        await new Promise(resolve => setTimeout(resolve, 800));

        const plan = getPredefinedWorkout(level, days);
        
        if (plan) {
            setWorkoutPlan(plan);
            saveWorkoutPlan(plan);
            setStep('result');
        } else {
            setStep('input');
            // Fallback alert, though with our static data this shouldn't happen often if keys match
            alert("Protocolo específico não encontrado para esta combinação. Tentando adaptar...");
            // Try to find a fallback in the database manually if needed, or just reset
        }
    };

    const resetWorkout = () => {
        setWorkoutPlan(null);
        saveWorkoutPlan(undefined);
        setStep('input');
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
            <div className="bg-dark-900 border border-white/10 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative flex flex-col rounded-2xl">
                
                <div className="p-6 border-b border-white/10 bg-dark-900/95 sticky top-0 backdrop-blur-sm z-20 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <button onClick={onClose} className="bg-transparent border-0 p-0 flex items-center gap-2 text-zinc-400 hover:text-white transition-colors group">
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            <span className="text-sm font-medium">Voltar</span>
                        </button>
                        <div className="h-4 w-px bg-white/10"></div>
                        <div className="flex items-center gap-2">
                            <Zap className="w-5 h-5 text-gold-500" />
                            <h2 className="text-lg font-bold text-white">Iron Log</h2>
                        </div>
                    </div>
                    <button onClick={onClose} className="bg-transparent border-0 p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-8 flex-1">
                    {step === 'input' && (
                        <div className="space-y-8 max-w-lg mx-auto">
                            <div className="bg-dark-850 p-4 border border-white/5 rounded-lg">
                                <p className="text-sm text-zinc-400">
                                    Selecione seu nível e disponibilidade para carregar um dos protocolos oficiais (Baseados nos PDFs do sistema).
                                </p>
                            </div>

                            <div className="space-y-4">
                                <label className="block text-sm font-medium text-zinc-400 uppercase tracking-wider">Nível de Experiência</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {['Iniciante', 'Intermediário', 'Avançado'].map(l => (
                                        <button
                                            key={l}
                                            onClick={() => setLevel(l)}
                                            className={`p-3 text-sm font-medium rounded-lg transition-all border ${level === l 
                                                ? 'bg-white text-black border-white' 
                                                : 'bg-transparent text-zinc-400 border-white/10 hover:border-white/30 hover:text-white'}`}
                                        >
                                            {l}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="block text-sm font-medium text-zinc-400 uppercase tracking-wider">Dias Disponíveis / Semana</label>
                                <div className="grid grid-cols-4 gap-3">
                                    {['2', '3', '4', '5'].map(d => (
                                        <button
                                            key={d}
                                            onClick={() => setDays(d)}
                                            className={`p-3 text-sm font-medium rounded-lg transition-all border ${days === d 
                                                ? 'bg-cobalt-600 text-white border-cobalt-600' 
                                                : 'bg-transparent text-zinc-400 border-white/10 hover:border-white/30 hover:text-white'}`}
                                        >
                                            {d}x
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button 
                                onClick={generateRoutine}
                                className="w-full py-4 bg-gold-500 hover:bg-gold-400 text-black font-bold rounded-xl transition-all shadow-lg shadow-gold-500/20 mt-4 flex items-center justify-center gap-2"
                            >
                                <CheckCircle2 className="w-5 h-5" />
                                Carregar Protocolo
                            </button>
                        </div>
                    )}

                    {step === 'loading' && (
                        <div className="flex flex-col items-center justify-center py-20 space-y-6">
                            <div className="w-16 h-16 border-4 border-dark-800 border-t-gold-500 rounded-full animate-spin"></div>
                            <div className="text-center">
                                <h3 className="text-white text-lg font-medium animate-pulse">Buscando Protocolo...</h3>
                                <p className="text-zinc-500 text-sm mt-2">Carregando estrutura de treino validada.</p>
                            </div>
                        </div>
                    )}

                    {step === 'result' && workoutPlan && (
                        <div className="space-y-8 animate-fade-in">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
                                <div>
                                    <h3 className="text-2xl text-white font-bold">{workoutPlan.title}</h3>
                                    <div className="flex gap-3 mt-2">
                                        <span className="px-2 py-1 bg-gold-500/10 text-xs text-gold-500 uppercase font-bold rounded border border-gold-500/20">{workoutPlan.level}</span>
                                        <span className="px-2 py-1 bg-cobalt-500/10 text-xs text-cobalt-400 uppercase font-bold rounded border border-cobalt-500/20">{workoutPlan.frequency}</span>
                                    </div>
                                </div>
                                <button onClick={resetWorkout} className="bg-transparent border-0 text-sm text-zinc-500 hover:text-white underline">Trocar Protocolo</button>
                            </div>

                            <div className="grid gap-8">
                                {workoutPlan.schedule.map((day, idx) => (
                                    <div key={idx} className="border border-white/10 bg-dark-850 p-6 rounded-xl">
                                        <h4 className="text-lg text-white font-bold mb-6 border-l-4 border-cobalt-500 pl-4">{day.dayName}</h4>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left text-sm">
                                                <thead>
                                                    <tr className="text-zinc-500 border-b border-white/5 uppercase text-xs tracking-wider">
                                                        <th className="pb-3 font-medium pl-2 w-12">Vídeo</th>
                                                        <th className="pb-3 font-medium">Exercício</th>
                                                        <th className="pb-3 font-medium w-24">Séries</th>
                                                        <th className="pb-3 font-medium w-24">Reps</th>
                                                        <th className="pb-3 font-medium w-24">Descanso</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-white/5">
                                                    {day.exercises.map((ex, i) => (
                                                        <tr key={i} className="group hover:bg-white/5 transition-colors">
                                                            <td className="py-3 pl-2">
                                                                <button 
                                                                    onClick={() => setViewingExercise(ex)}
                                                                    className="w-8 h-8 rounded-lg bg-dark-800 border border-white/10 flex items-center justify-center hover:bg-red-600 hover:border-red-500 hover:text-white text-zinc-400 transition-all p-0 group/btn"
                                                                    title="Ver Execução no DeltaBolic"
                                                                >
                                                                    <Play className="w-3 h-3 ml-0.5 fill-current" />
                                                                </button>
                                                            </td>
                                                            <td className="py-4 font-medium text-zinc-200">
                                                                {ex.name}
                                                                {ex.technique && (
                                                                    <span className="block text-xs text-gold-500 font-bold uppercase mt-1">{ex.technique}</span>
                                                                )}
                                                            </td>
                                                            <td className="py-4 text-zinc-400">{ex.sets}</td>
                                                            <td className="py-4 text-zinc-400">{ex.reps}</td>
                                                            <td className="py-4 text-zinc-500 text-xs">{ex.rest}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="bg-dark-850 p-4 border border-gold-500/20 rounded-xl text-zinc-400 text-sm">
                                <span className="font-bold text-gold-500 uppercase text-xs block mb-1">Nota Técnica:</span>
                                "{workoutPlan.notes}"
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {viewingExercise && (
                 <ExercisePlayer exercise={viewingExercise} onClose={() => setViewingExercise(null)} />
             )}
        </div>
    );
};