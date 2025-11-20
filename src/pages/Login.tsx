import { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Eye, EyeOff, Sparkles, Shield, Zap } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, loginWithGoogle } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }

    setIsLoading(true);

    try {
      await login(email, password);
      
      // Wait a moment for the store to update
      setTimeout(() => {
        toast.success('Login realizado com sucesso!');
        // Usar window.location para garantir redirecionamento imediato
        window.location.href = '/app/dashboard';
      }, 300);
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Erro ao fazer login. Verifique suas credenciais.');
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await loginWithGoogle();
      
      // Wait a moment for the store to update
      setTimeout(() => {
        toast.success('Login com Google realizado com sucesso!');
        window.location.href = '/app/dashboard';
      }, 500);
    } catch (err: any) {
      console.error('Google login error:', err);
      toast.error(err.message || 'Erro ao entrar com Google');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Background Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-primary-600/20 via-transparent to-transparent blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-accent-600/20 via-transparent to-transparent blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl w-full grid md:grid-cols-2 gap-8 items-center relative z-10">
        {/* Left Side - Branding */}
        <div className="hidden md:block space-y-8 animate-fade-in">
          <div className="space-y-4">
            <div className="inline-flex items-center space-x-2 bg-primary-500/10 border border-primary-500/20 rounded-full px-4 py-2">
              <Sparkles className="h-4 w-4 text-primary-400" />
              <span className="text-sm text-primary-300 font-medium">360Man</span>
            </div>
            <h1 className="text-5xl font-bold text-white leading-tight">
              Domine sua
              <span className="block gradient-text">Jornada Pessoal</span>
            </h1>
            <p className="text-lg text-zinc-400 max-w-md">
              Transforme sua vida através de disciplina, consistência e auto-domínio. Junte-se a milhares de homens em evolução.
            </p>
          </div>

          {/* Feature Pills */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3 bg-dark-850/50 backdrop-blur-sm border border-white/5 rounded-xl p-4 hover:border-primary-500/30 transition-all">
              <div className="p-2 bg-primary-500/10 rounded-lg">
                <Shield className="h-5 w-5 text-primary-400" />
              </div>
              <div>
                <h3 className="text-white font-medium">Protocolo de 90 Dias</h3>
                <p className="text-sm text-zinc-500">Sistema completo de transformação</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 bg-dark-850/50 backdrop-blur-sm border border-white/5 rounded-xl p-4 hover:border-accent-500/30 transition-all">
              <div className="p-2 bg-accent-500/10 rounded-lg">
                <Zap className="h-5 w-5 text-accent-400" />
              </div>
              <div>
                <h3 className="text-white font-medium">Ferramentas Avançadas</h3>
                <p className="text-sm text-zinc-500">IA, tracking e comunidade</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full animate-slide-up">
          <div className="bg-dark-850/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">
                Bem-vindo de volta
              </h2>
              <p className="text-zinc-400">
                Continue sua jornada de evolução
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
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
                    className="w-full px-4 py-3 bg-dark-900/50 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
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
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-12 bg-dark-900/50 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      placeholder="Sua senha"
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
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center space-x-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-white/20 bg-dark-900/50 text-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-offset-0 transition-all"
                  />
                  <span className="text-zinc-400 group-hover:text-zinc-300 transition-colors">Lembrar-me</span>
                </label>

                <a href="#" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
                  Esqueceu a senha?
                </a>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-dark-850 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Entrando...</span>
                  </div>
                ) : (
                  'Entrar na Plataforma'
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
                  Novo por aqui?{' '}
                  <Link
                    to="/register"
                    className="text-primary-400 hover:text-primary-300 font-semibold transition-colors"
                  >
                    Criar conta gratuita
                  </Link>
                </p>
              </div>
            </form>

            <div className="mt-6">
              <button
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center space-x-3 border border-white/10 bg-dark-900/50 hover:bg-white/5 text-white py-3 px-4 rounded-xl transition-all"
                disabled={isLoading}
              >
                <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 533.5 544.3" className="inline-block">
                  <path fill="#4285f4" d="M533.5 278.4c0-17.3-1.5-34-4.3-50.3H272v95.2h146.9c-6.3 34-25.1 62.8-53.6 82.2v68.3h86.5c50.6-46.6 80.7-115.2 80.7-195.4z"/>
                  <path fill="#34a853" d="M272 544.3c72.7 0 133.7-24.1 178.2-65.5l-86.5-68.3c-24 16.1-54.6 25.6-91.7 25.6-70.5 0-130.4-47.6-151.8-111.8h-90.2v70.3C88.2 482.7 171 544.3 272 544.3z"/>
                  <path fill="#fbbc04" d="M120.2 325.8c-11.4-34-11.4-70 0-104l-90.2-70.3C4.2 197.6 0 234.8 0 272s4.2 74.4 29.9 120.5l90.3-67.7z"/>
                  <path fill="#ea4335" d="M272 107.1c39.5 0 75.2 13.5 103.2 40.3l77.3-77.3C417.9 29.4 347.5 0 272 0 171 0 88.2 61.6 29.9 152.6l90.2 70.3C141.6 154.7 201.5 107.1 272 107.1z"/>
                </svg>
                <span>Entrar com Google</span>
              </button>
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