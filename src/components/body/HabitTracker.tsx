import { useState } from 'react';
import { Plus, Trash2, Check, Flame, Droplets, Clock, Activity, X } from 'lucide-react';
import { format, eachDayOfInterval, subDays } from 'date-fns';
import { useAuthStore } from '../../stores/authStore';
import { useTrackerStore, Habit, TrackerEntry } from '../../stores/trackerStore';

interface HabitTrackerProps {
    habits: Habit[];
    logs: TrackerEntry[];
}

export function HabitTracker({ habits, logs }: HabitTrackerProps) {
    const { user } = useAuthStore();
    const { createHabit, deleteHabit, saveTrackerValue } = useTrackerStore();
    const [isCreating, setIsCreating] = useState(false);
    const [newHabit, setNewHabit] = useState<Partial<Habit>>({
        title: '',
        type: 'boolean',
        goal: 1,
        unit: '',
        color: 'green'
    });

    // Group logs by habitId and date
    const getHabitLogs = (habitId: string) => {
        return logs.filter(log => log.value.habitId === habitId);
    };

    const getTodayLog = (habitId: string) => {
        const today = format(new Date(), 'yyyy-MM-dd');
        return logs.find(log => log.value.habitId === habitId && log.date === today);
    };

    const handleCreateHabit = async () => {
        if (!user || !newHabit.title) {
            console.log('Validation failed:', { hasUser: !!user, hasTitle: !!newHabit.title });
            alert('Por favor, preencha o nome do hábito.');
            return;
        }

        try {
            console.log('Creating habit with data:', {
                userId: user.id,
                title: newHabit.title,
                type: newHabit.type,
                goal: newHabit.goal
            });

            await createHabit({
                userId: user.id,
                title: newHabit.title,
                type: newHabit.type as any,
                goal: newHabit.goal,
                unit: newHabit.unit,
                color: newHabit.color
            });

            console.log('Habit created successfully!');
            alert('Hábito criado com sucesso!');

            setIsCreating(false);
            setNewHabit({ title: '', type: 'boolean', goal: 1, unit: '', color: 'green' });
        } catch (error: any) {
            console.error('Error creating habit:', error);
            alert(`Erro ao criar hábito: ${error.message || 'Erro desconhecido'}. Verifique o console.`);
        }
    };

    const handleLogHabit = async (habit: Habit, value: number) => {
        if (!user) return;
        const today = format(new Date(), 'yyyy-MM-dd');

        await saveTrackerValue(user.id, today, 'habit_log', {
            habitId: habit.id,
            value: value,
            completed: value >= (habit.goal || 1)
        });
    };

    const calculateStreak = (habitId: string) => {
        const habitLogs = getHabitLogs(habitId)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        if (habitLogs.length === 0) return 0;

        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Check if completed today
        const todayLog = habitLogs.find(l => l.date === format(today, 'yyyy-MM-dd'));
        if (todayLog?.value.completed) streak++;

        // Check previous days
        for (let i = 1; i < 365; i++) {
            const date = subDays(today, i);
            const dateStr = format(date, 'yyyy-MM-dd');
            const log = habitLogs.find(l => l.date === dateStr);

            if (log?.value.completed) {
                streak++;
            } else {
                break;
            }
        }
        return streak;
    };

    const renderHeatmap = (habit: Habit) => {
        const today = new Date();
        const startDate = subDays(today, 364); // Last 52 weeks approx
        const habitLogs = getHabitLogs(habit.id);

        // Create a map for quick lookup
        const logMap = new Map();
        habitLogs.forEach(log => {
            logMap.set(log.date, log.value.value);
        });

        type HeatmapDay = { date: string; intensity: number } | null;
        const weeks: HeatmapDay[][] = [];
        let currentWeek: HeatmapDay[] = [];

        // Generate days
        const days = eachDayOfInterval({ start: startDate, end: today });

        // Align to start of week (Monday)
        const firstDay = days[0];
        const dayOfWeek = firstDay.getDay(); // 0 = Sunday
        const offset = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Shift to make Monday 0

        // Add empty cells for offset
        for (let i = 0; i < offset; i++) {
            currentWeek.push(null);
        }

        days.forEach(day => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const value = logMap.get(dateStr);
            const intensity = value ? Math.min((value / (habit.goal || 1)), 1) : 0;

            currentWeek.push({ date: dateStr, intensity });

            if (currentWeek.length === 7) {
                weeks.push(currentWeek);
                currentWeek = [];
            }
        });

        if (currentWeek.length > 0) {
            weeks.push(currentWeek);
        }

        return (
            <div className="flex gap-1 overflow-x-auto pb-2 custom-scrollbar">
                {weeks.map((week, wIndex) => (
                    <div key={wIndex} className="flex flex-col gap-1">
                        {week.map((day, dIndex) => {
                            if (!day) return <div key={`empty-${dIndex}`} className="w-3 h-3" />;

                            let bgColor = 'bg-dark-800';
                            if (day.intensity > 0) {
                                // Simple opacity based intensity
                                // In a real app, use proper color scales
                                bgColor = habit.color === 'red' ? `bg-red-500` :
                                    habit.color === 'blue' ? `bg-blue-500` :
                                        habit.color === 'purple' ? `bg-purple-500` :
                                            `bg-green-500`;
                            }

                            return (
                                <div
                                    key={day.date}
                                    className={`w-3 h-3 rounded-sm ${bgColor} ${day.intensity === 0 ? 'bg-opacity-100' : ''}`}
                                    style={{ opacity: day.intensity > 0 ? day.intensity : 1 }}
                                    title={`${day.date}: ${logMap.get(day.date) || 0}`}
                                />
                            );
                        })}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
                <div>
                    <h2 className="text-lg sm:text-xl font-bold text-white">A Grade</h2>
                    <p className="text-xs sm:text-sm text-zinc-400">Consistência é a chave.</p>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors flex items-center justify-center gap-2 text-sm w-full sm:w-auto"
                >
                    <Plus className="h-4 w-4" />
                    <span>Novo Hábito</span>
                </button>
            </div>

            {isCreating && (
                <div className="bg-dark-850 p-4 rounded-xl border border-white/10 animate-in slide-in-from-top-2">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-white font-medium">Criar Novo Hábito</h3>
                        <button onClick={() => setIsCreating(false)} className="text-zinc-500 hover:text-white">
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-xs text-zinc-400 mb-1">Nome</label>
                            <input
                                type="text"
                                value={newHabit.title}
                                onChange={e => setNewHabit({ ...newHabit, title: e.target.value })}
                                className="w-full bg-dark-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                                placeholder="Ex: Beber Água"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-zinc-400 mb-1">Tipo</label>
                            <select
                                value={newHabit.type}
                                onChange={e => setNewHabit({ ...newHabit, type: e.target.value as any })}
                                className="w-full bg-dark-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                            >
                                <option value="boolean">Sim/Não</option>
                                <option value="numeric">Numérico</option>
                                <option value="time">Tempo</option>
                            </select>
                        </div>
                        {newHabit.type !== 'boolean' && (
                            <>
                                <div>
                                    <label className="block text-xs text-zinc-400 mb-1">Meta Diária</label>
                                    <input
                                        type="number"
                                        value={newHabit.goal}
                                        onChange={e => setNewHabit({ ...newHabit, goal: parseFloat(e.target.value) })}
                                        className="w-full bg-dark-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-zinc-400 mb-1">Unidade</label>
                                    <input
                                        type="text"
                                        value={newHabit.unit}
                                        onChange={e => setNewHabit({ ...newHabit, unit: e.target.value })}
                                        className="w-full bg-dark-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                                        placeholder="Ex: Litros, Minutos"
                                    />
                                </div>
                            </>
                        )}
                        <div>
                            <label className="block text-xs text-zinc-400 mb-1">Cor</label>
                            <div className="flex gap-2">
                                {['green', 'red', 'blue', 'purple'].map(color => (
                                    <button
                                        key={color}
                                        onClick={() => setNewHabit({ ...newHabit, color })}
                                        className={`w-6 h-6 rounded-full border-2 ${newHabit.color === color ? 'border-white' : 'border-transparent'
                                            } bg-${color}-500`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleCreateHabit}
                        disabled={!newHabit.title}
                        className="w-full bg-green-600 hover:bg-green-500 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                    >
                        Criar Hábito
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 gap-6">
                {habits.map(habit => {
                    const todayLog = getTodayLog(habit.id);
                    const streak = calculateStreak(habit.id);
                    const isCompleted = todayLog?.value.completed;

                    return (
                        <div key={habit.id} className="bg-dark-850 rounded-xl border border-white/10 p-6">
                            <div className="flex flex-col md:flex-row justify-between gap-6">
                                {/* Habit Info & Input */}
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg bg-${habit.color || 'green'}-500/10`}>
                                                {habit.type === 'time' ? <Clock className={`h-5 w-5 text-${habit.color || 'green'}-400`} /> :
                                                    habit.type === 'numeric' ? <Droplets className={`h-5 w-5 text-${habit.color || 'green'}-400`} /> :
                                                        <Activity className={`h-5 w-5 text-${habit.color || 'green'}-400`} />}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-white">{habit.title}</h3>
                                                <div className="flex items-center gap-2 text-xs text-zinc-400">
                                                    <span className="flex items-center gap-1">
                                                        <Flame className="h-3 w-3 text-orange-500" />
                                                        {streak} dias
                                                    </span>
                                                    <span>•</span>
                                                    <span>Meta: {habit.goal} {habit.unit}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => deleteHabit(habit.id)}
                                            className="text-zinc-600 hover:text-red-400 transition-colors"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>

                                    {/* Input Area */}
                                    <div className="bg-dark-900 rounded-lg p-4 border border-white/5">
                                        {habit.type === 'boolean' ? (
                                            <button
                                                onClick={() => handleLogHabit(habit, isCompleted ? 0 : 1)}
                                                className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 transition-all ${isCompleted
                                                    ? `bg-${habit.color || 'green'}-500 text-white`
                                                    : 'bg-dark-800 text-zinc-400 hover:bg-dark-700'
                                                    }`}
                                            >
                                                {isCompleted ? <Check className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                                                {isCompleted ? 'Concluído' : 'Marcar como Feito'}
                                            </button>
                                        ) : (
                                            <div className="flex items-center gap-4">
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max={habit.goal ? habit.goal * 1.5 : 100}
                                                    step={habit.type === 'numeric' ? 0.1 : 1}
                                                    value={todayLog?.value.value || 0}
                                                    onChange={(e) => handleLogHabit(habit, parseFloat(e.target.value))}
                                                    className="flex-1 h-2 bg-dark-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                                />
                                                <div className="w-20 text-right">
                                                    <span className="text-lg font-bold text-white">{todayLog?.value.value || 0}</span>
                                                    <span className="text-xs text-zinc-500 ml-1">{habit.unit}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Heatmap */}
                                <div className="flex-1 overflow-hidden">
                                    <h4 className="text-xs text-zinc-500 mb-2 uppercase tracking-wider">Consistência (Último Ano)</h4>
                                    {renderHeatmap(habit)}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
