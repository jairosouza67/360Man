import { useState, useEffect } from 'react';
import { useTrackerStore } from '../stores/trackerStore';
import { useAuthStore } from '../stores/authStore';
import { Dumbbell, Utensils, Moon, Plus, CheckCircle, Calendar as CalendarIcon, Edit2 } from 'lucide-react';
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Corpo() {
  const { user } = useAuthStore();
  const { trackers, loadTrackers, saveTrackerValue } = useTrackerStore();
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Form states
  const [workoutType, setWorkoutType] = useState('');
  const [workoutDuration, setWorkoutDuration] = useState('');
  const [sleepHours, setSleepHours] = useState('');
  const [isEditingWorkout, setIsEditingWorkout] = useState(false);
  const [isEditingSleep, setIsEditingSleep] = useState(false);

  useEffect(() => {
    if (user) {
      loadTrackers(user.id);
    }
  }, [user, loadTrackers]);

  const dateKey = format(selectedDate, 'yyyy-MM-dd');

  // Get trackers for selected date
  const workoutTracker = trackers.find(t => t.date === dateKey && t.type === 'workout');
  const sleepTracker = trackers.find(t => t.date === dateKey && t.type === 'sleep');
  const dietTracker = trackers.find(t => t.date === dateKey && t.type === 'diet');

  const handleSaveWorkout = async () => {
    if (!user || !workoutType || !workoutDuration) return;

    await saveTrackerValue(user.id, dateKey, 'workout', {
      completed: true,
      type: workoutType,
      duration: parseInt(workoutDuration),
      timestamp: new Date().toISOString()
    });

    setWorkoutType('');
    setWorkoutDuration('');
    setIsEditingWorkout(false);
  };

  const handleEditWorkout = () => {
    if (workoutTracker?.value) {
      setWorkoutType(workoutTracker.value.type);
      setWorkoutDuration(workoutTracker.value.duration.toString());
      setIsEditingWorkout(true);
    }
  };

  const handleSaveSleep = async () => {
    if (!user || !sleepHours) return;

    await saveTrackerValue(user.id, dateKey, 'sleep', {
      completed: true,
      hours: parseFloat(sleepHours),
      timestamp: new Date().toISOString()
    });
    setSleepHours('');
    setIsEditingSleep(false);
  };

  const handleEditSleep = () => {
    if (sleepTracker?.value) {
      setSleepHours(sleepTracker.value.hours.toString());
      setIsEditingSleep(true);
    }
  };

  const handleSaveDiet = async (status: 'full' | 'partial' | 'none') => {
    if (!user) return;

    await saveTrackerValue(user.id, dateKey, 'diet', {
      completed: status !== 'none',
      status: status,
      timestamp: new Date().toISOString()
    });
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
          <h1 className="text-3xl font-bold text-white mb-2">Corpo & Vitalidade</h1>
          <p className="text-zinc-400">
            Monitore e otimize sua máquina biológica.
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Workout Section */}
        <div className="bg-dark-850 rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-6 border-b border-white/10 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <Dumbbell className="h-5 w-5 text-red-400" />
              </div>
              <h2 className="font-semibold text-white">Treino</h2>
            </div>
            {workoutTracker?.value?.completed && (
              <CheckCircle className="h-5 w-5 text-green-500" />
            )}
          </div>

          <div className="p-6">
            {workoutTracker?.value?.completed && !isEditingWorkout ? (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 mb-4">
                  <Dumbbell className="h-8 w-8 text-green-500" />
                </div>
                <h3 className="text-white font-medium mb-1">{workoutTracker.value.type}</h3>
                <p className="text-zinc-500">{workoutTracker.value.duration} minutos</p>
                <button
                  onClick={handleEditWorkout}
                  className="mt-4 text-xs text-zinc-600 hover:text-zinc-400 transition-colors flex items-center justify-center gap-1 mx-auto"
                >
                  <Edit2 className="h-3 w-3" />
                  <span>Editar</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Tipo de Treino</label>
                  <select
                    value={workoutType}
                    onChange={(e) => setWorkoutType(e.target.value)}
                    className="w-full bg-dark-900 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 outline-none transition-all"
                  >
                    <option value="">Selecione...</option>
                    <option value="Musculação">Musculação</option>
                    <option value="Cardio">Cardio</option>
                    <option value="HIIT">HIIT</option>
                    <option value="Yoga/Mobilidade">Yoga/Mobilidade</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Duração (minutos)</label>
                  <input
                    type="number"
                    value={workoutDuration}
                    onChange={(e) => setWorkoutDuration(e.target.value)}
                    className="w-full bg-dark-900 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 outline-none transition-all"
                    placeholder="Ex: 45"
                  />
                </div>

                <button
                  onClick={handleSaveWorkout}
                  disabled={!workoutType || !workoutDuration}
                  className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition-all flex items-center justify-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Registrar Treino</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Diet Section */}
        <div className="bg-dark-850 rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-6 border-b border-white/10 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Utensils className="h-5 w-5 text-green-400" />
              </div>
              <h2 className="font-semibold text-white">Nutrição</h2>
            </div>
            {dietTracker?.value?.completed && (
              <CheckCircle className="h-5 w-5 text-green-500" />
            )}
          </div>

          <div className="p-6">
            <p className="text-zinc-400 text-sm mb-6">
              Como foi sua alimentação hoje em relação ao planejado?
            </p>

            <div className="space-y-3">
              <button
                onClick={() => handleSaveDiet('full')}
                className={`w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between ${dietTracker?.value?.status === 'full'
                  ? 'bg-green-500/10 border-green-500/50 text-white'
                  : 'bg-dark-900 border-white/5 text-zinc-400 hover:bg-dark-800'
                  }`}
              >
                <span>100% Limpo</span>
                {dietTracker?.value?.status === 'full' && <CheckCircle className="h-4 w-4 text-green-500" />}
              </button>

              <button
                onClick={() => handleSaveDiet('partial')}
                className={`w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between ${dietTracker?.value?.status === 'partial'
                  ? 'bg-yellow-500/10 border-yellow-500/50 text-white'
                  : 'bg-dark-900 border-white/5 text-zinc-400 hover:bg-dark-800'
                  }`}
              >
                <span>Parcial / Deslize Leve</span>
                {dietTracker?.value?.status === 'partial' && <CheckCircle className="h-4 w-4 text-yellow-500" />}
              </button>

              <button
                onClick={() => handleSaveDiet('none')}
                className={`w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between ${dietTracker?.value?.status === 'none'
                  ? 'bg-red-500/10 border-red-500/50 text-white'
                  : 'bg-dark-900 border-white/5 text-zinc-400 hover:bg-dark-800'
                  }`}
              >
                <span>Fora do Plano</span>
                {dietTracker?.value?.status === 'none' && <CheckCircle className="h-4 w-4 text-red-500" />}
              </button>
            </div>
          </div>
        </div>

        {/* Sleep Section */}
        <div className="bg-dark-850 rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-6 border-b border-white/10 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-500/10 rounded-lg">
                <Moon className="h-5 w-5 text-indigo-400" />
              </div>
              <h2 className="font-semibold text-white">Sono</h2>
            </div>
            {sleepTracker?.value?.completed && (
              <CheckCircle className="h-5 w-5 text-green-500" />
            )}
          </div>

          <div className="p-6">
            {sleepTracker?.value?.completed && !isEditingSleep ? (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-500/10 mb-4">
                  <Moon className="h-8 w-8 text-indigo-500" />
                </div>
                <h3 className="text-white font-medium mb-1">{sleepTracker.value.hours} horas</h3>
                <p className="text-zinc-500">Registrado</p>
                <button
                  onClick={handleEditSleep}
                  className="mt-4 text-xs text-zinc-600 hover:text-zinc-400 transition-colors flex items-center justify-center gap-1 mx-auto"
                >
                  <Edit2 className="h-3 w-3" />
                  <span>Editar</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Horas de Sono</label>
                  <input
                    type="number"
                    step="0.5"
                    value={sleepHours}
                    onChange={(e) => setSleepHours(e.target.value)}
                    className="w-full bg-dark-900 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none transition-all"
                    placeholder="Ex: 7.5"
                  />
                </div>

                <button
                  onClick={handleSaveSleep}
                  disabled={!sleepHours}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition-all flex items-center justify-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Registrar Sono</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Weekly Stats */}
      <div className="bg-dark-850 rounded-2xl border border-white/10 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-white">Consistência Semanal</h3>
          <div className="flex items-center space-x-2 text-sm text-zinc-500">
            <CalendarIcon className="h-4 w-4" />
            <span>{format(weekStart, 'dd/MM')} - {format(weekEnd, 'dd/MM')}</span>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {weekDays.map(day => {
            const dayKey = format(day, 'yyyy-MM-dd');
            const dayWorkout = trackers.find(t => t.date === dayKey && t.type === 'workout');
            const isToday = isSameDay(day, new Date());

            return (
              <div key={dayKey} className="flex flex-col items-center space-y-2">
                <span className={`text-xs ${isToday ? 'text-white font-bold' : 'text-zinc-500'}`}>
                  {format(day, 'EEE', { locale: ptBR }).slice(0, 3)}
                </span>
                <div className={`w-full aspect-square rounded-lg flex items-center justify-center border transition-all ${dayWorkout?.value?.completed
                  ? 'bg-red-500/20 border-red-500/50 text-red-400'
                  : 'bg-dark-900 border-white/5 text-zinc-700'
                  }`}>
                  {dayWorkout?.value?.completed && <Dumbbell className="h-4 w-4" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
