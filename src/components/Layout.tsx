import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import logo from '../assets/manup360-logo.jpg';
import { useAuthStore } from '../stores/authStore';
import { useState } from 'react';
import {
  User,
  LogOut,
  Settings,
  BarChart3,
  Dumbbell,
  Brain,
  Users as UsersIcon,
  Heart,
  Flame,
  Calendar,
  Briefcase,
  Users,
  Menu,
  X,
  Trophy,
  Wrench
} from 'lucide-react';
import { toast } from 'sonner';

const areas = [
  { name: 'Dashboard', path: '/app/dashboard', icon: BarChart3, color: 'text-primary-400', bgColor: 'bg-primary-500/10', hoverBg: 'hover:bg-primary-500/20', border: 'border-primary-500' },
  { name: 'Corpo', path: '/app/corpo', icon: Dumbbell, color: 'text-red-400', bgColor: 'bg-red-500/10', hoverBg: 'hover:bg-red-500/20', border: 'border-red-500' },
  { name: 'Mente', path: '/app/mente', icon: Brain, color: 'text-accent-400', bgColor: 'bg-accent-500/10', hoverBg: 'hover:bg-accent-500/20', border: 'border-accent-500' },
  { name: 'Postura e Presença', path: '/app/postura', icon: UsersIcon, color: 'text-success-400', bgColor: 'bg-success-500/10', hoverBg: 'hover:bg-success-500/20', border: 'border-success-500' },
  { name: 'Vida Afetiva', path: '/app/vida-afetiva', icon: Heart, color: 'text-pink-400', bgColor: 'bg-pink-500/10', hoverBg: 'hover:bg-pink-500/20', border: 'border-pink-500' },
  { name: 'Sexualidade', path: '/app/sexualidade', icon: Flame, color: 'text-orange-400', bgColor: 'bg-orange-500/10', hoverBg: 'hover:bg-orange-500/20', border: 'border-orange-500' },
  { name: 'Disciplina e Rotina', path: '/app/disciplina', icon: Calendar, color: 'text-indigo-400', bgColor: 'bg-indigo-500/10', hoverBg: 'hover:bg-indigo-500/20', border: 'border-indigo-500' },
  { name: 'Propósito de Vida', path: '/app/carreira', icon: Briefcase, color: 'text-cyan-400', bgColor: 'bg-cyan-500/10', hoverBg: 'hover:bg-cyan-500/20', border: 'border-cyan-500' },
  { name: 'Desafios', path: '/app/challenges', icon: Trophy, color: 'text-yellow-400', bgColor: 'bg-yellow-500/10', hoverBg: 'hover:bg-yellow-500/20', border: 'border-yellow-500' },
  { name: 'Arsenal', path: '/app/tools', icon: Wrench, color: 'text-cobalt-400', bgColor: 'bg-cobalt-500/10', hoverBg: 'hover:bg-cobalt-500/20', border: 'border-cobalt-500' },
  { name: 'Comunidade', path: '/app/community', icon: Users, color: 'text-zinc-400', bgColor: 'bg-zinc-500/10', hoverBg: 'hover:bg-zinc-500/20', border: 'border-zinc-500' },
];

export default function Layout() {
  const { user, profile, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logout realizado com sucesso');
      navigate('/login');
    } catch (error) {
      toast.error('Erro ao fazer logout');
    }
  };

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Header */}
      <header className="bg-dark-850/80 backdrop-blur-xl border-b border-white/10 fixed top-0 left-0 right-0 z-20 shadow-lg shadow-black/20">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden text-zinc-400 hover:text-white p-2 transition-colors rounded-lg hover:bg-white/5"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>

              <Link to="/app/dashboard" className="flex items-center space-x-3">
                <img src={logo} alt="ManUp 360 Logo" className="w-8 h-8 rounded-full" />
                <span className="text-lg sm:text-xl font-bold text-white tracking-tight gradient-text">
                  ManUp 360
                </span>
              </Link>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="relative group">
                <button className="flex items-center space-x-1 sm:space-x-2 text-zinc-300 hover:text-white px-3 py-2 rounded-lg transition-all hover:bg-white/5">
                  {user?.avatar && user.avatar.trim() ? (
                    <img
                      src={user.avatar}
                      alt={user?.name || 'Avatar'}
                      className="h-7 w-7 rounded-full object-cover border border-white/10"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : profile?.avatar && profile.avatar.trim() ? (
                    <img
                      src={profile.avatar}
                      alt={profile?.name || 'Avatar'}
                      className="h-7 w-7 rounded-full object-cover border border-white/10"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="h-7 w-7 rounded-full bg-primary-500/20 flex items-center justify-center border border-white/10">
                      <span className="text-xs font-medium text-primary-400">
                        {(user?.name || profile?.name || 'U')?.[0]?.toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className="hidden sm:inline text-sm font-medium">{user?.name || profile?.name || 'Usuário'}</span>
                </button>

                <div className="absolute right-0 mt-2 w-48 bg-dark-800 rounded-xl border border-white/10 shadow-2xl py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <Link
                    to="/app/profile"
                    className="flex items-center space-x-2 px-4 py-3 text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-colors rounded-lg mx-1"
                  >
                    <User className="h-4 w-4" />
                    <span>Meu Perfil</span>
                  </Link>
                  <Link
                    to="/app/settings"
                    className="flex items-center space-x-2 px-4 py-3 text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-colors rounded-lg mx-1"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Configurações</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-4 py-3 text-sm text-zinc-300 hover:bg-white/5 hover:text-white w-full text-left transition-colors rounded-lg mx-1"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sair</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex pt-16">
        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`
          w-64 bg-dark-850/50 backdrop-blur-xl border-r border-white/10 min-h-screen fixed left-0 top-16 overflow-y-auto z-30 transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }
        `}>
          <nav className="p-4 space-y-2">
            {areas.map((area) => {
              const Icon = area.icon;
              const isActive = location.pathname === area.path;

              return (
                <Link
                  key={area.path}
                  to={area.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all border-l-4 ${isActive
                    ? `${area.bgColor} ${area.color} ${area.border} font-semibold shadow-lg shadow-${area.color.split('-')[1]}/10`
                    : `text-zinc-400 hover:text-white ${area.hoverBg} border-transparent hover:border-zinc-700`
                    }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? area.color : 'text-zinc-500'}`} />
                  <span className="text-sm font-medium">{area.name}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 bg-dark-900">
          <Outlet />
        </main>
      </div>
    </div>
  );
}