import { useState, useEffect } from 'react';
import { useTrackerStore } from '../stores/trackerStore';
import { useAuthStore } from '../stores/authStore';
import { User, Activity, Plus, CheckCircle, Calendar as CalendarIcon, ArrowUp, Edit2 } from 'lucide-react';
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Postura() {
  const { user } = useAuthStore();
  const { trackers, loadTrackers, saveTrackerValue } = useTrackerStore();
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Form states
  const [stretchingDuration, setStretchingDuration] = useState('');
  const [isEditingStretching, setIsEditingStretching] = useState(false);

  useEffect(() => {
    if (user) {
      loadTrackers(user.id);
    }
  }, [user, loadTrackers]);

  const dateKey = format(selectedDate, 'yyyy-MM-dd');

  // Get trackers for selected date
  const postureTracker = trackers.find(t => t.date === dateKey && t.type === 'posture');

  const handleAddCheck = async () => {
    if (!user) return;

    const currentChecks = postureTracker?.value?.checks || 0;
    const currentDuration = postureTracker?.value?.stretchingDuration || 0;

    await saveTrackerValue(user.id, dateKey, 'posture', {
      completed: true,
      checks: currentChecks + 1,
      stretchingDuration: currentDuration,
      timestamp: new Date().toISOString()
    });
  };

  const handleSaveStretching = async () => {
    if (!user || !stretchingDuration) return;

    const currentChecks = postureTracker?.value?.checks || 0;

    await saveTrackerValue(user.id, dateKey, 'posture', {
      completed: true,
      checks: currentChecks,
      stretchingDuration: parseInt(stretchingDuration),
      timestamp: new Date().toISOString()
    });
    setStretchingDuration('');
    setIsEditingStretching(false);
  };

  const handleEditStretching = () => {
    if (postureTracker?.value?.stretchingDuration) {
      setStretchingDuration(postureTracker.value.stretchingDuration.toString());
      setIsEditingStretching(true);
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
          <h1 className="text-3xl font-bold text-white mb-2">Postura & Presença</h1>
          <p className="text-zinc-400">
            Sua linguagem corporal define sua realidade.
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
        {/* Posture Check Section */}
        <div className="bg-dark-850 rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-6 border-b border-white/10 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <User className="h-5 w-5 text-amber-400" />
              </div>
              <h2 className="font-semibold text-white">Check de Postura</h2>
            </div>
            {(postureTracker?.value?.checks || 0) > 0 && (
              <div className="flex items-center space-x-1 text-amber-500">
                <span className="font-bold text-lg">{postureTracker?.value?.checks}</span>
                <span className="text-xs uppercase">checks</span>
              </div>
            )}
          </div>

          <div className="p-6 text-center">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-amber-500/10 mb-4 relative group cursor-pointer" onClick={handleAddCheck}>
                <div className="absolute inset-0 rounded-full bg-amber-500/20 animate-ping opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                <ArrowUp className="h-10 w-10 text-amber-500 transform group-hover:-translate-y-1 transition-transform duration-300" />
              </div>
              <h3 className="text-white font-medium mb-1">Corrija sua Postura</h3>
              <p className="text-zinc-500 text-sm max-w-xs mx-auto">
                Coluna ereta, ombros para trás, peito aberto. Respire fundo.
              </p>
            </div>

            <button
              onClick={handleAddCheck}
              className="w-full bg-amber-600 hover:bg-amber-500 text-white font-medium py-3 rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2"
            >
              <CheckCircle className="h-5 w-5" />
              <span>Registrar Check (+1)</span>
            </button>
          </div>
        </div>

        {/* Stretching Section */}
        <div className="bg-dark-850 rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-6 border-b border-white/10 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <Activity className="h-5 w-5 text-emerald-400" />
              </div>
              <h2 className="font-semibold text-white">Alongamento</h2>
            </div>
            {(postureTracker?.value?.stretchingDuration || 0) > 0 && (
              <CheckCircle className="h-5 w-5 text-green-500" />
            )}
          </div>

          <div className="p-6">
            {(postureTracker?.value?.stretchingDuration || 0) > 0 && !isEditingStretching ? (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 mb-4">
                  <Activity className="h-8 w-8 text-emerald-500" />
                </div>
                <h3 className="text-white font-medium mb-1">{postureTracker?.value?.stretchingDuration} minutos</h3>
                <p className="text-zinc-500">Flexibilidade trabalhada</p>
                <button
                  onClick={handleEditStretching}
                  className="mt-4 text-xs text-zinc-600 hover:text-zinc-400 transition-colors flex items-center justify-center gap-1 mx-auto"
                >
                  <Edit2 className="h-3 w-3" />
                  <span>Editar</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Duração (minutos)</label>
                  <input
                    type="number"
                    value={stretchingDuration}
                    onChange={(e) => setStretchingDuration(e.target.value)}
                    className="w-full bg-dark-900 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 outline-none transition-all"
                    placeholder="Ex: 15"
                  />
                </div>

                <button
                  onClick={handleSaveStretching}
                  disabled={!stretchingDuration}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition-all flex items-center justify-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Registrar Sessão</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Weekly Stats */}
      <div className="bg-dark-850 rounded-2xl border border-white/10 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-white">Consistência Postural</h3>
          <div className="flex items-center space-x-2 text-sm text-zinc-500">
            <CalendarIcon className="h-4 w-4" />
            <span>{format(weekStart, 'dd/MM')} - {format(weekEnd, 'dd/MM')}</span>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {weekDays.map(day => {
            const dayKey = format(day, 'yyyy-MM-dd');
            const dayTracker = trackers.find(t => t.date === dayKey && t.type === 'posture');
            const isToday = isSameDay(day, new Date());
            const hasActivity = (dayTracker?.value?.checks || 0) > 0 || (dayTracker?.value?.stretchingDuration || 0) > 0;

            return (
              <div key={dayKey} className="flex flex-col items-center space-y-2">
                <span className={`text-xs ${isToday ? 'text-white font-bold' : 'text-zinc-500'}`}>
                  {format(day, 'EEE', { locale: ptBR }).slice(0, 3)}
                </span>
                <div className={`w-full aspect-square rounded-lg flex items-center justify-center border transition-all ${hasActivity
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                  : 'bg-dark-900 border-white/5 text-zinc-700'
                  }`}>
                  {hasActivity && <User className="h-4 w-4" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
