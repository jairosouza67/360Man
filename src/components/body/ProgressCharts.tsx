import { useState, useMemo } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { format } from 'date-fns';
import { TrackerEntry } from '../../stores/trackerStore';
import { TrendingUp, Activity } from 'lucide-react';

interface ProgressChartsProps {
    measurements: TrackerEntry[];
}

type MetricKey = 'weight' | 'bodyFat' | 'waist' | 'chest' | 'bicepsR' | 'thighR' | 'neck' | 'hips' | 'calfR';

const METRICS: { key: MetricKey; label: string; color: string; unit: string }[] = [
    { key: 'weight', label: 'Peso', color: '#ef4444', unit: 'kg' },
    { key: 'bodyFat', label: '% Gordura', color: '#f59e0b', unit: '%' },
    { key: 'waist', label: 'Cintura', color: '#10b981', unit: 'cm' },
    { key: 'chest', label: 'Peitoral', color: '#6366f1', unit: 'cm' },
    { key: 'bicepsR', label: 'Bíceps', color: '#8b5cf6', unit: 'cm' },
    { key: 'thighR', label: 'Coxa', color: '#ec4899', unit: 'cm' },
    { key: 'neck', label: 'Pescoço', color: '#06b6d4', unit: 'cm' },
    { key: 'hips', label: 'Quadril', color: '#d946ef', unit: 'cm' },
    { key: 'calfR', label: 'Panturrilha', color: '#f97316', unit: 'cm' },
];

export function ProgressCharts({ measurements }: ProgressChartsProps) {
    const [selectedMetric, setSelectedMetric] = useState<MetricKey>('weight');

    const chartData = useMemo(() => {
        return measurements
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map(m => ({
                date: m.date,
                displayDate: format(new Date(m.date), 'dd/MM'),
                [selectedMetric]: m.value[selectedMetric] || 0
            }));
    }, [measurements, selectedMetric]);

    const currentMetric = METRICS.find(m => m.key === selectedMetric)!;

    return (
        <div className="bg-dark-850 rounded-2xl border border-white/10 overflow-hidden">
            <div className="p-6 border-b border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-500/10 rounded-lg">
                        <TrendingUp className="h-5 w-5 text-red-400" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-white">Progresso</h2>
                        <p className="text-xs text-zinc-400">Visualize sua evolução temporal</p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    {METRICS.map((metric) => (
                        <button
                            key={metric.key}
                            onClick={() => setSelectedMetric(metric.key)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${selectedMetric === metric.key
                                ? `bg-${metric.color.replace('#', '')}/10 border-${metric.color.replace('#', '')}/50 text-white`
                                : 'bg-dark-900 border-white/5 text-zinc-500 hover:text-zinc-300 hover:bg-dark-800'
                                }`}
                            style={{
                                borderColor: selectedMetric === metric.key ? metric.color : undefined,
                                color: selectedMetric === metric.key ? metric.color : undefined,
                                backgroundColor: selectedMetric === metric.key ? `${metric.color}20` : undefined
                            }}
                        >
                            {metric.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-6 h-[300px] w-full">
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={currentMetric.color} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={currentMetric.color} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                            <XAxis
                                dataKey="displayDate"
                                stroke="#71717a"
                                tick={{ fontSize: 12 }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#71717a"
                                tick={{ fontSize: 12 }}
                                tickLine={false}
                                axisLine={false}
                                domain={['auto', 'auto']}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#18181b',
                                    borderColor: '#27272a',
                                    borderRadius: '8px',
                                    color: '#fff'
                                }}
                                itemStyle={{ color: currentMetric.color }}
                            />
                            <Area
                                type="monotone"
                                dataKey={selectedMetric}
                                stroke={currentMetric.color}
                                fillOpacity={1}
                                fill="url(#colorMetric)"
                                strokeWidth={2}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-500">
                        <Activity className="h-12 w-12 mb-4 opacity-20" />
                        <p>Insira dados para visualizar o gráfico</p>
                    </div>
                )}
            </div>
        </div>
    );
}
