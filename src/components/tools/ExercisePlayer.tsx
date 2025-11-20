import { useState, useEffect } from 'react';
import { DELTABOLIC_VIDEO_MAP, EXERCISE_TRANSLATIONS } from '../../lib/workouts';
import { ArrowLeft, X, ExternalLink, Youtube } from 'lucide-react';

interface Exercise {
    name: string;
    sets: number;
    reps: string;
    rest: string;
    technique?: string;
}

export const ExercisePlayer = ({ exercise, onClose }: { exercise: Exercise, onClose: () => void }) => {
    const [videoId, setVideoId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. Tenta encontrar ID direto
        const id = DELTABOLIC_VIDEO_MAP[exercise.name];
        
        if (id) {
            setVideoId(id);
        }
        // Se não achar, videoId fica null e mostramos o fallback
        setLoading(false);
    }, [exercise.name]);

    // Construct the specific search URL for DeltaBolic Shorts
    const englishName = EXERCISE_TRANSLATIONS[exercise.name] || exercise.name;
    const searchUrl = `https://www.youtube.com/results?search_query=DeltaBolic+${encodeURIComponent(englishName)}+shorts`;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-lg p-4 animate-fade-in">
            <div className="bg-dark-950 border border-red-900/30 w-full max-w-4xl shadow-2xl shadow-red-900/10 relative flex flex-col overflow-hidden rounded-xl">
                 <div className="p-4 border-b border-white/10 flex justify-between items-center bg-dark-950">
                    <div className="flex items-center gap-4">
                        <button onClick={onClose} className="bg-transparent border-0 p-0 flex items-center gap-2 text-zinc-500 hover:text-white transition-colors group">
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            <span className="text-xs font-bold uppercase tracking-widest">Voltar</span>
                        </button>
                        <div className="h-4 w-px bg-white/10"></div>
                        <div>
                            <h3 className="text-white font-bold uppercase tracking-wider text-sm flex items-center gap-2">
                                {exercise.name} <span className="text-xs text-red-500 px-1.5 py-0.5 bg-red-900/20 rounded border border-red-900/30">@DeltaBolic</span>
                            </h3>
                        </div>
                    </div>
                    <button onClick={onClose} className="bg-transparent border-0 p-2 text-zinc-500 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="aspect-video w-full bg-black relative group flex items-center justify-center">
                    {loading ? (
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-8 h-8 border-2 border-dark-800 border-t-red-500 rounded-full animate-spin"></div>
                        </div>
                    ) : videoId ? (
                        <iframe 
                            width="100%" 
                            height="100%" 
                            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
                            title={`DeltaBolic ${exercise.name}`}
                            frameBorder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowFullScreen
                            className="w-full h-full"
                        ></iframe>
                    ) : (
                        <div className="text-center p-8 max-w-md">
                             <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-600/20">
                                <Youtube className="w-8 h-8 text-white fill-current" />
                             </div>
                             <h4 className="text-white font-bold text-lg mb-2">Vídeo Não Mapeado</h4>
                             <p className="text-zinc-400 mb-6 text-sm leading-relaxed">
                                O vídeo específico para este exercício ainda não foi indexado no sistema. Você pode buscá-lo manualmente no canal oficial.
                             </p>
                             <a 
                                href={searchUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-zinc-200 transition-colors rounded-lg"
                            >
                                <span>Buscar no DeltaBolic</span>
                                <ExternalLink className="w-4 h-4" />
                             </a>
                        </div>
                    )}
                </div>

                <div className="p-6 bg-dark-900 space-y-4">
                    <div className="flex gap-4 text-xs uppercase tracking-widest font-mono text-zinc-400 border-b border-white/10 pb-4">
                        <div className="flex-1 text-center border-r border-white/10 last:border-0">
                            <span className="block text-red-500 mb-1">Séries</span>
                            <span className="text-white font-bold">{exercise.sets}</span>
                        </div>
                        <div className="flex-1 text-center border-r border-white/10 last:border-0">
                            <span className="block text-red-500 mb-1">Reps</span>
                            <span className="text-white font-bold">{exercise.reps}</span>
                        </div>
                        <div className="flex-1 text-center">
                            <span className="block text-red-500 mb-1">Descanso</span>
                            <span className="text-white font-bold">{exercise.rest}</span>
                        </div>
                    </div>
                    
                    <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                        {exercise.technique ? (
                            <div className="bg-cobalt-900/20 border border-cobalt-900/50 p-3 rounded-lg text-sm text-cobalt-200 flex-1 w-full">
                                <strong className="text-cobalt-500 uppercase text-xs block mb-1 tracking-wider">Técnica Avançada</strong>
                                {exercise.technique}
                            </div>
                        ) : (
                            <div className="bg-dark-800/30 border border-white/10 p-3 rounded-lg text-sm text-zinc-500 flex-1 text-center italic w-full">
                                Mantenha o foco na fase excêntrica (negativa) do movimento.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};