import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { generate90DayPlan } from '../lib/ai';

const step1Schema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
  age: z.number().min(18, 'Você deve ter pelo menos 18 anos').max(100, 'Idade inválida')
});

const step2Schema = z.object({
  goals: z.array(z.string()).min(1, 'Selecione pelo menos um objetivo'),
  priorityGoals: z.array(z.string()).length(3, 'Selecione exatamente 3 prioridades'),
  experienceLevel: z.enum(['beginner', 'intermediate', 'advanced'])
});

const step3Schema = z.object({
  weight: z.number().min(30, 'Peso inválido').max(300, 'Peso inválido'),
  height: z.number().min(100, 'Altura inválida').max(250, 'Altura inválida'),
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']),
  sleepHours: z.number().min(4, 'Mínimo 4 horas').max(12, 'Máximo 12 horas'),
  workSchedule: z.enum(['morning', 'afternoon', 'evening', 'night', 'flexible'])
});

const step4Schema = z.object({
  dailyTimePreference: z.number().min(15, 'Mínimo 15 minutos').max(120, 'Máximo 120 minutos'),
  restrictions: z.array(z.string()),
  allergies: z.string(),
  injuries: z.string()
});

const step5Schema = z.object({
  consentData: z.boolean().refine(val => val === true, {
    message: 'Você deve aceitar o uso de dados'
  }),
  consentPhotos: z.boolean(),
  consentSensitiveContent: z.boolean(),
  consentAgeVerification: z.boolean().refine(val => val === true, {
    message: 'Você deve confirmar ser maior de idade'
  })
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;
type Step3Data = z.infer<typeof step3Schema>;
type Step4Data = z.infer<typeof step4Schema>;
type Step5Data = z.infer<typeof step5Schema>;

interface OnboardingData extends Step1Data, Step2Data, Step3Data, Step4Data, Step5Data { }

const GOALS = [
  { id: 'aesthetics', label: 'Melhorar estética corporal', icon: '💪' },
  { id: 'strength', label: 'Aumentar força física', icon: '🏋️' },
  { id: 'voice_presence', label: 'Desenvolver voz e presença', icon: '🎤' },
  { id: 'relationships', label: 'Melhorar relacionamentos', icon: '❤️' },
  { id: 'stop_porn', label: 'Parar com pornografia', icon: '🚫' },
  { id: 'reading', label: 'Aumentar leitura', icon: '📚' },
  { id: 'sleep', label: 'Melhorar sono', icon: '😴' },
  { id: 'social_skills', label: 'Desenvolver habilidades sociais', icon: '🗣️' }
];

const ACTIVITY_LEVELS = [
  { value: 'sedentary', label: 'Sedentário', description: 'Trabalho sentado, pouca atividade' },
  { value: 'light', label: 'Leve', description: 'Caminhadas ocasionais' },
  { value: 'moderate', label: 'Moderado', description: 'Exercício 2-3x por semana' },
  { value: 'active', label: 'Ativo', description: 'Exercício 4-5x por semana' },
  { value: 'very_active', label: 'Muito ativo', description: 'Exercício diário ou trabalho físico' }
];

export default function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuthStore();

  const step1Form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      age: 18
    }
  });

  const step2Form = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      goals: [],
      priorityGoals: [],
      experienceLevel: 'beginner'
    }
  });

  const step3Form = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      weight: 70,
      height: 170,
      activityLevel: 'moderate',
      sleepHours: 7,
      workSchedule: 'morning'
    }
  });

  const step4Form = useForm<Step4Data>({
    resolver: zodResolver(step4Schema),
    defaultValues: {
      dailyTimePreference: 30,
      restrictions: [],
      allergies: '',
      injuries: ''
    }
  });

  const step5Form = useForm<Step5Data>({
    resolver: zodResolver(step5Schema),
    defaultValues: {
      consentData: false,
      consentPhotos: false,
      consentSensitiveContent: false,
      consentAgeVerification: false
    }
  });

  const totalSteps = 5;

  const handleNext = async () => {
    let isValid = false;

    switch (currentStep) {
      case 1:
        isValid = await step1Form.trigger();
        break;
      case 2:
        isValid = await step2Form.trigger();
        break;
      case 3:
        isValid = await step3Form.trigger();
        break;
      case 4:
        isValid = await step4Form.trigger();
        break;
      case 5:
        isValid = await step5Form.trigger();
        break;
    }

    if (isValid && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Collect all data
      const step1Data = step1Form.getValues();
      const step2Data = step2Form.getValues();
      const step3Data = step3Form.getValues();
      const step4Data = step4Form.getValues();
      const step5Data = step5Form.getValues();

      const completeData: OnboardingData = {
        ...step1Data,
        ...step2Data,
        ...step3Data,
        ...step4Data,
        ...step5Data
      };

      // Register user
      await register(completeData.email, completeData.password);

      // Create profile with onboarding data
      const profileData = {
        age: completeData.age,
        weight: completeData.weight,
        height: completeData.height,
        activityLevel: completeData.activityLevel,
        goals: completeData.goals,
        priorityGoals: completeData.priorityGoals,
        experienceLevel: completeData.experienceLevel,
        dailyTimePreference: String(completeData.dailyTimePreference),
        workSchedule: completeData.workSchedule,
        sleepHours: completeData.sleepHours,
        restrictions: completeData.restrictions,
        allergies: completeData.allergies ? [completeData.allergies] : [],
        injuries: completeData.injuries ? [completeData.injuries] : [],
        consentFlags: {
          terms: completeData.consentData,
          privacy: completeData.consentData,
          marketing: completeData.consentPhotos
        }
      };

      // Generate 90-day plan using AI service
      toast.info('Gerando seu plano personalizado de 90 dias...');
      const aiGeneratedTasks = await generate90DayPlan(profileData);

      const now = new Date().toISOString();
      await addDoc(collection(db, 'plans'), {
        userId: completeData.email,
        title: 'Plano de 90 Dias - 360Man',
        description: 'Plano personalizado baseado em suas metas e perfil',
        duration: 90,
        pillars: completeData.goals.slice(0, 3),
        objectives: completeData.priorityGoals,
        dailyTasks: aiGeneratedTasks,
        status: 'active',
        startDate: now,
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        progress: 0,
        createdAt: now,
        updatedAt: now
      });

      toast.success('Bem-vindo ao 360Man! Seu plano de 90 dias foi criado.');
      navigate('/app/dashboard');

    } catch (error) {
      console.error('Onboarding error:', error);
      toast.error('Erro ao criar conta. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Vamos começar</h2>
              <p className="text-gray-600">Informações básicas para criar sua conta</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo</label>
                <input
                  {...step1Form.register('name')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Seu nome"
                />
                {step1Form.formState.errors.name && (
                  <p className="mt-1 text-sm text-red-600">{step1Form.formState.errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  {...step1Form.register('email')}
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="seu@email.com"
                />
                {step1Form.formState.errors.email && (
                  <p className="mt-1 text-sm text-red-600">{step1Form.formState.errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                <input
                  {...step1Form.register('password')}
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Mínimo 8 caracteres"
                />
                {step1Form.formState.errors.password && (
                  <p className="mt-1 text-sm text-red-600">{step1Form.formState.errors.password.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Idade</label>
                <input
                  {...step1Form.register('age', { valueAsNumber: true })}
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="18"
                  max="100"
                />
                {step1Form.formState.errors.age && (
                  <p className="mt-1 text-sm text-red-600">{step1Form.formState.errors.age.message}</p>
                )}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Seus objetivos</h2>
              <p className="text-gray-600">O que você quer alcançar nos próximos 90 dias?</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Selecione seus objetivos</label>
                <div className="grid grid-cols-2 gap-3">
                  {GOALS.map(goal => (
                    <label key={goal.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        {...step2Form.register('goals')}
                        value={goal.id}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-2xl">{goal.icon}</span>
                      <span className="text-sm font-medium text-gray-700">{goal.label}</span>
                    </label>
                  ))}
                </div>
                {step2Form.formState.errors.goals && (
                  <p className="mt-1 text-sm text-red-600">{step2Form.formState.errors.goals.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Priorize suas 3 principais metas</label>
                <div className="space-y-2">
                  {[1, 2, 3].map(priority => (
                    <select
                      key={priority}
                      {...step2Form.register(`priorityGoals.${priority - 1}`)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Selecione a prioridade {priority}</option>
                      {GOALS.map(goal => (
                        <option key={goal.id} value={goal.id}>{goal.icon} {goal.label}</option>
                      ))}
                    </select>
                  ))}
                </div>
                {step2Form.formState.errors.priorityGoals && (
                  <p className="mt-1 text-sm text-red-600">{step2Form.formState.errors.priorityGoals.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Seu nível de experiência</label>
                <div className="space-y-2">
                  {['beginner', 'intermediate', 'advanced'].map(level => (
                    <label key={level} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        {...step2Form.register('experienceLevel')}
                        value={level}
                        className="border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {level === 'beginner' && 'Iniciante'}
                        {level === 'intermediate' && 'Intermediário'}
                        {level === 'advanced' && 'Avançado'}
                      </span>
                    </label>
                  ))}
                </div>
                {step2Form.formState.errors.experienceLevel && (
                  <p className="mt-1 text-sm text-red-600">{step2Form.formState.errors.experienceLevel.message}</p>
                )}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Sua saúde e rotina</h2>
              <p className="text-gray-600">Informações para personalizar seu plano</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Peso (kg)</label>
                  <input
                    {...step3Form.register('weight', { valueAsNumber: true })}
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {step3Form.formState.errors.weight && (
                    <p className="mt-1 text-sm text-red-600">{step3Form.formState.errors.weight.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Altura (cm)</label>
                  <input
                    {...step3Form.register('height', { valueAsNumber: true })}
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {step3Form.formState.errors.height && (
                    <p className="mt-1 text-sm text-red-600">{step3Form.formState.errors.height.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Nível de atividade física</label>
                <div className="space-y-2">
                  {ACTIVITY_LEVELS.map(level => (
                    <label key={level.value} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        {...step3Form.register('activityLevel')}
                        value={level.value}
                        className="mt-1 border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-700">{level.label}</div>
                        <div className="text-xs text-gray-500">{level.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
                {step3Form.formState.errors.activityLevel && (
                  <p className="mt-1 text-sm text-red-600">{step3Form.formState.errors.activityLevel.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Horas de sono desejadas</label>
                <input
                  {...step3Form.register('sleepHours', { valueAsNumber: true })}
                  type="number"
                  min="4"
                  max="12"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {step3Form.formState.errors.sleepHours && (
                  <p className="mt-1 text-sm text-red-600">{step3Form.formState.errors.sleepHours.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Horário de trabalho</label>
                <select
                  {...step3Form.register('workSchedule')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="morning">Manhã</option>
                  <option value="afternoon">Tarde</option>
                  <option value="evening">Noite</option>
                  <option value="night">Madrugada</option>
                  <option value="flexible">Flexível</option>
                </select>
                {step3Form.formState.errors.workSchedule && (
                  <p className="mt-1 text-sm text-red-600">{step3Form.formState.errors.workSchedule.message}</p>
                )}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Preferências e restrições</h2>
              <p className="text-gray-600">Ajude-nos a personalizar ainda mais seu plano</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tempo diário disponível (minutos)</label>
                <input
                  {...step4Form.register('dailyTimePreference', { valueAsNumber: true })}
                  type="number"
                  min="15"
                  max="120"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {step4Form.formState.errors.dailyTimePreference && (
                  <p className="mt-1 text-sm text-red-600">{step4Form.formState.errors.dailyTimePreference.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alergias alimentares</label>
                <textarea
                  {...step4Form.register('allergies')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={2}
                  placeholder="Ex: lactose, glúten, amendoim..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lesões ou limitações físicas</label>
                <textarea
                  {...step4Form.register('injuries')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={2}
                  placeholder="Ex: dor no joelho, problema nas costas..."
                />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Termos e condições</h2>
              <p className="text-gray-600">Últimas confirmações antes de começar</p>
            </div>

            <div className="space-y-4">
              <label className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg">
                <input
                  type="checkbox"
                  {...step5Form.register('consentData')}
                  className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="text-sm">
                  <div className="font-medium text-gray-900">Aceito o uso de dados</div>
                  <div className="text-gray-600">Concordo com o processamento dos meus dados para personalização do plano</div>
                </div>
              </label>
              {step5Form.formState.errors.consentData && (
                <p className="mt-1 text-sm text-red-600">{step5Form.formState.errors.consentData.message}</p>
              )}

              <label className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg">
                <input
                  type="checkbox"
                  {...step5Form.register('consentPhotos')}
                  className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="text-sm">
                  <div className="font-medium text-gray-900">Aceito receber comunicações</div>
                  <div className="text-gray-600">Quero receber dicas e atualizações sobre meu progresso</div>
                </div>
              </label>

              <label className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg">
                <input
                  type="checkbox"
                  {...step5Form.register('consentSensitiveContent')}
                  className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="text-sm">
                  <div className="font-medium text-gray-900">Aceito conteúdo sensível</div>
                  <div className="text-gray-600">Estou ciente que o conteúdo pode abordar temas sensíveis</div>
                </div>
              </label>

              <label className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg">
                <input
                  type="checkbox"
                  {...step5Form.register('consentAgeVerification')}
                  className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="text-sm">
                  <div className="font-medium text-gray-900">Confirmo ser maior de idade</div>
                  <div className="text-gray-600">Tenho 18 anos ou mais</div>
                </div>
              </label>
              {step5Form.formState.errors.consentAgeVerification && (
                <p className="mt-1 text-sm text-red-600">{step5Form.formState.errors.consentAgeVerification.message}</p>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {[1, 2, 3, 4, 5].map(step => (
              <div
                key={step}
                className={`w-full h-2 rounded-full mx-1 ${step <= currentStep ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
              />
            ))}
          </div>
          <p className="text-sm text-gray-600 text-center">
            Passo {currentStep} de {totalSteps}
          </p>
        </div>

        {/* Step content */}
        {renderStep()}

        {/* Navigation buttons */}
        <div className="flex justify-between mt-8">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Voltar
          </button>

          {currentStep < totalSteps ? (
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Próximo
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Criando conta...' : 'Finalizar'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}