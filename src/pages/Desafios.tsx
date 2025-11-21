import { useState } from 'react';
import { Trophy, Medal, Calendar, CheckCircle, ArrowUp, Settings, Plus, X } from 'lucide-react';
import { differenceInDays, addDays } from 'date-fns';

export default function Desafios() {
    const [activeTab, setActiveTab] = useState<'active' | 'leaderboard'>('active');
    const [isEditingTasks, setIsEditingTasks] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');

    // Editable tasks state
    const [tasks, setTasks] = useState([
        { id: 1, title: "Banho Gelado (3min)", completed: true },
        { id: 2, title: "Sem Açúcar", completed: true },
        { id: 3, title: "Leitura (20 pág)", completed: false },
        { id: 4, title: "Treino de Força", completed: false },
    ]);

    // Mock data for now
    const currentChallenge = {
        title: "Protocolo Espartano",
        description: "30 dias de disciplina inegociável. Banho gelado, treino diário e leitura.",
        startDate: new Date(new Date().setDate(1)), // Start of current month
        endDate: addDays(new Date(new Date().setDate(1)), 30),
        participants: 1240,
        myProgress: 12, // days
        totalDays: 30,
    };

    const toggleTaskCompletion = (taskId: number) => {
        setTasks(tasks.map(task =>
            task.id === taskId ? { ...task, completed: !task.completed } : task
        ));
    };

    const addTask = () => {
        if (!newTaskTitle.trim()) return;
        const newTask = {
            id: Math.max(...tasks.map(t => t.id), 0) + 1,
            title: newTaskTitle,
            completed: false
        };
        setTasks([...tasks, newTask]);
        setNewTaskTitle('');
    };

    const removeTask = (taskId: number) => {
        setTasks(tasks.filter(task => task.id !== taskId));
    };

    const leaderboard = [
        { rank: 1, name: "Alexandre G.", points: 15400, avatar: "A", trend: "up" },
        { rank: 2, name: "Ricardo M.", points: 14200, avatar: "R", trend: "same" },
        { rank: 3, name: "Felipe S.", points: 13850, avatar: "F", trend: "up" },
        { rank: 4, name: "Você", points: 12100, avatar: "V", trend: "up" },
        { rank: 5, name: "João P.", points: 11900, avatar: "J", trend: "down" },
    ];

    const daysLeft = differenceInDays(currentChallenge.endDate, new Date());
    const progressPercent = Math.round((currentChallenge.myProgress / currentChallenge.totalDays) * 100);
    const completedTasks = tasks.filter(t => t.completed).length;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Desafios & Conquistas</h1>
                    <p className="text-zinc-400">
                        Supere seus limites e prove seu valor.
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 bg-dark-850 p-1 rounded-xl border border-white/10 w-fit">
                <button
                    onClick={() => setActiveTab('active')}
                    className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'active'
                        ? 'bg-dark-700 text-white shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                >
                    Desafio Ativo
                </button>
                <button
                    onClick={() => setActiveTab('leaderboard')}
                    className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'leaderboard'
                        ? 'bg-dark-700 text-white shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                >
                    Ranking
                </button>
            </div>

            {activeTab === 'active' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Challenge Card */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-gradient-to-br from-yellow-900/20 to-dark-850 rounded-2xl border border-yellow-500/20 overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <Trophy className="h-48 w-48 text-yellow-500" />
                            </div>

                            <div className="p-8 relative z-10">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-bold uppercase tracking-wider border border-yellow-500/20">
                                            Mensal
                                        </div>
                                        <div className="flex items-center text-zinc-400 text-sm">
                                            <Calendar className="h-4 w-4 mr-1" />
                                            <span>Termina em {daysLeft} dias</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setIsEditingTasks(!isEditingTasks)}
                                        className={`p-2 rounded-lg transition-colors ${isEditingTasks
                                                ? 'bg-yellow-500/20 text-yellow-400'
                                                : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                                            }`}
                                        title="Personalizar desafios"
                                    >
                                        <Settings className="h-4 w-4" />
                                    </button>
                                </div>

                                <h2 className="text-3xl font-bold text-white mb-4">{currentChallenge.title}</h2>
                                <p className="text-zinc-300 mb-8 max-w-xl leading-relaxed">
                                    {currentChallenge.description}
                                </p>

                                <div className="space-y-2 mb-8">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-zinc-400">Seu Progresso</span>
                                        <span className="text-white font-medium">{progressPercent}%</span>
                                    </div>
                                    <div className="w-full bg-dark-900 h-3 rounded-full overflow-hidden border border-white/5">
                                        <div
                                            className="h-full bg-yellow-500 rounded-full transition-all duration-500 shadow-[0_0_15px_rgba(234,179,8,0.3)]"
                                            style={{ width: `${progressPercent}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-xs text-zinc-500 mt-1">
                                        <span>Dia {currentChallenge.myProgress}</span>
                                        <span>Meta: {currentChallenge.totalDays} dias</span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Tarefas Diárias ({completedTasks}/{tasks.length})</h3>
                                        {isEditingTasks && (
                                            <span className="text-xs text-yellow-400">Modo de Edição</span>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {tasks.map(task => (
                                            <div
                                                key={task.id}
                                                className={`p-4 rounded-xl border transition-all flex items-center justify-between group ${task.completed
                                                        ? 'bg-yellow-500/10 border-yellow-500/30 text-white'
                                                        : 'bg-dark-900 border-white/5 text-zinc-400 hover:border-white/10'
                                                    }`}
                                            >
                                                <span className="font-medium flex-1">{task.title}</span>
                                                <div className="flex items-center gap-2">
                                                    {isEditingTasks && (
                                                        <button
                                                            onClick={() => removeTask(task.id)}
                                                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-all"
                                                            title="Remover tarefa"
                                                        >
                                                            <X className="h-3 w-3 text-red-400" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => toggleTaskCompletion(task.id)}
                                                        className="flex items-center justify-center"
                                                        disabled={isEditingTasks}
                                                    >
                                                        {task.completed ? (
                                                            <CheckCircle className="h-5 w-5 text-yellow-500" />
                                                        ) : (
                                                            <div className="h-5 w-5 rounded-full border-2 border-zinc-600 hover:border-zinc-500 transition-colors" />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {isEditingTasks && (
                                        <div className="flex gap-2 pt-2">
                                            <input
                                                type="text"
                                                value={newTaskTitle}
                                                onChange={(e) => setNewTaskTitle(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && addTask()}
                                                placeholder="Nova tarefa..."
                                                className="flex-1 bg-dark-900 border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder:text-zinc-600 focus:ring-1 focus:ring-yellow-500/50 focus:border-yellow-500/50 outline-none transition-all"
                                            />
                                            <button
                                                onClick={addTask}
                                                disabled={!newTaskTitle.trim()}
                                                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all flex items-center gap-2"
                                            >
                                                <Plus className="h-4 w-4" />
                                                <span className="text-sm font-medium">Adicionar</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats / Badges */}
                    <div className="space-y-6">
                        <div className="bg-dark-850 rounded-2xl border border-white/10 p-6">
                            <h3 className="text-lg font-medium text-white mb-6">Suas Conquistas</h3>
                            <div className="grid grid-cols-3 gap-4">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} className="aspect-square rounded-xl bg-dark-900 border border-white/5 flex flex-col items-center justify-center p-2 group hover:border-yellow-500/30 transition-all cursor-pointer">
                                        <Medal className={`h-8 w-8 mb-2 ${i <= 3 ? 'text-yellow-500' : 'text-zinc-700'}`} />
                                        <span className={`text-[10px] text-center ${i <= 3 ? 'text-white' : 'text-zinc-600'}`}>
                                            {i <= 3 ? 'Conquistado' : 'Bloqueado'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-dark-850 rounded-2xl border border-white/10 p-6">
                            <h3 className="text-lg font-medium text-white mb-4">Participantes</h3>
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex -space-x-2">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="w-8 h-8 rounded-full bg-dark-700 border border-dark-850 flex items-center justify-center text-xs text-zinc-400">
                                            {String.fromCharCode(64 + i)}
                                        </div>
                                    ))}
                                    <div className="w-8 h-8 rounded-full bg-dark-800 border border-dark-850 flex items-center justify-center text-xs text-zinc-500">
                                        +
                                    </div>
                                </div>
                                <span className="text-sm text-zinc-400">{currentChallenge.participants} ativos</span>
                            </div>
                            <button className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-all">
                                Convidar Amigo
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-dark-850 rounded-2xl border border-white/10 overflow-hidden">
                    <div className="p-6 border-b border-white/10">
                        <h2 className="text-xl font-bold text-white">Ranking Global</h2>
                        <p className="text-zinc-400 text-sm mt-1">Os mais disciplinados da comunidade.</p>
                    </div>
                    <div className="divide-y divide-white/5">
                        {leaderboard.map((user) => (
                            <div key={user.rank} className={`p-4 flex items-center justify-between hover:bg-white/5 transition-colors ${user.name === 'Você' ? 'bg-yellow-500/5' : ''
                                }`}>
                                <div className="flex items-center space-x-4">
                                    <div className={`w-8 h-8 flex items-center justify-center font-bold rounded-lg ${user.rank === 1 ? 'bg-yellow-500 text-black' :
                                        user.rank === 2 ? 'bg-zinc-400 text-black' :
                                            user.rank === 3 ? 'bg-orange-700 text-white' :
                                                'bg-dark-800 text-zinc-500'
                                        }`}>
                                        {user.rank}
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-dark-700 flex items-center justify-center text-zinc-300 font-medium">
                                        {user.avatar}
                                    </div>
                                    <div>
                                        <div className={`font-medium ${user.name === 'Você' ? 'text-yellow-500' : 'text-white'}`}>
                                            {user.name}
                                        </div>
                                        <div className="text-xs text-zinc-500">Nível Elite</div>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-6">
                                    <div className="text-right">
                                        <div className="text-white font-mono font-medium">{user.points.toLocaleString()}</div>
                                        <div className="text-xs text-zinc-500">XP</div>
                                    </div>
                                    {user.trend === 'up' && <ArrowUp className="h-4 w-4 text-green-500" />}
                                    {user.trend === 'down' && <ArrowUp className="h-4 w-4 text-red-500 rotate-180" />}
                                    {user.trend === 'same' && <div className="w-4 h-0.5 bg-zinc-600" />}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
