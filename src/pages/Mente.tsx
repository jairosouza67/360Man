import { useState, useEffect } from 'react';
import ReactPlayer from 'react-player';

import { useTrackerStore } from '../stores/trackerStore';
import { useAuthStore } from '../stores/authStore';
import { Brain, BookOpen, PenTool, Plus, CheckCircle, Play, Pause, RotateCcw, Calendar as CalendarIcon, Music, Upload, Volume2, Edit2 } from 'lucide-react';
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

export default function Mente() {
  const { user } = useAuthStore();
  const { trackers, loadTrackers, saveTrackerValue } = useTrackerStore();
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Form states
  const [readingPages, setReadingPages] = useState('');
  const [journalEntry, setJournalEntry] = useState('');
  const [isEditingReading, setIsEditingReading] = useState(false);
  const [isEditingJournal, setIsEditingJournal] = useState(false);

  // Meditation Timer
  const [meditationTime, setMeditationTime] = useState(10 * 60); // 10 minutes default
  const [timeLeft, setTimeLeft] = useState(10 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  // Background audio/video source (audio only)
  const [mediaSrc, setMediaSrc] = useState<string | null>(null);
  const [isBlob, setIsBlob] = useState(false);
  const [sourceUrl, setSourceUrl] = useState('');
  const [volume, setVolume] = useState(0.6);
  const [loopAudio, setLoopAudio] = useState(false);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const [showMediaControls, setShowMediaControls] = useState(false);

  useEffect(() => {
    if (user) {
      loadTrackers(user.id);
    }
  }, [user, loadTrackers]);

  // Timer logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsTimerRunning(false);
      handleSaveMeditation();
      setIsPreviewPlaying(false); // Stop preview if timer ends
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (isBlob && mediaSrc) {
        try { URL.revokeObjectURL(mediaSrc); } catch (e) { }
      }
    };
  }, [isBlob, mediaSrc]);

  const dateKey = format(selectedDate, 'yyyy-MM-dd');

  // Get trackers for selected date
  const meditationTracker = trackers.find(t => t.date === dateKey && t.type === 'meditation');
  const readingTracker = trackers.find(t => t.date === dateKey && t.type === 'reading');
  const journalTracker = trackers.find(t => t.date === dateKey && t.type === 'journal');

  const handleSaveMeditation = async () => {
    if (!user) return;

    // If triggered by timer finish, use the full duration. 
    // If manual save (not implemented yet but good to have logic), use duration.
    const durationMinutes = Math.floor(meditationTime / 60);

    await saveTrackerValue(user.id, dateKey, 'meditation', {
      completed: true,
      duration: durationMinutes,
      timestamp: new Date().toISOString()
    });
  };

  const handleSaveReading = async () => {
    if (!user || !readingPages) return;

    await saveTrackerValue(user.id, dateKey, 'reading', {
      completed: true,
      pages: parseInt(readingPages),
      timestamp: new Date().toISOString()
    });
    setReadingPages('');
    setIsEditingReading(false);
  };

  const handleEditReading = () => {
    if (readingTracker?.value) {
      setReadingPages(readingTracker.value.pages.toString());
      setIsEditingReading(true);
    }
  };

  const handleSaveJournal = async () => {
    if (!user || !journalEntry) return;

    await saveTrackerValue(user.id, dateKey, 'journal', {
      completed: true,
      content: journalEntry,
      timestamp: new Date().toISOString()
    });
    setJournalEntry('');
    setIsEditingJournal(false);
  };

  const handleEditJournal = () => {
    if (journalTracker?.value) {
      setJournalEntry(journalTracker.value.content);
      setIsEditingJournal(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => setIsTimerRunning(!isTimerRunning);
  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimeLeft(meditationTime);
  };

  const handleFileChange = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (isBlob && mediaSrc) {
      try { URL.revokeObjectURL(mediaSrc); } catch (e) { }
    }
    const url = URL.createObjectURL(file);
    setMediaSrc(url);
    setIsBlob(true);
    setSourceUrl('');
    toast.success('Arquivo de áudio carregado com sucesso!');
  };

  const handleSetUrl = () => {
    if (!sourceUrl) return;
    if (isBlob && mediaSrc) {
      try { URL.revokeObjectURL(mediaSrc); } catch (e) { }
    }
    setMediaSrc(sourceUrl);
    setIsBlob(false);
    toast.success('URL de áudio definida com sucesso!');
  };

  const handleRemoveSource = () => {
    if (isBlob && mediaSrc) {
      try { URL.revokeObjectURL(mediaSrc); } catch (e) { }
    }
    setMediaSrc(null);
    setIsBlob(false);
    setSourceUrl('');
    setIsPreviewPlaying(false);
    toast.info('Áudio removido.');
  };

  const togglePreview = async () => {
    if (!mediaSrc) return;
    setIsPreviewPlaying(!isPreviewPlaying);
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
          <h1 className="text-3xl font-bold text-white mb-2">Mente & Intelecto</h1>
          <p className="text-zinc-400">
            Expanda sua consciência e capacidade cognitiva.
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
        {/* Meditation Section */}
        <div className="bg-dark-850 rounded-2xl border border-white/10 overflow-hidden relative">
          <div className="p-6 border-b border-white/10 flex justify-between items-center z-10 relative">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Brain className="h-5 w-5 text-blue-400" />
              </div>
              <h2 className="font-semibold text-white">Meditação</h2>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowMediaControls(!showMediaControls)}
                className={`p-2 rounded-lg transition-colors ${showMediaControls ? 'bg-blue-500/20 text-blue-400' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}`}
                title="Configurar som de fundo"
              >
                <Music className="h-4 w-4" />
              </button>
              {meditationTracker?.value?.completed && (
                <CheckCircle className="h-5 w-5 text-green-500" />
              )}
            </div>
          </div>

          <div className="p-6 relative z-10">
            {showMediaControls && (
              <div className="mb-6 p-4 bg-dark-900/50 rounded-xl border border-white/5 space-y-4 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Som de Fundo</label>
                  {mediaSrc && (
                    <button
                      onClick={handleRemoveSource}
                      className="text-xs text-red-400 hover:text-red-300 transition-colors"
                    >
                      Remover áudio
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={sourceUrl}
                        onChange={(e) => setSourceUrl(e.target.value)}
                        placeholder="Cole a URL do áudio/vídeo (YouTube, MP4...)"
                        className="w-full bg-dark-800 border border-white/10 rounded-lg pl-3 pr-20 py-2 text-sm text-white placeholder:text-zinc-600 focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all"
                      />
                      <button
                        onClick={() => {
                          if (mediaSrc && mediaSrc === sourceUrl) {
                            handleRemoveSource();
                          } else {
                            handleSetUrl();
                          }
                        }}
                        disabled={!sourceUrl && !mediaSrc}
                        className={`absolute right-1 top-1 bottom-1 px-3 rounded-md text-xs font-medium transition-colors ${mediaSrc && mediaSrc === sourceUrl
                          ? 'bg-red-600 hover:bg-red-500 text-white'
                          : 'bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white'
                          }`}
                      >
                        {mediaSrc && mediaSrc === sourceUrl ? 'Remover' : 'Usar'}
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type="file"
                        accept="video/*,audio/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <button className="h-full px-3 bg-dark-800 border border-white/10 hover:bg-dark-700 text-zinc-400 hover:text-white rounded-lg transition-colors flex items-center justify-center" title="Carregar arquivo local">
                        <Upload className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex-1 flex items-center gap-3">
                      <Volume2 className="h-4 w-4 text-zinc-500" />
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.01}
                        value={volume}
                        onChange={(e) => setVolume(Number(e.target.value))}
                        className="flex-1 h-1 bg-dark-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500"
                      />
                    </div>

                    <label className="flex items-center gap-2 text-sm text-zinc-400 cursor-pointer hover:text-zinc-300 transition-colors">
                      <input
                        type="checkbox"
                        checked={loopAudio}
                        onChange={(e) => setLoopAudio(e.target.checked)}
                        className="rounded border-white/10 bg-dark-800 text-blue-500 focus:ring-blue-500/20"
                      />
                      <span>Loop</span>
                    </label>

                    <button
                      onClick={togglePreview}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${isPreviewPlaying
                        ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                        : 'bg-dark-800 text-zinc-400 hover:text-white hover:bg-dark-700'
                        }`}
                    >
                      {isPreviewPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                      {isPreviewPlaying ? 'Parar' : 'Testar'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {meditationTracker?.value?.completed ? (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/10 mb-4">
                  <Brain className="h-8 w-8 text-blue-500" />
                </div>
                <h3 className="text-white font-medium mb-1">Concluído</h3>
                <p className="text-zinc-500">{meditationTracker.value.duration} minutos de foco</p>
              </div>
            ) : (
              <div className="text-center space-y-6">
                <div className="text-5xl font-mono font-light text-white tracking-wider">
                  {formatTime(timeLeft)}
                </div>

                <div className="flex items-center justify-center space-x-4">
                  <button
                    onClick={toggleTimer}
                    className={`p-4 rounded-full transition-all ${isTimerRunning
                      ? 'bg-dark-800 text-zinc-400 hover:bg-dark-700'
                      : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/20'
                      }`}
                  >
                    {isTimerRunning ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
                  </button>

                  <button
                    onClick={resetTimer}
                    className="p-4 rounded-full bg-dark-800 text-zinc-400 hover:bg-dark-700 transition-all"
                  >
                    <RotateCcw className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex justify-center space-x-2">
                  {[5, 10, 15, 20].map(mins => (
                    <button
                      key={mins}
                      onClick={() => {
                        setMeditationTime(mins * 60);
                        setTimeLeft(mins * 60);
                        setIsTimerRunning(false);
                      }}
                      className={`px-3 py-1 rounded text-xs font-medium transition-all ${meditationTime === mins * 60
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'bg-dark-900 text-zinc-500 border border-white/5 hover:border-white/10'
                        }`}
                    >
                      {mins}min
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          {/* ReactPlayer hidden */}
          <div className="hidden">
            {mediaSrc && (
              // @ts-ignore
              <ReactPlayer
                url={mediaSrc}
                playing={isTimerRunning || isPreviewPlaying}
                loop={loopAudio}
                volume={volume}
                width="0"
                height="0"
                style={{ display: 'none' }}
              />
            )}
          </div>
        </div>

        {/* Reading Section */}
        <div className="bg-dark-850 rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-6 border-b border-white/10 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <BookOpen className="h-5 w-5 text-amber-400" />
              </div>
              <h2 className="font-semibold text-white">Leitura</h2>
            </div>
            {readingTracker?.value?.completed && (
              <CheckCircle className="h-5 w-5 text-green-500" />
            )}
          </div>

          <div className="p-6">
            {readingTracker?.value?.completed && !isEditingReading ? (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/10 mb-4">
                  <BookOpen className="h-8 w-8 text-amber-500" />
                </div>
                <h3 className="text-white font-medium mb-1">{readingTracker.value.pages} páginas</h3>
                <p className="text-zinc-500">Conhecimento absorvido</p>
                <button
                  onClick={handleEditReading}
                  className="mt-4 text-xs text-zinc-600 hover:text-zinc-400 transition-colors flex items-center justify-center gap-1 mx-auto"
                >
                  <Edit2 className="h-3 w-3" />
                  <span>Editar</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Páginas Lidas</label>
                  <input
                    type="number"
                    value={readingPages}
                    onChange={(e) => setReadingPages(e.target.value)}
                    className="w-full bg-dark-900 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 outline-none transition-all"
                    placeholder="Ex: 20"
                  />
                </div>

                <button
                  onClick={handleSaveReading}
                  disabled={!readingPages}
                  className="w-full bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition-all flex items-center justify-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Registrar Leitura</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Journal Section */}
        <div className="bg-dark-850 rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-6 border-b border-white/10 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <PenTool className="h-5 w-5 text-emerald-400" />
              </div>
              <h2 className="font-semibold text-white">Diário</h2>
            </div>
            {journalTracker?.value?.completed && (
              <CheckCircle className="h-5 w-5 text-green-500" />
            )}
          </div>

          <div className="p-6">
            {journalTracker?.value?.completed && !isEditingJournal ? (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 mb-4">
                  <PenTool className="h-8 w-8 text-emerald-500" />
                </div>
                <h3 className="text-white font-medium mb-1">Reflexão Registrada</h3>
                <p className="text-zinc-500 line-clamp-2 px-4 italic">"{journalTracker.value.content}"</p>
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
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Reflexão do Dia</label>
                  <textarea
                    value={journalEntry}
                    onChange={(e) => setJournalEntry(e.target.value)}
                    rows={4}
                    className="w-full bg-dark-900 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 outline-none transition-all resize-none"
                    placeholder="Como está sua mente hoje? O que você aprendeu?"
                  />
                </div>

                <button
                  onClick={handleSaveJournal}
                  disabled={!journalEntry}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition-all flex items-center justify-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Salvar Reflexão</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Weekly Stats */}
      <div className="bg-dark-850 rounded-2xl border border-white/10 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-white">Consistência Mental</h3>
          <div className="flex items-center space-x-2 text-sm text-zinc-500">
            <CalendarIcon className="h-4 w-4" />
            <span>{format(weekStart, 'dd/MM')} - {format(weekEnd, 'dd/MM')}</span>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {weekDays.map(day => {
            const dayKey = format(day, 'yyyy-MM-dd');
            const dayMeditation = trackers.find(t => t.date === dayKey && t.type === 'meditation');
            const isToday = isSameDay(day, new Date());

            return (
              <div key={dayKey} className="flex flex-col items-center space-y-2">
                <span className={`text-xs ${isToday ? 'text-white font-bold' : 'text-zinc-500'}`}>
                  {format(day, 'EEE', { locale: ptBR }).slice(0, 3)}
                </span>
                <div className={`w-full aspect-square rounded-lg flex items-center justify-center border transition-all ${dayMeditation?.value?.completed
                  ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                  : 'bg-dark-900 border-white/5 text-zinc-700'
                  }`}>
                  {dayMeditation?.value?.completed && <Brain className="h-4 w-4" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
