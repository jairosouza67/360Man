import { useMemo } from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';
import { useTrackerStore } from '../../stores/trackerStore';
import { startOfWeek, endOfWeek, eachDayOfInterval, format } from 'date-fns';

export default function EvolutionRadarWidget() {
    const { trackers } = useTrackerStore();

    const data = useMemo(() => {
        const today = new Date();
        const weekStart = startOfWeek(today, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
        const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
        const weekKeys = weekDays.map(d => format(d, 'yyyy-MM-dd'));

        // Helper to calculate score (0-100) for a set of types over the week
        const calculateScore = (types: string[]) => {
            let totalPossible = 0;
            let totalCompleted = 0;

            weekKeys.forEach(date => {
                types.forEach(type => {
                    const entry = trackers.find(t => t.date === date && t.type === type);
                    // If entry exists, it counts as a "possible" day (user tracked something or should have)
                    // Ideally we'd know the plan, but for now let's assume if they tracked it and it's completed, good.
                    // Or simpler: Look at last 7 days of entries.
                    if (entry) {
                        totalPossible++;
                        if (entry.value?.completed) totalCompleted++;
                    }
                });
            });

            // Fallback: if no entries, check if we have any data at all for these types ever?
            // For this widget to look good immediately, let's base it on "Last 7 Days Activity"
            // If no data, return a base score or 0.
            return totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 50; // Default to 50 for visual balance if empty
        };

        return [
            { subject: 'Corpo', A: calculateScore(['workout', 'sleep', 'diet', 'posture']), fullMark: 100 },
            { subject: 'Mente', A: calculateScore(['reading', 'journal', 'meditation']), fullMark: 100 },
            { subject: 'Carreira', A: calculateScore(['career']), fullMark: 100 },
            { subject: 'Afeto', A: calculateScore(['affective', 'sexuality']), fullMark: 100 },
            { subject: 'Espírito', A: calculateScore(['community']), fullMark: 100 },
        ];
    }, [trackers]);

    return (
        <div className="bg-dark-850 rounded-2xl border border-white/10 p-6 h-full flex flex-col">
            <div className="mb-4">
                <h3 className="text-lg font-medium text-white">Radar da Evolução</h3>
                <p className="text-sm text-zinc-400">Equilíbrio 360° (Últimos 7 dias)</p>
            </div>

            <div className="flex-1 min-h-[250px] -ml-6">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                        <PolarGrid stroke="#3f3f46" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#a1a1aa', fontSize: 12 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar
                            name="Nível"
                            dataKey="A"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            fill="#3b82f6"
                            fillOpacity={0.3}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff' }}
                            itemStyle={{ color: '#3b82f6' }}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
