import { useState } from 'react';
import { Plus, Target, Check, Trash2, X, Trophy, Calendar } from 'lucide-react';
import { differenceInDays } from 'date-fns';
import { useAuthStore } from '../../stores/authStore';
import { useTrackerStore, Goal } from '../../stores/trackerStore';

export function GoalManager() {
    const { user } = useAuthStore();
    const { goals, createGoal, deleteGoal, updateGoal } = useTrackerStore();
    const [isCreating, setIsCreating] = useState(false);
    const [newGoal, setNewGoal] = useState<Partial<Goal>>({
        title: '',
        category: 'Geral',
        type: 'manual',
        checklist: [],
        progress: 0,
        status: 'active',
        deadline: '', // Initialize with empty string to avoid uncontrolled input warning
        target: undefined,
        actionPlan: ''
    });
    const [checklistInput, setChecklistInput] = useState('');

    const handleCreateGoal = async () => {
        if (!user || !newGoal.title || !newGoal.deadline) {
            console.log('Validation failed:', { hasUser: !!user, hasTitle: !!newGoal.title, hasDeadline: !!newGoal.deadline });
            alert('Por favor, preencha todos os campos obrigatórios (Título e Prazo).');
            return;
        }

        try {
            console.log('Creating goal with data:', {
                userId: user.id,
                title: newGoal.title,
                deadline: newGoal.deadline,
                type: newGoal.type
            });

            // Construct payload to avoid undefined values
            const payload: any = {
                userId: user.id,
                title: newGoal.title,
                startDate: new Date().toISOString(),
                deadline: newGoal.deadline,
                category: newGoal.category || 'Geral',
                checklist: newGoal.checklist || [],
                type: newGoal.type as any,
                status: 'active',
                progress: 0
            };

            if (newGoal.type !== 'manual' && newGoal.target) {
                payload.target = newGoal.target;
            }

            if (newGoal.actionPlan) {
                payload.actionPlan = newGoal.actionPlan;
            }

            await createGoal(payload);

            console.log('Goal created successfully!');
            alert('Meta criada com sucesso!');

            setIsCreating(false);
            setNewGoal({
                title: '',
                category: 'Geral',
                type: 'manual',
                checklist: [],
                progress: 0,
                status: 'active',
                deadline: '',
                target: undefined,
                actionPlan: ''
            });
        } catch (error: any) {
            console.error('Error creating goal:', error);
            alert(`Erro ao criar meta: ${error.message || 'Erro desconhecido'}. Verifique o console.`);
        }
    };

    const addChecklistItem = () => {
        if (!checklistInput) return;
        const newItem = {
            id: Math.random().toString(36).substr(2, 9),
            text: checklistInput,
            completed: false
        };
        setNewGoal({
            ...newGoal,
            checklist: [...(newGoal.checklist || []), newItem]
        });
        setChecklistInput('');
    };

    const toggleChecklistItem = async (goal: Goal, itemId: string) => {
        const updatedChecklist = goal.checklist.map(item =>
            item.id === itemId ? { ...item, completed: !item.completed } : item
        );

        // Auto-update progress for manual goals
        let newProgress = goal.progress;
        if (goal.type === 'manual') {
            const completedCount = updatedChecklist.filter(i => i.completed).length;
            newProgress = Math.round((completedCount / updatedChecklist.length) * 100);
        }

        await updateGoal(goal.id, {
            checklist: updatedChecklist,
            progress: newProgress,
            status: newProgress >= 100 ? 'completed' : 'active'
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-white">A Estratégia</h2>
                    <p className="text-sm text-zinc-400">Defina metas, execute o plano.</p>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors flex items-center gap-2 text-sm"
                >
                    <Plus className="h-4 w-4" />
                    Nova Meta
                </button>
            </div>

            {isCreating && (
                <div className="bg-dark-850 p-6 rounded-xl border border-white/10 animate-in slide-in-from-top-2">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-white font-medium flex items-center gap-2">
                            <Target className="h-5 w-5 text-indigo-500" />
                            Nova Estratégia
                        </h3>
                        <button onClick={() => setIsCreating(false)} className="text-zinc-500 hover:text-white">
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs text-zinc-400 mb-1">Título da Meta</label>
                            <input
                                type="text"
                                value={newGoal.title}
                                onChange={e => setNewGoal({ ...newGoal, title: e.target.value })}
                                className="w-full bg-dark-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                                placeholder="Ex: Atingir 10% de BF"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-zinc-400 mb-1">Prazo (Deadline)</label>
                                <input
                                    type="date"
                                    value={newGoal.deadline}
                                    onChange={e => setNewGoal({ ...newGoal, deadline: e.target.value })}
                                    className="w-full bg-dark-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-zinc-400 mb-1">Tipo</label>
                                <select
                                    value={newGoal.type}
                                    onChange={e => setNewGoal({ ...newGoal, type: e.target.value as any })}
                                    className="w-full bg-dark-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                                >
                                    <option value="manual">Manual (Checklist)</option>
                                    <option value="measurement">Medida Corporal</option>
                                    <option value="tracker">Consistência (Tracker)</option>
                                </select>
                            </div>
                        </div>

                        {newGoal.type === 'manual' && (
                            <div>
                                <label className="block text-xs text-zinc-400 mb-1">Checklist de Tarefas</label>
                                <div className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={checklistInput}
                                        onChange={e => setChecklistInput(e.target.value)}
                                        className="flex-1 bg-dark-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                                        placeholder="Adicionar tarefa..."
                                    />
                                    <button
                                        onClick={addChecklistItem}
                                        className="p-2 bg-dark-700 hover:bg-dark-600 text-white rounded-lg"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {newGoal.checklist?.map((item, index) => (
                                        <div key={index} className="flex items-center justify-between bg-dark-900 p-2 rounded-lg">
                                            <span className="text-sm text-zinc-300">{item.text}</span>
                                            <button
                                                onClick={() => setNewGoal({
                                                    ...newGoal,
                                                    checklist: newGoal.checklist?.filter((_, i) => i !== index)
                                                })}
                                                className="text-zinc-600 hover:text-red-400"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {newGoal.type === 'measurement' && (
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs text-zinc-400 mb-1">Métrica</label>
                                    <select
                                        onChange={e => setNewGoal({
                                            ...newGoal,
                                            target: { ...newGoal.target!, metric: e.target.value }
                                        })}
                                        className="w-full bg-dark-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                                    >
                                        <option value="weight">Peso</option>
                                        <option value="bodyFat">Gordura Corporal</option>
                                        <option value="waist">Cintura</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs text-zinc-400 mb-1">Operador</label>
                                    <select
                                        onChange={e => setNewGoal({
                                            ...newGoal,
                                            target: { ...newGoal.target!, operator: e.target.value as any }
                                        })}
                                        className="w-full bg-dark-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                                    >
                                        <option value="<=">Menor ou Igual</option>
                                        <option value=">=">Maior ou Igual</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs text-zinc-400 mb-1">Valor Alvo</label>
                                    <input
                                        type="number"
                                        onChange={e => setNewGoal({
                                            ...newGoal,
                                            target: { ...newGoal.target!, value: parseFloat(e.target.value) }
                                        })}
                                        className="w-full bg-dark-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                                    />
                                </div>
                            </div>
                        )}

                        {newGoal.type === 'tracker' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-zinc-400 mb-1">Tracker</label>
                                    <select
                                        onChange={e => setNewGoal({
                                            ...newGoal,
                                            target: { ...newGoal.target!, metric: e.target.value }
                                        })}
                                        className="w-full bg-dark-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                                    >
                                        <option value="workout">Treino</option>
                                        <option value="diet">Dieta (100%)</option>
                                        <option value="sleep">Sono</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs text-zinc-400 mb-1">Quantidade (Dias)</label>
                                    <input
                                        type="number"
                                        onChange={e => setNewGoal({
                                            ...newGoal,
                                            target: { ...newGoal.target!, value: parseFloat(e.target.value) }
                                        })}
                                        className="w-full bg-dark-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="mt-4">
                            <label className="block text-xs text-zinc-400 mb-1">Plano de Ação</label>
                            <textarea
                                value={newGoal.actionPlan || ''}
                                onChange={e => setNewGoal({ ...newGoal, actionPlan: e.target.value })}
                                className="w-full bg-dark-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm h-20 resize-none"
                                placeholder="O que você vai fazer para atingir essa meta? (ex: Jejum, 3 treinos/semana)"
                            />
                        </div>

                        <button
                            onClick={handleCreateGoal}
                            disabled={!newGoal.title || !newGoal.deadline}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-50 mt-4"
                        >
                            Criar Meta
                        </button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 gap-4">
                {goals.map(goal => {
                    const daysLeft = differenceInDays(new Date(goal.deadline), new Date());

                    return (
                        <div key={goal.id} className="bg-dark-850 rounded-xl border border-white/10 p-6 relative overflow-hidden">
                            {/* Progress Bar Background */}
                            <div
                                className="absolute bottom-0 left-0 h-1 bg-indigo-500 transition-all duration-1000"
                                style={{ width: `${goal.progress}%` }}
                            />

                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-white text-lg">{goal.title}</h3>
                                        {goal.status === 'completed' && (
                                            <span className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                                                <Trophy className="h-3 w-3" />
                                                Concluído
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-zinc-400">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {daysLeft > 0 ? `${daysLeft} dias restantes` : 'Expirado'}
                                        </span>
                                        <span>{goal.progress}% Concluído</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => deleteGoal(goal.id)}
                                    className="text-zinc-600 hover:text-red-400"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Checklist Items */}
                            {goal.checklist.length > 0 && (
                                <div className="space-y-2 mt-4">
                                    {goal.checklist.map(item => (
                                        <button
                                            key={item.id}
                                            onClick={() => toggleChecklistItem(goal, item.id)}
                                            className={`w-full flex items-center gap-3 p-2 rounded-lg text-sm transition-colors ${item.completed
                                                ? 'bg-green-500/10 text-zinc-400 line-through'
                                                : 'bg-dark-900 text-zinc-200 hover:bg-dark-800'
                                                }`}
                                        >
                                            <div className={`w-5 h-5 rounded border flex items-center justify-center ${item.completed ? 'bg-green-500 border-green-500' : 'border-zinc-600'
                                                }`}>
                                                {item.completed && <Check className="h-3 w-3 text-white" />}
                                            </div>
                                            {item.text}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Auto-Goal Info */}
                            {goal.type !== 'manual' && goal.target && (
                                <div className="bg-dark-900 p-3 rounded-lg text-sm text-zinc-400 mt-4">
                                    <p>
                                        Meta Automática: {goal.target.metric} {goal.target.operator} {goal.target.value}
                                    </p>
                                    <p className="text-xs mt-1 text-zinc-500">
                                        Atualizado automaticamente com base nos seus registros.
                                    </p>
                                </div>
                            )}

                            {/* Action Plan Display */}
                            {goal.actionPlan && (
                                <div className="mt-4 p-3 bg-dark-900/50 rounded-lg border border-white/5">
                                    <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Plano de Ação</p>
                                    <p className="text-sm text-zinc-300">{goal.actionPlan}</p>
                                </div>
                            )}

                            {/* Result Input (for completed goals) */}
                            {goal.status === 'completed' && (
                                <div className="mt-4 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                                    <label className="block text-xs text-green-400 mb-1 uppercase tracking-wider">Resultado Final</label>
                                    {goal.result ? (
                                        <p className="text-sm text-white">{goal.result}</p>
                                    ) : (
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="Registre o resultado alcançado..."
                                                className="flex-1 bg-dark-900 border border-white/10 rounded px-2 py-1 text-sm text-white"
                                                onKeyDown={async (e) => {
                                                    if (e.key === 'Enter') {
                                                        await updateGoal(goal.id, { result: e.currentTarget.value });
                                                    }
                                                }}
                                            />
                                            <button className="text-xs text-green-400 hover:text-green-300">Salvar</button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
