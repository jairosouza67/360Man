import React, { useState } from 'react';
import { useTrackerStore } from '../../stores/trackerStore';
import { useAuthStore } from '../../stores/authStore';
import { Brain, Play, Plus, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function DeepWorkWidget() {
    const { user } = useAuthStore();
    const { saveTrackerValue, trackers } = useTrackerStore();
    const [duration, setDuration] = useState('');
    const [isLogging, setIsLogging] = useState(false);

    const today = format(new Date(), 'yyyy-MM-dd');

    // Calculate total deep work today
    const todayDeepWork = trackers
        .filter(t => t.date === today && t.type === 'career')
        .reduce((acc, curr) => acc + (curr.value?.duration || 0), 0);

    const handleSave = async () => {
        if (!user || !duration) return;

        await saveTrackerValue(user.id, today, 'career', {
            completed: true,
            type: 'deep_work',
            duration: parseInt(duration),
            timestamp: new Date().toISOString()
        });

        setDuration('');
        setIsLogging(false);
    };

    return (
        <div className="bg-dark-850 rounded-2xl border border-white/10 p-6 h-full flex flex-col justify-between relative overflow-hidden group hover:border-cobalt-500/30 transition-all">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <Brain className="h-24 w-24 text-cobalt-400" />
            </div>

            <div>
                <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-cobalt-500/10 rounded-lg">
                        <Brain className="h-5 w-5 text-cobalt-400" />
                    </div>
                    <h3 className="font-medium text-white">Deep Work</h3>
                </div>

                <div className="mb-4">
                    <div className="text-3xl font-light text-white mb-1">
                        {Math.floor(todayDeepWork / 60)}h {todayDeepWork % 60}m
                    </div>
                    <p className="text-sm text-zinc-400">Foco total hoje</p>
                </div>
            </div>

            {isLogging ? (
                <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
                    <div>
                        <label className="block text-xs text-zinc-500 mb-1">Duração (min)</label>
                        <input
                            type="number"
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            className="w-full bg-dark-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:ring-1 focus:ring-cobalt-500 outline-none"
                            placeholder="Ex: 60"
                            autoFocus
                        />
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setIsLogging(false)}
                            className="flex-1 px-3 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:bg-dark-800 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={!duration}
                            className="flex-1 bg-cobalt-600 hover:bg-cobalt-500 disabled:opacity-50 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors"
                        >
                            Salvar
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    onClick={() => setIsLogging(true)}
                    className="w-full bg-dark-900 hover:bg-dark-800 border border-white/5 text-zinc-300 hover:text-white px-4 py-3 rounded-xl flex items-center justify-center space-x-2 transition-all group-hover:border-cobalt-500/20"
                >
                    <Play className="h-4 w-4" />
                    <span>Iniciar Sessão</span>
                </button>
            )}
        </div>
    );
}
