import { useState } from 'react';
import { Ruler, Activity, Scale, ArrowDown, ArrowUp, Minus, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useTrackerStore, TrackerEntry } from '../../stores/trackerStore';
import { format } from 'date-fns';

interface MeasurementLogProps {
    measurements: TrackerEntry[];
}

type UnitSystem = 'metric' | 'imperial';

interface MeasurementData {
    height: string;
    gender: 'male' | 'female';
    weight: string;
    bodyFat: string;
    neck: string;
    chest: string;
    bicepsL: string;
    bicepsR: string;
    waist: string;
    hips: string;
    thighL: string;
    thighR: string;
    calfL: string;
    calfR: string;
}

const INITIAL_DATA: MeasurementData = {
    height: '',
    gender: 'male',
    weight: '',
    bodyFat: '',
    neck: '',
    chest: '',
    bicepsL: '',
    bicepsR: '',
    waist: '',
    hips: '',
    thighL: '',
    thighR: '',
    calfL: '',
    calfR: ''
};

export function MeasurementLog({ measurements }: MeasurementLogProps) {
    const { user } = useAuthStore();
    const { createTracker } = useTrackerStore();
    const [unitSystem, setUnitSystem] = useState<UnitSystem>('metric');
    const [formData, setFormData] = useState<MeasurementData>(INITIAL_DATA);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Get latest measurement for delta calculation
    const latestMeasurement = measurements.sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0];

    // Auto-collapse logic
    const hasRecentMeasurement = latestMeasurement &&
        (new Date().getTime() - new Date(latestMeasurement.date).getTime() < 7 * 24 * 60 * 60 * 1000);

    const [isCollapsed, setIsCollapsed] = useState(!!hasRecentMeasurement);

    const calculateBMI = (weight: number, heightCm: number) => {
        if (!heightCm) return '0.0';
        const heightM = heightCm / 100;
        return (weight / (heightM * heightM)).toFixed(1);
    };

    const calculateBodyFat = (data: MeasurementData) => {
        const waist = parseFloat(data.waist);
        const neck = parseFloat(data.neck);
        const height = parseFloat(data.height);
        const hips = parseFloat(data.hips);

        if (!waist || !neck || !height) return '';

        if (data.gender === 'male') {
            // Men: 495 / (1.0324 - 0.19077 * log10(waist - neck) + 0.1554 * log10(height)) - 450
            if (waist - neck <= 0) return '';
            const bodyFat = 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.1554 * Math.log10(height)) - 450;
            return bodyFat > 0 ? bodyFat.toFixed(1) : '';
        } else {
            // Women: 495 / (1.29579 - 0.35004 * log10(waist + hip - neck) + 0.22100 * log10(height)) - 450
            if (!hips || waist + hips - neck <= 0) return '';
            const bodyFat = 495 / (1.29579 - 0.35004 * Math.log10(waist + hips - neck) + 0.22100 * Math.log10(height)) - 450;
            return bodyFat > 0 ? bodyFat.toFixed(1) : '';
        }
    };

    // Auto-calculate body fat when relevant fields change
    const handleInputChange = (field: keyof MeasurementData, value: string) => {
        const newData = { ...formData, [field]: value };

        // If changing relevant fields, try to calculate body fat
        if (['waist', 'neck', 'hips', 'height', 'gender'].includes(field)) {
            const calculatedFat = calculateBodyFat(newData);
            if (calculatedFat) {
                newData.bodyFat = calculatedFat;
            }
        }

        setFormData(newData);
    };

    const getDelta = (currentValue: string, field: keyof MeasurementData) => {
        if (!latestMeasurement || !currentValue) return null;

        // Handle nested value access safely
        const previous = latestMeasurement.value && typeof latestMeasurement.value === 'object'
            ? (latestMeasurement.value as any)[field]
            : undefined;

        const current = parseFloat(currentValue);

        if (!previous || isNaN(current)) return null;

        const diff = current - parseFloat(previous);
        if (Math.abs(diff) < 0.1) return { icon: Minus, color: 'text-zinc-500', value: '0.0' };

        return {
            icon: diff > 0 ? ArrowUp : ArrowDown,
            color: diff > 0 ? 'text-red-400' : 'text-green-400', // Context dependent colors? For weight loss green is down
            value: Math.abs(diff).toFixed(1)
        };
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        try {
            setIsSubmitting(true);

            // Convert strings to numbers
            const numericData = Object.entries(formData).reduce((acc, [key, value]) => ({
                ...acc,
                [key]: value ? parseFloat(value) : 0
            }), {});

            await createTracker({
                userId: user.id,
                type: 'body_measurement',
                date: format(new Date(), 'yyyy-MM-dd'),
                value: {
                    ...numericData,
                    unit: unitSystem
                }
            });

            setFormData(INITIAL_DATA);
            setIsCollapsed(true); // Auto collapse after save
        } catch (error) {
            console.error('Error saving measurements:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderInput = (label: string, field: keyof MeasurementData, icon?: React.ReactNode) => {
        const delta = getDelta(formData[field], field);
        const unit = field === 'weight'
            ? (unitSystem === 'metric' ? 'kg' : 'lbs')
            : field === 'bodyFat'
                ? '%'
                : (unitSystem === 'metric' ? 'cm' : 'in');

        return (
            <div className="space-y-1">
                <label className="text-xs text-zinc-400 flex justify-between">
                    <span>{label}</span>
                    {delta && (
                        <span className={`flex items-center gap-0.5 ${delta.color} text-[10px]`}>
                            <delta.icon className="h-3 w-3" />
                            {delta.value}
                        </span>
                    )}
                </label>
                <div className="relative">
                    <input
                        type="number"
                        step="0.1"
                        value={formData[field]}
                        onChange={(e) => handleInputChange(field, e.target.value)}
                        className="w-full bg-dark-900 border border-white/10 rounded-lg pl-3 pr-8 py-2 text-sm text-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                        placeholder="0.0"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 flex items-center gap-2">
                        {unit}
                        {icon && <span className="text-zinc-600">{icon}</span>}
                    </span>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-dark-850 rounded-2xl border border-white/10 overflow-hidden">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/10 rounded-lg">
                        <Ruler className="h-5 w-5 text-indigo-400" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-white">Log de Medidas</h2>
                        <p className="text-xs text-zinc-400">Atualize seus dados biométricos</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex bg-dark-900 rounded-lg p-1 border border-white/5">
                        <button
                            onClick={() => setUnitSystem('metric')}
                            className={`px-3 py-1 rounded text-xs font-medium transition-all ${unitSystem === 'metric' ? 'bg-dark-700 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
                                }`}
                        >
                            Métrico
                        </button>
                        <button
                            onClick={() => setUnitSystem('imperial')}
                            className={`px-3 py-1 rounded text-xs font-medium transition-all ${unitSystem === 'imperial' ? 'bg-dark-700 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
                                }`}
                        >
                            Imperial
                        </button>
                    </div>
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="p-1.5 hover:bg-white/5 rounded-lg text-zinc-400 hover:text-white transition-colors"
                    >
                        {isCollapsed ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
                    </button>
                </div>
            </div>

            {!isCollapsed && (
                <form onSubmit={handleSubmit} className="p-6 space-y-6 animate-in slide-in-from-top-2 duration-300">
                    {/* Main Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs text-zinc-400">Gênero</label>
                                <div className="flex bg-dark-900 rounded-lg p-1 border border-white/10">
                                    <button
                                        type="button"
                                        onClick={() => handleInputChange('gender', 'male')}
                                        className={`flex-1 py-2 rounded text-sm font-medium transition-all ${formData.gender === 'male' ? 'bg-indigo-600 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                                    >
                                        Masculino
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleInputChange('gender', 'female')}
                                        className={`flex-1 py-2 rounded text-sm font-medium transition-all ${formData.gender === 'female' ? 'bg-indigo-600 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                                    >
                                        Feminino
                                    </button>
                                </div>
                            </div>
                            {renderInput('Altura', 'height', <Ruler className="h-4 w-4" />)}
                        </div>
                        <div className="space-y-4">
                            {renderInput('Peso Corporal', 'weight', <Scale className="h-4 w-4" />)}
                            {formData.weight && formData.height && (
                                <div className="text-xs text-zinc-500 flex justify-between px-1">
                                    <span>IMC Estimado:</span>
                                    <span className="text-white font-medium">{calculateBMI(parseFloat(formData.weight), parseFloat(formData.height))}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1">
                        {renderInput('% Gordura (Auto-calculado)', 'bodyFat', <Activity className="h-4 w-4" />)}
                    </div>

                    {/* Perimeters */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Perímetros</h3>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {renderInput('Pescoço', 'neck')}
                            {renderInput('Peitoral', 'chest')}
                            {renderInput('Cintura', 'waist')}
                            {renderInput('Quadril', 'hips')}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {renderInput('Bíceps Esq.', 'bicepsL')}
                            {renderInput('Bíceps Dir.', 'bicepsR')}
                            {renderInput('Coxa Esq.', 'thighL')}
                            {renderInput('Coxa Dir.', 'thighR')}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {renderInput('Panturrilha E.', 'calfL')}
                            {renderInput('Panturrilha D.', 'calfR')}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isSubmitting ? 'Salvando...' : 'Salvar Medidas'}
                    </button>
                </form>
            )}

            {/* History Section */}
            <div className="border-t border-white/10">
                <div className="p-4 bg-dark-900/30">
                    <h3 className="text-sm font-medium text-zinc-400 mb-3">Histórico Recente</h3>
                    <div className="space-y-2">
                        {measurements
                            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                            .slice(0, 5)
                            .map((entry) => (
                                <div key={entry.id} className="flex items-center justify-between p-3 bg-dark-900 rounded-lg border border-white/5 text-sm">
                                    <div className="flex items-center gap-3">
                                        <span className="text-zinc-500 font-mono text-xs">
                                            {format(new Date(entry.date), 'dd/MM/yyyy')}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-zinc-300">
                                        {entry.value.weight && (
                                            <span className="flex items-center gap-1">
                                                <Scale className="h-3 w-3 text-zinc-500" />
                                                {entry.value.weight}kg
                                            </span>
                                        )}
                                        {entry.value.bodyFat && (
                                            <span className="flex items-center gap-1">
                                                <Activity className="h-3 w-3 text-zinc-500" />
                                                {entry.value.bodyFat}%
                                            </span>
                                        )}
                                        {entry.value.waist && (
                                            <span className="flex items-center gap-1">
                                                <Ruler className="h-3 w-3 text-zinc-500" />
                                                {entry.value.waist}cm
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
