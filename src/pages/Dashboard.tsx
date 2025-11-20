import { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useTrackerStore } from '../stores/trackerStore';
import { Link } from 'react-router-dom';
import { Target, Users, Clock, CheckCircle, Play, ArrowRight, Award } from 'lucide-react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isToday } from 'date-fns';
import AphorismWidget from '../components/dashboard/AphorismWidget';
import CleanDaysWidget from '../components/dashboard/CleanDaysWidget';

export default function Dashboard() {
  const { user } = useAuthStore();
  const { currentPlan, trackers, loadTrackers, loadPlans, getStreak } = useTrackerStore();

  useEffect(() => {
    if (user) {
      loadTrackers(user.id);
      loadPlans(user.id);
    }
  }, [user, loadTrackers, loadPlans]);

  const [streaks, setStreaks] = useState({ workout: 0, reading: 0, sleep: 0 });

  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const todayTrackers = trackers.filter(t =>
    t.date === format(today, 'yyyy-MM-dd')
  );

  const completedToday = todayTrackers.filter(t => t.value?.completed).length;
  const totalToday = todayTrackers.length;

  useEffect(() => {
    let mounted = true;

    async function fetchStreaks() {
      if (!user) {
        if (mounted) setStreaks({ workout: 0, reading: 0, sleep: 0 });
        return;
      }

      try {
        const [w, r, s] = await Promise.all([
          getStreak(user.id, 'workout'),
          getStreak(user.id, 'reading'),
          getStreak(user.id, 'sleep')
        ]);

        if (mounted) setStreaks({ workout: w, reading: r, sleep: s });
      } catch (e) {
        console.error('Error fetching streaks', e);
      }
    }

    fetchStreaks();

    return () => { mounted = false; };
  }, [user, getStreak]);

  const getPillarProgress = (pillar: string) => {
    const pillarTrackers = trackers.filter(t => t.type === pillar);
    const completed = pillarTrackers.filter(t => t.value?.completed).length;
    return totalToday > 0 ? Math.round((completed / Math.max(totalToday, 1)) * 100) : 0;
  };

  return (
    <div className="space-y-8">
      {/* Welcome & Primary Action */}
      <div className="flex flex-col md:flex-row gap-6 items-stretch">
        <div className="flex-1 bg-gradient-to-br from-dark-800 to-dark-900 rounded-2xl p-8 border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Target className="h-32 w-32 text-white" />
          </div>
          <div className="relative z-10">
            <h1 className="text-3xl font-bold text-white mb-2">
              Comando Central
            </h1>
            <p className="text-zinc-400 mb-6 max-w-lg">
              {currentPlan
                ? `Dia ${Math.ceil((Date.now() - new Date(currentPlan.startDate).getTime()) / (1000 * 60 * 60 * 24))} do Protocolo de 90 Dias`
                : 'Sua jornada de auto-domínio começa agora.'}
            </p>

            <div className="flex items-center space-x-4">
              <Link to="/app/disciplina" className="bg-cobalt-600 hover:bg-cobalt-500 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-all shadow-lg shadow-cobalt-500/20 hover:shadow-cobalt-500/40 hover:-translate-y-0.5">
                <Play className="h-5 w-5 fill-current" />
                <span>Iniciar Protocolo Diário</span>
              </Link>
              <Link to="/app/content" className="px-6 py-3 rounded-lg font-medium text-zinc-300 hover:text-white hover:bg-white/5 transition-colors flex items-center space-x-2">
                <span>Ver Currículo</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        <div className="md:w-1/3">
          <AphorismWidget />
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Daily Progress */}
        <div className="bg-dark-850 p-6 rounded-2xl border border-white/10 hover:border-cobalt-500/30 transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-cobalt-500/10 rounded-lg group-hover:bg-cobalt-500/20 transition-colors">
              <CheckCircle className="h-6 w-6 text-cobalt-400" />
            </div>
            <span className="text-xs text-zinc-500 uppercase font-medium tracking-wider">Hoje</span>
          </div>
          <div className="text-3xl font-light text-white mb-1">
            {totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0}%
          </div>
          <p className="text-sm text-zinc-400 mb-3">Conclusão de tarefas</p>
          <div className="bg-dark-900 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-cobalt-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${totalToday > 0 ? (completedToday / totalToday) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Clean Streak */}
        <CleanDaysWidget days={Math.max(streaks.workout, streaks.reading, streaks.sleep)} type="general" />

        {/* Plan Progress */}
        <div className="bg-dark-850 p-6 rounded-2xl border border-white/10 hover:border-gold-500/30 transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-gold-500/10 rounded-lg group-hover:bg-gold-500/20 transition-colors">
              <Target className="h-6 w-6 text-gold-400" />
            </div>
            <span className="text-xs text-zinc-500 uppercase font-medium tracking-wider">Plano</span>
          </div>
          <div className="text-3xl font-light text-white mb-1">
            {currentPlan?.progress || 0}%
          </div>
          <p className="text-sm text-zinc-400 mb-3">Evolução 90 dias</p>
          <div className="bg-dark-900 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gold-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${currentPlan?.progress || 0}%` }}
            />
          </div>
        </div>

        {/* Community */}
        <div className="bg-dark-850 p-6 rounded-2xl border border-white/10 hover:border-purple-500/30 transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-500/10 rounded-lg group-hover:bg-purple-500/20 transition-colors">
              <Users className="h-6 w-6 text-purple-400" />
            </div>
            <span className="text-xs text-zinc-500 uppercase font-medium tracking-wider">Tribo</span>
          </div>
          <div className="text-3xl font-light text-white mb-1">
            1,247
          </div>
          <p className="text-sm text-zinc-400 mb-3">Membros ativos</p>
          <div className="flex -space-x-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="w-6 h-6 rounded-full bg-dark-700 border border-dark-850 flex items-center justify-center text-[10px] text-zinc-400">
                {String.fromCharCode(64 + i)}
              </div>
            ))}
            <div className="w-6 h-6 rounded-full bg-dark-800 border border-dark-850 flex items-center justify-center text-[10px] text-zinc-500">
              +
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Today's Tasks List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-light text-white tracking-tight">Protocolo de Hoje</h2>
            <div className="text-sm text-zinc-500">
              {format(today, "dd 'de' MMMM", { locale: undefined })} {/* TODO: Add locale */}
            </div>
          </div>

          <div className="space-y-3">
            {currentPlan?.dailyTasks?.filter(task =>
              task.date === format(today, 'yyyy-MM-dd')
            ).map((task) => (
              <div key={task.id} className="group flex items-center p-4 bg-dark-850 border border-white/5 rounded-xl hover:border-cobalt-500/30 transition-all hover:bg-dark-800">
                <button className={`flex-shrink-0 w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center transition-colors ${task.completed
                  ? 'bg-cobalt-500 border-cobalt-500'
                  : 'border-zinc-600 group-hover:border-cobalt-400'
                  }`}>
                  {task.completed && <CheckCircle className="h-4 w-4 text-white" />}
                </button>

                <div className="flex-1">
                  <h3 className={`font-medium transition-colors ${task.completed ? 'text-zinc-500 line-through' : 'text-white group-hover:text-cobalt-100'}`}>
                    {task.title}
                  </h3>
                  <p className="text-sm text-zinc-500">{task.description}</p>
                </div>

                <div className="flex items-center text-zinc-500 text-sm bg-dark-900 px-3 py-1 rounded-lg">
                  <Clock className="h-3 w-3 mr-2" />
                  {task.duration}min
                </div>
              </div>
            ))}

            {(!currentPlan?.dailyTasks || currentPlan.dailyTasks.filter(task =>
              task.date === format(today, 'yyyy-MM-dd')
            ).length === 0) && (
                <div className="text-center py-12 bg-dark-850 rounded-xl border border-white/5 border-dashed">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-dark-800 mb-4">
                    <CheckCircle className="h-6 w-6 text-zinc-600" />
                  </div>
                  <p className="text-zinc-400">Nenhuma tarefa agendada para hoje.</p>
                  <button className="mt-4 text-cobalt-400 hover:text-cobalt-300 text-sm font-medium">
                    Adicionar tarefa manual
                  </button>
                </div>
              )}
          </div>
        </div>

        {/* Weekly Overview & Stats */}
        <div className="space-y-6">
          <div className="bg-dark-850 rounded-2xl p-6 border border-white/10">
            <h3 className="text-lg font-medium text-white mb-6">Consistência Semanal</h3>
            <div className="space-y-4">
              {weekDays.map(day => {
                const dayTrackers = trackers.filter(t => t.date === format(day, 'yyyy-MM-dd'));
                const completed = dayTrackers.filter(t => t.value?.completed).length;
                const total = dayTrackers.length;
                const progress = total > 0 ? (completed / total) * 100 : 0;
                const isCurrentDay = isToday(day);

                return (
                  <div key={day.toISOString()} className="flex items-center justify-between group">
                    <span className={`text-sm w-8 ${isCurrentDay ? 'text-cobalt-400 font-bold' : 'text-zinc-500'}`}>
                      {format(day, 'EEE')}
                    </span>
                    <div className="flex-1 mx-4 bg-dark-900 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${progress === 100 ? 'bg-green-500' : 'bg-cobalt-500'
                          }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-zinc-500 w-8 text-right">
                      {Math.round(progress)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-gradient-to-br from-gold-900/20 to-dark-850 rounded-2xl p-6 border border-gold-500/10">
            <h3 className="text-lg font-medium text-white mb-2">Nível de Disciplina</h3>
            <div className="flex items-end space-x-2 mb-4">
              <span className="text-4xl font-bold text-gold-400">Elite</span>
              <span className="text-sm text-gold-500/60 mb-1">Top 5%</span>
            </div>
            <p className="text-sm text-zinc-400">
              Sua consistência nos últimos 7 dias está acima da média da comunidade. Mantenha o foco.
            </p>
          </div>
        </div>
      </div>

      {/* Pillars Progress */}
      <div className="bg-dark-850 p-6 border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-light text-white tracking-tight">Progresso por pilares</h2>
          <Award className="h-5 w-5 text-neutral-500" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {['workout', 'reading', 'sleep'].map(pillar => {
            const progress = getPillarProgress(pillar);
            const pillarNames = {
              workout: 'Treino',
              reading: 'Leitura',
              sleep: 'Sono'
            };

            return (
              <div key={pillar} className="text-center">
                <div className="mb-3">
                  <div className="text-3xl font-light text-white">{progress}%</div>
                  <div className="text-sm text-neutral-400 font-light tracking-wide uppercase">{pillarNames[pillar as keyof typeof pillarNames]}</div>
                </div>
                <div className="bg-white/5 h-1">
                  <div
                    className="bg-gradient-to-r from-cobalt-500 to-gold-400 h-1 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}