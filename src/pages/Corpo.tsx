import { useState, useEffect } from 'react';
import { useTrackerStore } from '../stores/trackerStore';
import { useAuthStore } from '../stores/authStore';
import { Dumbbell, Utensils, Moon, Plus, CheckCircle, Edit2, Droplets } from 'lucide-react';
import { format, subDays, isSameDay } from 'date-fns';
import { EvolutionGallery } from '../components/body/EvolutionGallery';
import { MeasurementLog } from '../components/body/MeasurementLog';
import { HabitTracker } from '../components/body/HabitTracker';
import { GoalManager } from '../components/body/GoalManager';
import { WeeklyProgress } from '../components/body/WeeklyProgress';

export default function Corpo() {
  const { user } = useAuthStore();
  const {
    trackers,
    habits,
    loadTrackers,
    loadHabits,
    loadGoals,
    saveTrackerValue,
  } = useTrackerStore();
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Form states
  const [workoutType, setWorkoutType] = useState('');
  const [workoutDuration, setWorkoutDuration] = useState('');
  const [sleepHours, setSleepHours] = useState('');
  const [waterIntake, setWaterIntake] = useState('');
  const [isEditingWorkout, setIsEditingWorkout] = useState(false);
  const [isEditingSleep, setIsEditingSleep] = useState(false);
  const [isEditingWater, setIsEditingWater] = useState(false);

  useEffect(() => {
    if (user) {
      loadTrackers(user.id);
      loadHabits(user.id);
      loadGoals(user.id);
    }
  }, [user, loadTrackers, loadHabits, loadGoals]);

  const dateKey = format(selectedDate, 'yyyy-MM-dd');

  // Get trackers for selected date
  const workoutTracker = trackers.find(t => t.date === dateKey && t.type === 'workout');
  const sleepTracker = trackers.find(t => t.date === dateKey && t.type === 'sleep');
  const dietTracker = trackers.find(t => t.date === dateKey && t.type === 'diet');
  const waterTracker = trackers.find(t => t.date === dateKey && t.type === 'water');

  // Get specialized trackers
  const photoTrackers = trackers.filter(t => t.type === 'body_photo');
  const measurementTrackers = trackers.filter(t => t.type === 'body_measurement');

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

  const handleSaveWater = async () => {
    if (!user || !waterIntake) return;

    await saveTrackerValue(user.id, dateKey, 'water', {
      completed: true,
      amount: parseInt(waterIntake),
      timestamp: new Date().toISOString()
    });
    setWaterIntake('');
    setIsEditingWater(false);
  };

  const handleEditWater = () => {
    if (waterTracker?.value) {
      setWaterIntake(waterTracker.value.amount.toString());
      setIsEditingWater(true);
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

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Corpo & Vitalidade</h1>
          <p className="text-zinc-400">
            Monitore e otimize sua máquina biológica.
          </p>
        </div>
      </div>

      {/* Top Section: Gallery & Measurements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <EvolutionGallery photos={photoTrackers} />
        <MeasurementLog measurements={measurementTrackers} />
      </div>



      {/* Strategy Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <h2 className="text-2xl font-bold text-white">Estratégia Diária</h2>
          <div className="h-px flex-1 bg-white/10"></div>
        </div>

        {/* Date Selector */}
        <div className="flex justify-end">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
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
                <div className="text-center py-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-500/10 mb-3">
                    <Dumbbell className="h-6 w-6 text-green-500" />
                  </div>
                  <h3 className="text-white font-medium mb-1">{workoutTracker.value.type}</h3>
                  <p className="text-zinc-500 text-sm">{workoutTracker.value.duration} min</p>
                  <button
                    onClick={handleEditWorkout}
                    className="mt-3 text-xs text-zinc-600 hover:text-zinc-400 transition-colors flex items-center justify-center gap-1 mx-auto"
                  >
                    <Edit2 className="h-3 w-3" />
                    <span>Editar</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1">Tipo</label>
                    <select
                      value={workoutType}
                      onChange={(e) => setWorkoutType(e.target.value)}
                      className="w-full bg-dark-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-red-500 outline-none"
                    >
                      <option value="">Selecione...</option>
                      <option value="Musculação">Musculação</option>
                      <option value="Cardio">Cardio</option>
                      <option value="HIIT">HIIT</option>
                      <option value="Yoga/Mobilidade">Yoga/Mobilidade</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1">Minutos</label>
                    <input
                      type="number"
                      value={workoutDuration}
                      onChange={(e) => setWorkoutDuration(e.target.value)}
                      className="w-full bg-dark-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-red-500 outline-none"
                      placeholder="Ex: 45"
                    />
                  </div>

                  <button
                    onClick={handleSaveWorkout}
                    disabled={!workoutType || !workoutDuration}
                    className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2 rounded-lg transition-all flex items-center justify-center space-x-2 text-sm"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Salvar</span>
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
                <h2 className="font-semibold text-white">Dieta</h2>
              </div>
              {dietTracker?.value?.completed && (
                <CheckCircle className="h-5 w-5 text-green-500" />
              )}
            </div>

            <div className="p-6">
              <p className="text-zinc-400 text-xs mb-4">
                Aderência ao plano hoje:
              </p>

              <div className="space-y-2">
                <button
                  onClick={() => handleSaveDiet('full')}
                  className={`w-full p-3 rounded-lg border text-left transition-all flex items-center justify-between text-sm ${dietTracker?.value?.status === 'full'
                    ? 'bg-green-500/10 border-green-500/50 text-white'
                    : 'bg-dark-900 border-white/5 text-zinc-400 hover:bg-dark-800'
                    }`}
                >
                  <span>100% Limpo</span>
                  {dietTracker?.value?.status === 'full' && <CheckCircle className="h-4 w-4 text-green-500" />}
                </button>

                <button
                  onClick={() => handleSaveDiet('partial')}
                  className={`w-full p-3 rounded-lg border text-left transition-all flex items-center justify-between text-sm ${dietTracker?.value?.status === 'partial'
                    ? 'bg-yellow-500/10 border-yellow-500/50 text-white'
                    : 'bg-dark-900 border-white/5 text-zinc-400 hover:bg-dark-800'
                    }`}
                >
                  <span>Parcial</span>
                  {dietTracker?.value?.status === 'partial' && <CheckCircle className="h-4 w-4 text-yellow-500" />}
                </button>

                <button
                  onClick={() => handleSaveDiet('none')}
                  className={`w-full p-3 rounded-lg border text-left transition-all flex items-center justify-between text-sm ${dietTracker?.value?.status === 'none'
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
                <div className="text-center py-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-500/10 mb-3">
                    <Moon className="h-6 w-6 text-indigo-500" />
                  </div>
                  <h3 className="text-white font-medium mb-1">{sleepTracker.value.hours}h</h3>
                  <p className="text-zinc-500 text-sm">Registrado</p>
                  <button
                    onClick={handleEditSleep}
                    className="mt-3 text-xs text-zinc-600 hover:text-zinc-400 transition-colors flex items-center justify-center gap-1 mx-auto"
                  >
                    <Edit2 className="h-3 w-3" />
                    <span>Editar</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1">Horas</label>
                    <input
                      type="number"
                      step="0.5"
                      value={sleepHours}
                      onChange={(e) => setSleepHours(e.target.value)}
                      className="w-full bg-dark-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                      placeholder="Ex: 7.5"
                    />
                  </div>

                  <button
                    onClick={handleSaveSleep}
                    disabled={!sleepHours}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2 rounded-lg transition-all flex items-center justify-center space-x-2 text-sm"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Salvar</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Water Section */}
          <div className="bg-dark-850 rounded-2xl border border-white/10 overflow-hidden">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Droplets className="h-5 w-5 text-blue-400" />
                </div>
                <h2 className="font-semibold text-white">Água</h2>
              </div>
              {waterTracker?.value?.completed && (
                <CheckCircle className="h-5 w-5 text-green-500" />
              )}
            </div>

            <div className="p-6">
              {waterTracker?.value?.completed && !isEditingWater ? (
                <div className="text-center py-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/10 mb-3">
                    <Droplets className="h-6 w-6 text-blue-500" />
                  </div>
                  <h3 className="text-white font-medium mb-1">{waterTracker.value.amount}ml</h3>
                  <p className="text-zinc-500 text-sm">Registrado</p>
                  <button
                    onClick={handleEditWater}
                    className="mt-3 text-xs text-zinc-600 hover:text-zinc-400 transition-colors flex items-center justify-center gap-1 mx-auto"
                  >
                    <Edit2 className="h-3 w-3" />
                    <span>Editar</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1">Quantidade (ml)</label>
                    <input
                      type="number"
                      step="100"
                      value={waterIntake}
                      onChange={(e) => setWaterIntake(e.target.value)}
                      className="w-full bg-dark-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none"
                      placeholder="Ex: 3000"
                    />
                  </div>

                  <button
                    onClick={handleSaveWater}
                    disabled={!waterIntake}
                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2 rounded-lg transition-all flex items-center justify-center space-x-2 text-sm"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Salvar</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Goals & Habits */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <GoalManager />
          <HabitTracker
            habits={habits}
            logs={trackers.filter(t => t.type === 'habit_log')}
          />
        </div>
      </div>

      {/* Weekly Progress */}
      <WeeklyProgress trackers={trackers} />
    </div>
  );
}
