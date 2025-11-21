import { useState, useEffect } from 'react';
import { useTrackerStore } from '../stores/trackerStore';
import { useAuthStore } from '../stores/authStore';
import { Heart, Smile, PenTool, Plus, CheckCircle, Calendar as CalendarIcon, Edit2 } from 'lucide-react';
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function VidaAfetiva() {
  const { user } = useAuthStore();
  const { trackers, loadTrackers, saveTrackerValue } = useTrackerStore();
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Form states
  const [emotionalState, setEmotionalState] = useState<number | null>(null);
  const [journalEntry, setJournalEntry] = useState('');
  const [isEditingJournal, setIsEditingJournal] = useState(false);

  useEffect(() => {
    if (user) {
      loadTrackers(user.id);
    }
  }, [user, loadTrackers]);

  const dateKey = format(selectedDate, 'yyyy-MM-dd');

  // Get trackers for selected date
  const affectiveTracker = trackers.find(t => t.date === dateKey && t.type === 'affective');

  const handleSaveEmotionalState = async (state: number) => {
    if (!user) return;

    const currentJournal = affectiveTracker?.value?.journal || '';
    const currentDateNight = affectiveTracker?.value?.dateNight || false;

    await saveTrackerValue(user.id, dateKey, 'affective', {
      completed: true,
      emotionalState: state,
      journal: currentJournal,
      dateNight: currentDateNight,
      timestamp: new Date().toISOString()
    });
    setEmotionalState(state);
  };

  const handleSaveJournal = async () => {
    if (!user || !journalEntry) return;

    const currentEmotionalState = affectiveTracker?.value?.emotionalState || emotionalState;
    const currentDateNight = affectiveTracker?.value?.dateNight || false;

    await saveTrackerValue(user.id, dateKey, 'affective', {
      completed: true,
      emotionalState: currentEmotionalState,
      journal: journalEntry,
      dateNight: currentDateNight,
      timestamp: new Date().toISOString()
    });
    setJournalEntry('');
    setIsEditingJournal(false);
  };

  const handleEditJournal = () => {
    if (affectiveTracker?.value?.journal) {
      setJournalEntry(affectiveTracker.value.journal);
      setIsEditingJournal(true);
    }
  };

  const toggleDateNight = async () => {
    if (!user) return;

    const currentEmotionalState = affectiveTracker?.value?.emotionalState || emotionalState;
    const currentJournal = affectiveTracker?.value?.journal || '';
    const currentDateNight = affectiveTracker?.value?.dateNight || false;

    await saveTrackerValue(user.id, dateKey, 'affective', {
      completed: true,
      emotionalState: currentEmotionalState,
      journal: currentJournal,
      dateNight: !currentDateNight,
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
          <h1 className="text-3xl font-bold text-white mb-2">Vida Afetiva</h1>
          <p className="text-zinc-400">
            Cultive conexões profundas e inteligência emocional.
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
        {/* Emotional State Section */}
        <div className="bg-dark-850 rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-6 border-b border-white/10 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-pink-500/10 rounded-lg">
                <Smile className="h-5 w-5 text-pink-400" />
              </div>
              <h2 className="font-semibold text-white">Estado Emocional</h2>
            </div>
            {affectiveTracker?.value?.emotionalState && (
              <div className="flex items-center space-x-1 text-pink-500">
                <span className="font-bold text-lg">{affectiveTracker.value.emotionalState}</span>
                <span className="text-xs">/10</span>
              </div>
            )}
          </div>

          <div className="p-6">
            <p className="text-zinc-400 text-sm mb-6 text-center">
              Como você se sente hoje? (1-10)
            </p>

            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => {
                const isSelected = affectiveTracker?.value?.emotionalState === num;
                return (
                  <button
                    key={num}
                    onClick={() => handleSaveEmotionalState(num)}
                    className={`aspect-square rounded-lg font-medium transition-all ${isSelected
                      ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/30'
                      : 'bg-dark-900 text-zinc-500 hover:bg-dark-800 hover:text-pink-400'
                      }`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Date Night / Quality Time Section */}
        <div className="bg-dark-850 rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-6 border-b border-white/10 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <Heart className="h-5 w-5 text-red-400" />
              </div>
              <h2 className="font-semibold text-white">Tempo de Qualidade</h2>
            </div>
            {affectiveTracker?.value?.dateNight && (
              <CheckCircle className="h-5 w-5 text-green-500" />
            )}
          </div>

          <div className="p-6 text-center">
            <div className="mb-8">
              <div
                className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-4 relative group cursor-pointer transition-all ${affectiveTracker?.value?.dateNight
                  ? 'bg-red-500/20'
                  : 'bg-dark-900 hover:bg-dark-800'
                  }`}
                onClick={toggleDateNight}
              >
                <Heart className={`h-10 w-10 transition-all ${affectiveTracker?.value?.dateNight
                  ? 'text-red-500 fill-red-500'
                  : 'text-zinc-600 group-hover:text-red-400'
                  }`} />
              </div>
              <h3 className="text-white font-medium mb-1">
                {affectiveTracker?.value?.dateNight ? 'Conexão Registrada' : 'Registrar Conexão'}
              </h3>
              <p className="text-zinc-500 text-sm max-w-xs mx-auto">
                Date night, conversa profunda ou tempo de qualidade com quem importa.
              </p>
            </div>

            <button
              onClick={toggleDateNight}
              className={`w-full font-medium py-3 rounded-xl transition-all flex items-center justify-center space-x-2 ${affectiveTracker?.value?.dateNight
                ? 'bg-dark-900 text-zinc-400 hover:bg-dark-800'
                : 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-500/20'
                }`}
            >
              {affectiveTracker?.value?.dateNight ? (
                <>
                  <span>Desmarcar</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5" />
                  <span>Marcar como Feito</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Journal Section */}
        <div className="bg-dark-850 rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-6 border-b border-white/10 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <PenTool className="h-5 w-5 text-purple-400" />
              </div>
              <h2 className="font-semibold text-white">Diário Afetivo</h2>
            </div>
            {affectiveTracker?.value?.journal && (
              <CheckCircle className="h-5 w-5 text-green-500" />
            )}
          </div>

          <div className="p-6">
            {affectiveTracker?.value?.journal && !isEditingJournal ? (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-500/10 mb-4">
                  <PenTool className="h-8 w-8 text-purple-500" />
                </div>
                <h3 className="text-white font-medium mb-1">Registro Salvo</h3>
                <p className="text-zinc-500 line-clamp-3 px-4 italic">"{affectiveTracker.value.journal}"</p>
                <button
                  onClick={handleEditJournal}
                  className="mt-4 text-xs text-zinc-600 hover:text-zinc-400 transition-colors flex items-center justify-center gap-1 mx-auto"
                >
                  <Edit2 className="h-3 w-3" />
                  <span>Editar</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Notas sobre Relacionamentos</label>
                  <textarea
                    value={journalEntry}
                    onChange={(e) => setJournalEntry(e.target.value)}
                    rows={4}
                    className="w-full bg-dark-900 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 outline-none transition-all resize-none"
                    placeholder="Observações, gratidão ou pontos de melhoria..."
                  />
                </div>

                <button
                  onClick={handleSaveJournal}
                  disabled={!journalEntry}
                  className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition-all flex items-center justify-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Salvar Nota</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Weekly Stats */}
      <div className="bg-dark-850 rounded-2xl border border-white/10 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-white">Consistência Afetiva</h3>
          <div className="flex items-center space-x-2 text-sm text-zinc-500">
            <CalendarIcon className="h-4 w-4" />
            <span>{format(weekStart, 'dd/MM')} - {format(weekEnd, 'dd/MM')}</span>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {weekDays.map(day => {
            const dayKey = format(day, 'yyyy-MM-dd');
            const dayTracker = trackers.find(t => t.date === dayKey && t.type === 'affective');
            const isToday = isSameDay(day, new Date());
            const hasActivity = (dayTracker?.value?.emotionalState || 0) > 0 || dayTracker?.value?.dateNight || dayTracker?.value?.journal;

            return (
              <div key={dayKey} className="flex flex-col items-center space-y-2">
                <span className={`text-xs ${isToday ? 'text-white font-bold' : 'text-zinc-500'}`}>
                  {format(day, 'EEE', { locale: ptBR }).slice(0, 3)}
                </span>
                <div className={`w-full aspect-square rounded-lg flex items-center justify-center border transition-all ${hasActivity
                  ? 'bg-pink-500/20 border-pink-500/50 text-pink-400'
                  : 'bg-dark-900 border-white/5 text-zinc-700'
                  }`}>
                  {hasActivity && <Heart className="h-4 w-4" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
