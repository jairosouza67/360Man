import { useState, useEffect } from 'react';
import { useTrackerStore } from '../stores/trackerStore';
import { useAuthStore } from '../stores/authStore';
import { Flame, Zap, Plus, CheckCircle, Calendar as CalendarIcon, Edit2 } from 'lucide-react';
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Sexualidade() {
  const { user } = useAuthStore();
  const { trackers, loadTrackers, saveTrackerValue } = useTrackerStore();
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Form states
  const [practiceType, setPracticeType] = useState('');
  const [isEditingPractice, setIsEditingPractice] = useState(false);

  useEffect(() => {
    if (user) {
      loadTrackers(user.id);
    }
  }, [user, loadTrackers]);

  const dateKey = format(selectedDate, 'yyyy-MM-dd');

  // Get trackers for selected date
  const sexualityTracker = trackers.find(t => t.date === dateKey && t.type === 'sexuality');

  const handleSaveEnergy = async (level: number) => {
    if (!user) return;

    const currentPractice = sexualityTracker?.value?.practice || '';

    await saveTrackerValue(user.id, dateKey, 'sexuality', {
      completed: true,
      energyLevel: level,
      practice: currentPractice,
      timestamp: new Date().toISOString()
    });
  };

  const handleSavePractice = async () => {
    if (!user || !practiceType) return;

    const currentEnergy = sexualityTracker?.value?.energyLevel || 0;

    await saveTrackerValue(user.id, dateKey, 'sexuality', {
      completed: true,
      energyLevel: currentEnergy,
      practice: practiceType,
      timestamp: new Date().toISOString()
    });
    setPracticeType('');
    setIsEditingPractice(false);
  };

  const handleEditPractice = () => {
    if (sexualityTracker?.value?.practice) {
      setPracticeType(sexualityTracker.value.practice);
      setIsEditingPractice(true);
    }
  };

  // Weekly progress
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Sexualidade & Energia</h1>
          <p className="text-zinc-400">
            Transmute sua energia vital para criar e realizar.
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center space-x-2 bg-dark-850 p-1 rounded-lg border border-white/10">
          {[-2, -1, 0].map(offset => {
            const date = subDays(new Date(), Math.abs(offset));
            const isSelected = isSameDay(date, selectedDate);
            return (
              <button
                key={offset}
                onClick={() => setSelectedDate(date)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${isSelected
                  ? 'bg-dark-700 text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-300'
                  }`}
              >
                {offset === 0 ? 'Hoje' : format(date, 'dd/MM')}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Energy Level Section */}
        <div className="bg-dark-850 rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-6 border-b border-white/10 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Zap className="h-5 w-5 text-purple-400" />
              </div>
              <h2 className="font-semibold text-white">Nível de Energia Vital</h2>
            </div>
            {(sexualityTracker?.value?.energyLevel || 0) > 0 && (
              <div className="flex items-center space-x-1 text-purple-500">
                <span className="font-bold text-lg">{sexualityTracker?.value?.energyLevel}</span>
                <span className="text-xs">/10</span>
              </div>
            )}
          </div>

          <div className="p-6">
            <p className="text-zinc-400 text-sm mb-6 text-center">
              Como está sua vitalidade hoje? (1-10)
            </p>

            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => {
                const isSelected = sexualityTracker?.value?.energyLevel === num;
                return (
                  <button
                    key={num}
                    onClick={() => handleSaveEnergy(num)}
                    className={`aspect-square rounded-lg font-medium transition-all ${isSelected
                      ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30'
                      : 'bg-dark-900 text-zinc-500 hover:bg-dark-800 hover:text-purple-400'
                      }`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Practice Log Section */}
        <div className="bg-dark-850 rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-6 border-b border-white/10 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <Flame className="h-5 w-5 text-red-400" />
              </div>
              <h2 className="font-semibold text-white">Prática / Transmutação</h2>
            </div>
            {sexualityTracker?.value?.practice && (
              <CheckCircle className="h-5 w-5 text-green-500" />
            )}
          </div>

          <div className="p-6">
            {sexualityTracker?.value?.practice && !isEditingPractice ? (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 mb-4">
                  <Flame className="h-8 w-8 text-red-500" />
                </div>
                <h3 className="text-white font-medium mb-1">Prática Registrada</h3>
                <p className="text-zinc-500">{sexualityTracker.value.practice}</p>
                <button
                  onClick={handleEditPractice}
                  className="mt-4 text-xs text-zinc-600 hover:text-zinc-400 transition-colors flex items-center justify-center gap-1 mx-auto"
                >
                  <Edit2 className="h-3 w-3" />
                  <span>Editar</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Tipo de Prática</label>
                  <select
                    value={practiceType}
                    onChange={(e) => setPracticeType(e.target.value)}
                    className="w-full bg-dark-900 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 outline-none transition-all"
                  >
                    <option value="">Selecione...</option>
                    <option value="Transmutação (Trabalho/Criatividade)">Transmutação (Trabalho/Criatividade)</option>
                    <option value="Retenção Seminal">Retenção Seminal</option>
                    <option value="Exercícios de Kegel">Exercícios de Kegel</option>
                    <option value="Conexão Íntima">Conexão Íntima</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>

                <button
                  onClick={handleSavePractice}
                  disabled={!practiceType}
                  className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition-all flex items-center justify-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Registrar</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Weekly Stats */}
      <div className="bg-dark-850 rounded-2xl border border-white/10 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-white">Consistência</h3>
          <div className="flex items-center space-x-2 text-sm text-zinc-500">
            <CalendarIcon className="h-4 w-4" />
            <span>{format(weekStart, 'dd/MM')} - {format(weekEnd, 'dd/MM')}</span>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {weekDays.map(day => {
            const dayKey = format(day, 'yyyy-MM-dd');
            const dayTracker = trackers.find(t => t.date === dayKey && t.type === 'sexuality');
            const isToday = isSameDay(day, new Date());
            const hasActivity = (dayTracker?.value?.energyLevel || 0) > 0 || dayTracker?.value?.practice;

            return (
              <div key={dayKey} className="flex flex-col items-center space-y-2">
                <span className={`text-xs ${isToday ? 'text-white font-bold' : 'text-zinc-500'}`}>
                  {format(day, 'EEE', { locale: ptBR }).slice(0, 3)}
                </span>
                <div className={`w-full aspect-square rounded-lg flex items-center justify-center border transition-all ${hasActivity
                  ? 'bg-purple-500/20 border-purple-500/50 text-purple-400'
                  : 'bg-dark-900 border-white/5 text-zinc-700'
                  }`}>
                  {hasActivity && <Zap className="h-4 w-4" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
