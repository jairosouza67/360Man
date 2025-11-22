import { Link } from 'react-router-dom';
import logo from '../assets/manup360-logo.jpg';
import {
  Dumbbell,
  Brain,
  Users,
  Heart,
  Flame,
  Calendar,
  Briefcase,
  ArrowRight,
  CheckCircle,
  Shield,
  TrendingUp,
  Target
} from 'lucide-react';

const features = [
  {
    icon: Dumbbell,
    title: 'Corpo',
    description: 'Construa força, saúde e vitalidade física',
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20'
  },
  {
    icon: Brain,
    title: 'Mente',
    description: 'Desenvolva clareza mental e foco',
    color: 'text-accent-400',
    bgColor: 'bg-accent-500/10',
    borderColor: 'border-accent-500/20'
  },
  {
    icon: Users,
    title: 'Postura',
    description: 'Presença marcante e confiança',
    color: 'text-success-400',
    bgColor: 'bg-success-500/10',
    borderColor: 'border-success-500/20'
  },
  {
    icon: Heart,
    title: 'Vida Afetiva',
    description: 'Relacionamentos saudáveis',
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/20'
  },
  {
    icon: Flame,
    title: 'Sexualidade',
    description: 'Sexualidade consciente e saudável',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/20'
  },
  {
    icon: Calendar,
    title: 'Disciplina',
    description: 'Hábitos e rotina produtiva',
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-500/10',
    borderColor: 'border-indigo-500/20'
  },
  {
    icon: Briefcase,
    title: 'Propósito de Vida',
    description: 'Crescimento profissional',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/20'
  },
  {
    icon: Users,
    title: 'Comunidade',
    description: 'Identidade masculina positiva',
    color: 'text-zinc-400',
    bgColor: 'bg-zinc-500/10',
    borderColor: 'border-zinc-500/20'
  }
];

const benefits = [
  {
    icon: Target,
    title: 'Planos Personalizados de 90 Dias',
    description: 'Trilhas estruturadas para evolução constante'
  },
  {
    icon: TrendingUp,
    title: 'Acompanhamento de Progresso',
    description: 'Métricas claras e motivação diária'
  },
  {
    icon: Shield,
    title: 'Ambiente Seguro e Respeitoso',
    description: 'Comunidade sem toxicidade'
  },
  {
    icon: CheckCircle,
    title: 'Conteúdo Baseado em Ciência',
    description: 'Informação confiável e prática'
  }
];

export default function Home() {
  return (
    <div className="min-h-screen bg-dark-900">
      {/* Header/Navbar */}
      <header className="fixed top-0 left-0 right-0 glass z-50 shadow-lg shadow-black/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <div className="flex items-center space-x-3">
              <img src={logo} alt="ManUp 360 Logo" className="w-10 h-10 rounded-full" />
              <span className="text-xl sm:text-2xl font-bold gradient-text">
                ManUp 360
              </span>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link
                to="/login"
                className="px-3 sm:px-4 py-2 text-sm sm:text-base text-zinc-300 hover:text-white font-medium transition-colors"
              >
                Entrar
              </Link>
              <Link
                to="/register"
                className="px-4 sm:px-6 py-2.5 text-sm sm:text-base bg-gradient-to-r from-primary-500 to-accent-600 text-white rounded-lg hover:from-primary-600 hover:to-accent-700 font-semibold transition-all shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:scale-105"
              >
                Começar
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 sm:pt-40 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-accent-500/10 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white mb-6 sm:mb-8 leading-[1.1]">
              Construa a Melhor Versão de{' '}
              <span className="gradient-text">Você Mesmo</span>
            </h1>
            <p className="text-lg sm:text-xl text-zinc-400 mb-8 sm:mb-12 leading-relaxed px-4">
              Uma plataforma completa para desenvolvimento masculino moderno.
              Evolua em todas as áreas fundamentais da sua vida, sem toxicidade.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 sm:px-10 py-4 bg-gradient-to-r from-primary-500 to-accent-600 text-white rounded-xl hover:from-primary-600 hover:to-accent-700 font-semibold text-sm sm:text-base transition-all shadow-2xl shadow-primary-500/30 hover:shadow-primary-500/50 hover:scale-105 flex items-center justify-center space-x-2"
              >
                <span>Começar Jornada Gratuita</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto px-8 sm:px-10 py-4 bg-white/5 text-white border border-white/20 rounded-xl hover:border-white/40 hover:bg-white/10 font-semibold text-sm sm:text-base transition-all backdrop-blur-sm"
              >
                Já tenho conta
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-dark-850/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-20">
            <h2 className="text-3xl sm:text-5xl font-bold text-white mb-4 sm:mb-6">
              8 Áreas Fundamentais
            </h2>
            <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto px-4">
              Desenvolvimento completo e equilibrado em todas as dimensões da vida masculina
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className={`bg-dark-900 p-8 rounded-2xl hover:bg-dark-850 transition-all group border ${feature.borderColor} hover:border-opacity-50 hover:shadow-2xl hover:shadow-${feature.color}/10 hover:scale-105 cursor-pointer`}
                >
                  <div className={`${feature.bgColor} w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon className={`${feature.color} h-7 w-7`} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-20">
            <h2 className="text-3xl sm:text-5xl font-bold text-white mb-4 sm:mb-6">
              Por que ManUp 360?
            </h2>
            <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto px-4">
              Uma abordagem moderna, científica e sem toxicidade
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={index}
                  className="flex items-start space-x-5 p-8 bg-dark-850 rounded-2xl hover:bg-dark-800 transition-all border border-white/10 hover:border-primary-500/30 hover:shadow-2xl hover:shadow-primary-500/10 hover:scale-105 cursor-pointer"
                >
                  <div className="bg-primary-500/10 w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon className="h-6 w-6 text-primary-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">{benefit.title}</h3>
                    <p className="text-sm text-zinc-400 leading-relaxed">{benefit.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary-600 to-accent-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 via-transparent to-accent-500/20 pointer-events-none"></div>
        <div className="max-w-4xl mx-auto text-center relative">
          <h2 className="text-3xl sm:text-5xl font-bold text-white mb-6 sm:mb-8">
            Pronto para Evoluir?
          </h2>
          <p className="text-base sm:text-lg text-primary-100 mb-8 sm:mb-12 px-4">
            Junte-se a milhares de homens construindo uma vida melhor
          </p>
          <Link
            to="/register"
            className="inline-flex items-center space-x-2 px-8 sm:px-10 py-4 bg-white text-primary-600 rounded-xl hover:bg-gray-50 font-bold text-sm sm:text-base transition-all shadow-2xl hover:shadow-white/20 hover:scale-105"
          >
            <span>Criar Conta Gratuita</span>
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark-950 text-zinc-500 py-10 sm:py-16 px-4 sm:px-6 lg:px-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-600 rounded-lg flex items-center justify-center shadow-lg shadow-primary-500/20">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <span className="text-xl font-bold gradient-text">ManUp 360</span>
          </div>
          <p className="text-sm sm:text-base mb-4">
            Desenvolvimento masculino moderno, sem toxicidade
          </p>
          <p className="text-xs sm:text-sm">
            © 2024 ManUp 360. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
