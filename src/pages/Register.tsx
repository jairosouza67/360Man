import { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Eye, EyeOff, Sparkles, Target, TrendingUp, Users } from 'lucide-react';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password || !name) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }

    if (password.length < 8) {
      toast.error('A senha deve ter pelo menos 8 caracteres');
      return;
    }

    setIsLoading(true);

    try {
      await register(email, password, name);
      toast.success('Conta criada com sucesso! Bem-vindo ao Respect Pill!');
      // Usar window.location para garantir redirecionamento imediato
      window.location.href = '/app/dashboard';
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Erro ao criar conta. Tente novamente.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Background Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-accent-600/20 via-transparent to-transparent blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-primary-600/20 via-transparent to-transparent blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl w-full grid md:grid-cols-2 gap-8 items-center relative z-10">
        {/* Left Side - Branding */}
        <div className="hidden md:block space-y-8 animate-fade-in">
          <div className="space-y-4">
            <div className="inline-flex items-center space-x-2 bg-accent-500/10 border border-accent-500/20 rounded-full px-4 py-2">
              <Sparkles className="h-4 w-4 text-accent-400" />
              <span className="text-sm text-accent-300 font-medium">Respect Pill</span>
            </div>
            <h1 className="text-5xl font-bold text-white leading-tight">
              Comece sua
              <span className="block gradient-text">Transformação</span>
            </h1>
            <p className="text-lg text-zinc-400 max-w-md">
              Junte-se a uma comunidade de homens comprometidos com a excelência. Sua jornada de 90 dias começa agora.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-dark-850/50 backdrop-blur-sm border border-white/5 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-white mb-1">1.2k+</div>
              <div className="text-xs text-zinc-500">Membros Ativos</div>
            </div>
            <div className="bg-dark-850/50 backdrop-blur-sm border border-white/5 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-white mb-1">90</div>
              <div className="text-xs text-zinc-500">Dias de Protocolo</div>
            </div>
            <div className="bg-dark-850/50 backdrop-blur-sm border border-white/5 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-white mb-1">4.8★</div>
              <div className="text-xs text-zinc-500">Avaliação</div>
            </div>
          </div>

          {/* Benefits */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3 text-zinc-300">
              <div className="p-1.5 bg-success-500/10 rounded-lg">
                <Target className="h-4 w-4 text-success-400" />
              </div>
              <span className="text-sm">Protocolo personalizado de 90 dias</span>
            </div>
            <div className="flex items-center space-x-3 text-zinc-300">
              <div className="p-1.5 bg-primary-500/10 rounded-lg">
                <TrendingUp className="h-4 w-4 text-primary-400" />
              </div>
              <span className="text-sm">Tracking avançado de progresso</span>
            </div>
            <div className="flex items-center space-x-3 text-zinc-300">
              <div className="p-1.5 bg-accent-500/10 rounded-lg">
                <Users className="h-4 w-4 text-accent-400" />
              </div>
              <span className="text-sm">Comunidade exclusiva de apoio</span>
            </div>
          </div>
        </div>

        {/* Right Side - Register Form */}
        <div className="w-full animate-slide-up">
          <div className="bg-dark-850/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">
                Crie sua conta
              </h2>
              <p className="text-zinc-400">
                Comece sua jornada de evolução hoje
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-zinc-300 mb-2">
                    Nome completo
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-dark-900/50 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                    placeholder="Seu nome completo"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-2">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-dark-900/50 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                    placeholder="seu@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-zinc-300 mb-2">
                    Senha
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-12 bg-dark-900/50 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                      placeholder="Mínimo 8 caracteres"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-400 hover:text-white transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-zinc-500">
                    Mínimo 8 caracteres, inclua letras e números
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-accent-600 to-accent-500 hover:from-accent-500 hover:to-accent-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg shadow-accent-500/25 hover:shadow-accent-500/40 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 focus:ring-offset-dark-850 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Criando conta...</span>
                  </div>
                ) : (
                  'Criar Conta Gratuita'
                )}
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-dark-850 text-zinc-500">ou</span>
                </div>
              </div>

              <div className="text-center">
                <p className="text-zinc-400">
                  Já tem uma conta?{' '}
                  <Link
                    to="/login"
                    className="text-accent-400 hover:text-accent-300 font-semibold transition-colors"
                  >
                    Fazer login
                  </Link>
                </p>
              </div>
            </form>

            {/* Terms */}
            <div className="mt-6 text-center text-xs text-zinc-600">
              Ao criar sua conta, você concorda com nossos{' '}
              <a href="#" className="text-accent-400 hover:text-accent-300 transition-colors">
                Termos de Serviço
              </a>
              {' e '}
              <a href="#" className="text-accent-400 hover:text-accent-300 transition-colors">
                Política de Privacidade
              </a>
            </div>
          </div>

          {/* Trust Badge */}
          <div className="mt-6 text-center">
            <p className="text-xs text-zinc-600">
              🔒 Seus dados estão protegidos e criptografados
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}