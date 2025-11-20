import { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { toast } from 'sonner';
import { Camera, Edit2, Save, X } from 'lucide-react';

export default function Profile() {
  const { user, profile, updateProfile, uploadAvatar } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    weight: '',
    height: '',
    activityLevel: '',
    goals: '',
    restrictions: ''
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || user?.name || '',
        age: profile.age?.toString() || '',
        weight: profile.weight?.toString() || '',
        height: profile.height?.toString() || '',
        activityLevel: profile.activityLevel || '',
        goals: profile.goals?.join(', ') || '',
        restrictions: profile.restrictions?.join(', ') || ''
      });
    }
  }, [profile, user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateProfile({
        name: formData.name,
        age: formData.age ? parseInt(formData.age) : undefined,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        height: formData.height ? parseFloat(formData.height) : undefined,
        activityLevel: formData.activityLevel,
        goals: formData.goals ? formData.goals.split(',').map(g => g.trim()) : undefined,
        restrictions: formData.restrictions ? formData.restrictions.split(',').map(r => r.trim()) : undefined
      });
      
      toast.success('Perfil atualizado com sucesso!');
      setIsEditing(false);
    } catch (error) {
      toast.error('Erro ao atualizar perfil');
      console.error(error);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    try {
      await uploadAvatar(file);
      toast.success('Foto de perfil atualizada com sucesso!');
    } catch (error) {
      toast.error('Erro ao fazer upload da foto');
      console.error(error);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Meu Perfil</h1>
          <p className="text-zinc-400 mt-2">Gerenciar informações pessoais e preferências</p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
            isEditing
              ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
              : 'bg-primary-500/10 text-primary-400 hover:bg-primary-500/20'
          }`}
        >
          {isEditing ? (
            <>
              <X className="h-4 w-4" />
              <span>Cancelar</span>
            </>
          ) : (
            <>
              <Edit2 className="h-4 w-4" />
              <span>Editar</span>
            </>
          )}
        </button>
      </div>

      {/* Avatar Section */}
      <div className="bg-dark-850 rounded-2xl p-8 border border-white/10">
        <div className="flex items-center space-x-6">
          <div className="relative">
            {user?.avatar && user.avatar.trim() ? (
              <img
                src={user.avatar}
                alt={user?.name || 'Avatar'}
                className="h-24 w-24 rounded-full object-cover border-2 border-primary-500/20"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  const fallback = (e.target as HTMLImageElement).nextElementSibling;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
            ) : profile?.avatar && profile.avatar.trim() ? (
              <img
                src={profile.avatar}
                alt={profile?.name || 'Avatar'}
                className="h-24 w-24 rounded-full object-cover border-2 border-primary-500/20"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  const fallback = (e.target as HTMLImageElement).nextElementSibling;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
            ) : null}
            <div 
              className="h-24 w-24 rounded-full bg-dark-900 border-2 border-white/10 flex items-center justify-center"
              style={{ display: (!user?.avatar || !user.avatar.trim()) && (!profile?.avatar || !profile.avatar.trim()) ? 'flex' : 'none' }}
            >
              <span className="text-3xl text-zinc-600">
                {(user?.name || profile?.name || 'U')?.[0]?.toUpperCase()}
              </span>
            </div>
            {isEditing && (
              <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 hover:opacity-100 transition-opacity cursor-pointer group">
                <Camera className="h-6 w-6 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={isUploadingAvatar}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white">{user?.name || profile?.name || 'Usuário'}</h2>
            <p className="text-zinc-400">{user?.email}</p>
            <p className="text-sm text-zinc-500 mt-2">
              {user?.emailVerified ? (
                <span className="text-green-400">✓ Email verificado</span>
              ) : (
                <span className="text-yellow-400">○ Email não verificado</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-dark-850 rounded-2xl p-8 border border-white/10">
          <h3 className="text-xl font-bold text-white mb-6">Informações Pessoais</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Nome Completo
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`w-full px-4 py-3 rounded-lg border transition-all ${
                  isEditing
                    ? 'bg-dark-900/50 border-white/10 text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500'
                    : 'bg-dark-900 border-white/5 text-zinc-400 cursor-not-allowed'
                }`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-4 py-3 rounded-lg border bg-dark-900 border-white/5 text-zinc-400 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Idade
              </label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`w-full px-4 py-3 rounded-lg border transition-all ${
                  isEditing
                    ? 'bg-dark-900/50 border-white/10 text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500'
                    : 'bg-dark-900 border-white/5 text-zinc-400 cursor-not-allowed'
                }`}
                placeholder="Ex: 30"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Nível de Atividade
              </label>
              <select
                name="activityLevel"
                value={formData.activityLevel}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`w-full px-4 py-3 rounded-lg border transition-all ${
                  isEditing
                    ? 'bg-dark-900/50 border-white/10 text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500'
                    : 'bg-dark-900 border-white/5 text-zinc-400 cursor-not-allowed'
                }`}
              >
                <option value="">Selecione</option>
                <option value="sedentary">Sedentário</option>
                <option value="light">Leve</option>
                <option value="moderate">Moderado</option>
                <option value="active">Ativo</option>
                <option value="veryActive">Muito Ativo</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Peso (kg)
              </label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`w-full px-4 py-3 rounded-lg border transition-all ${
                  isEditing
                    ? 'bg-dark-900/50 border-white/10 text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500'
                    : 'bg-dark-900 border-white/5 text-zinc-400 cursor-not-allowed'
                }`}
                placeholder="Ex: 85.5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Altura (cm)
              </label>
              <input
                type="number"
                name="height"
                value={formData.height}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`w-full px-4 py-3 rounded-lg border transition-all ${
                  isEditing
                    ? 'bg-dark-900/50 border-white/10 text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500'
                    : 'bg-dark-900 border-white/5 text-zinc-400 cursor-not-allowed'
                }`}
                placeholder="Ex: 180"
              />
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Objetivos (separados por vírgula)
              </label>
              <textarea
                name="goals"
                value={formData.goals}
                onChange={handleInputChange}
                disabled={!isEditing}
                rows={3}
                className={`w-full px-4 py-3 rounded-lg border transition-all resize-none ${
                  isEditing
                    ? 'bg-dark-900/50 border-white/10 text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500'
                    : 'bg-dark-900 border-white/5 text-zinc-400 cursor-not-allowed'
                }`}
                placeholder="Ex: Ganhar massa muscular, melhorar flexibilidade..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Restrições (separadas por vírgula)
              </label>
              <textarea
                name="restrictions"
                value={formData.restrictions}
                onChange={handleInputChange}
                disabled={!isEditing}
                rows={3}
                className={`w-full px-4 py-3 rounded-lg border transition-all resize-none ${
                  isEditing
                    ? 'bg-dark-900/50 border-white/10 text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500'
                    : 'bg-dark-900 border-white/5 text-zinc-400 cursor-not-allowed'
                }`}
                placeholder="Ex: Alergia a amendoim, lesão no ombro..."
              />
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-6 py-3 rounded-lg border border-white/10 text-white hover:bg-white/5 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-3 rounded-lg bg-primary-500 hover:bg-primary-600 text-white transition-colors font-medium flex items-center space-x-2 shadow-lg shadow-primary-500/20"
            >
              <Save className="h-4 w-4" />
              <span>Salvar Alterações</span>
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
