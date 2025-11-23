import { useState } from 'react';
import { ArrowUp, ArrowDown, Minus, Settings } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useTrackerStore, TrackerEntry } from '../../stores/trackerStore';
import { format, startOfWeek, addWeeks, getWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface WeeklyProgressProps {
    trackers: TrackerEntry[];
}

interface MetricConfig {
    id: string;
    name: string;
    unit: string;
}

const DEFAULT_METRICS: MetricConfig[] = [
    { id: 'metric1', name: 'Peso', unit: 'kg' },
    { id: 'metric2', name: 'Gordura', unit: '%' },
    { id: 'metric3', name: 'Água', unit: 'L' },
    { id: 'metric4', name: 'Passos', unit: 'k' },
];

export function WeeklyProgress({ trackers }: WeeklyProgressProps) {
    const { user } = useAuthStore();
    const { createTracker } = useTrackerStore();
    const [metrics, setMetrics] = useState<MetricConfig[]>(DEFAULT_METRICS);
    const [isConfiguring, setIsConfiguring] = useState(false);

    const [showAllWeeks, setShowAllWeeks] = useState(false);

    // Generate 52 weeks starting from the beginning of the year or user start date
    // For simplicity, let's show current year weeks
    const currentYear = new Date().getFullYear();
    const currentWeekNum = getWeek(new Date());

    const weeks = Array.from({ length: 52 }, (_, i) => {
        const date = addWeeks(new Date(currentYear, 0, 1), i);
        const weekStart = startOfWeek(date, { weekStartsOn: 1 });
        return {
            weekNum: i + 1,
            startDate: weekStart,
            label: `Semana ${i + 1}`,
            dateLabel: format(weekStart, 'dd/MM', { locale: ptBR })
        };
    });

    // Filter weeks to show
    const visibleWeeks = showAllWeeks
        ? weeks
        : weeks.filter(w => w.weekNum <= currentWeekNum && w.weekNum > currentWeekNum - 5).reverse();

    // Filter trackers for weekly metrics
    const weeklyTrackers = trackers.filter(t => t.type === 'weekly_metric');
    const measurementTrackers = trackers.filter(t => t.type === 'body_measurement');

    const getWeeklyValue = (weekNum: number, metricId: string, metricName: string) => {
        // First check specific weekly tracker
        const entry = weeklyTrackers.find(t =>
            t.metadata?.weekNum === weekNum &&
            t.metadata?.year === currentYear &&
            t.metadata?.metricId === metricId
        );

        if (entry) return entry.value;

        // If not found, check body measurements for this week
        // We try to match metric name to measurement fields (case insensitive)
        const weekStart = weeks[weekNum - 1].startDate;
        const weekEnd = addWeeks(weekStart, 1);

        const measurement = measurementTrackers.find(t => {
            const date = new Date(t.date);
            return date >= weekStart && date < weekEnd;
        });

        if (measurement && measurement.value) {
            const key = Object.keys(measurement.value).find(k =>
                k.toLowerCase() === metricName.toLowerCase() ||
                (k === 'bodyFat' && metricName.toLowerCase().includes('gordura')) ||
                (k === 'weight' && metricName.toLowerCase().includes('peso'))
            );

            if (key) return measurement.value[key];
        }

        return '';
    };

    const handleSaveValue = async (weekNum: number, metricId: string, value: string) => {
        if (!user) return;

        // Find existing entry to update or create new
        const existing = weeklyTrackers.find(t =>
            t.metadata?.weekNum === weekNum &&
            t.metadata?.year === currentYear &&
            t.metadata?.metricId === metricId
        );

        const dateKey = format(new Date(), 'yyyy-MM-dd');

        if (existing) {
            await useTrackerStore.getState().updateTracker(existing.id, { value });
        } else {
            await createTracker({
                userId: user.id,
                type: 'weekly_metric',
                date: dateKey,
                value: value,
                metadata: {
                    weekNum,
                    year: currentYear,
                    metricId
                }
            });
        }
    };

    const getDelta = (weekNum: number, metricId: string, metricName: string, currentValue: string) => {
        if (weekNum <= 1 || !currentValue) return null;
        const prevValue = getWeeklyValue(weekNum - 1, metricId, metricName);
        if (!prevValue) return null;

        const current = parseFloat(currentValue);
        const prev = parseFloat(prevValue);

        if (isNaN(current) || isNaN(prev)) return null;

        const diff = current - prev;
        if (Math.abs(diff) < 0.1) return { icon: Minus, color: 'text-zinc-500' };

        return {
            icon: diff > 0 ? ArrowUp : ArrowDown,
            color: diff > 0 ? 'text-red-400' : 'text-green-400' // Context dependent?
        };
    };

    return (
        <div className="bg-dark-850 rounded-2xl border border-white/10 overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-lg font-semibold text-white">Progress Tracker</h2>
                    <p className="text-sm text-zinc-400">Acompanhamento semanal</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <button
                        onClick={() => setShowAllWeeks(!showAllWeeks)}
                        className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-medium bg-dark-900 text-zinc-400 hover:text-white border border-white/5 transition-colors"
                    >
                        {showAllWeeks ? 'Ver Recentes' : 'Ver Todos'}
                    </button>
                    <button
                        onClick={() => setIsConfiguring(!isConfiguring)}
                        className="p-2 hover:bg-white/5 rounded-lg text-zinc-400 hover:text-white transition-colors"
                    >
                        <Settings className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {isConfiguring && (
                <div className="p-6 bg-dark-900/50 border-b border-white/10 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {metrics.map((metric, index) => (
                        <div key={metric.id} className="flex gap-2">
                            <input
                                type="text"
                                value={metric.name}
                                onChange={(e) => {
                                    const newMetrics = [...metrics];
                                    newMetrics[index].name = e.target.value;
                                    setMetrics(newMetrics);
                                }}
                                className="flex-1 bg-dark-900 border border-white/10 rounded px-3 py-2 text-sm text-white"
                                placeholder="Nome da Métrica"
                            />
                            <input
                                type="text"
                                value={metric.unit}
                                onChange={(e) => {
                                    const newMetrics = [...metrics];
                                    newMetrics[index].unit = e.target.value;
                                    setMetrics(newMetrics);
                                }}
                                className="w-20 bg-dark-900 border border-white/10 rounded px-3 py-2 text-sm text-white"
                                placeholder="Unid."
                            />
                        </div>
                    ))}
                </div>
            )}

            <div className="overflow-x-auto max-w-full">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-zinc-400 uppercase bg-dark-900/50">
                        <tr>
                            <th className="px-6 py-3 font-medium">Semana</th>
                            {metrics.map(m => (
                                <th key={m.id} className="px-6 py-3 font-medium">{m.name} ({m.unit})</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {visibleWeeks.map((week) => {
                            const isCurrentWeek = week.weekNum === currentWeekNum;
                            return (
                                <tr key={week.weekNum} className={`hover:bg-white/5 transition-colors ${isCurrentWeek ? 'bg-indigo-500/5' : ''}`}>
                                    <td className="px-6 py-3 font-medium text-zinc-300 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className={isCurrentWeek ? 'text-indigo-400' : ''}>{week.label}</span>
                                            <span className="text-[10px] text-zinc-500">{week.dateLabel}</span>
                                        </div>
                                    </td>
                                    {metrics.map(metric => {
                                        const value = getWeeklyValue(week.weekNum, metric.id, metric.name);
                                        const delta = getDelta(week.weekNum, metric.id, metric.name, value);

                                        return (
                                            <td key={metric.id} className="px-6 py-3">
                                                <div className="relative flex items-center">
                                                    <input
                                                        type="number"
                                                        defaultValue={value}
                                                        onBlur={(e) => handleSaveValue(week.weekNum, metric.id, e.target.value)}
                                                        className="w-20 bg-transparent border border-transparent hover:border-white/10 focus:border-indigo-500 rounded px-2 py-1 text-white outline-none transition-all"
                                                        placeholder="-"
                                                    />
                                                    {delta && (
                                                        <delta.icon className={`h-3 w-3 ml-1 ${delta.color}`} />
                                                    )}
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
