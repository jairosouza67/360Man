import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { CreditCard, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const stripeKey = ((import.meta as any).env.VITE_STRIPE_PUBLISHABLE_KEY as string) || '';
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  isPopular?: boolean;
}

const plans: SubscriptionPlan[] = [
  {
    id: 'basic-monthly',
    name: 'Básico',
    description: 'Comece sua jornada com recursos essenciais',
    price: 49,
    currency: 'BRL',
    interval: 'month',
    features: [
      'Acesso às trilhas iniciantes',
      'Trackers básicos',
      'Comunidade pública',
      'Suporte por email',
      'Plano de 90 dias básico'
    ]
  },
  {
    id: 'premium-monthly',
    name: 'Premium',
    description: 'Acesso completo para transformação acelerada',
    price: 79,
    currency: 'BRL',
    interval: 'month',
    isPopular: true,
    features: [
      'Acesso a todas as trilhas',
      'Trackers avançados',
      'Comunidade premium',
      'Suporte prioritário',
      'Plano de 90 dias personalizado',
      'IA para geração de dietas',
      'Análise de treinos por PDF',
      'Conteúdo exclusivo mensal'
    ]
  },
  {
    id: 'premium-yearly',
    name: 'Premium Anual',
    description: 'Economize 2 meses com plano anual',
    price: 790,
    currency: 'BRL',
    interval: 'year',
    features: [
      'Tudo do Premium Mensal',
      '2 meses grátis',
      'Sessões Q&A mensais',
      'Acesso antecipado a novos recursos',
      'Desafios exclusivos com prêmios'
    ]
  }
];

function CheckoutForm({ plan, onSuccess }: { plan: SubscriptionPlan; onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create payment intent on backend
      const response = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: plan.id,
          price: plan.price,
          currency: plan.currency,
          interval: plan.interval,
        }),
      });

      const { clientSecret } = await response.json();

      // Confirm payment
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
          billing_details: {
            name: 'Nome do Usuário', // Get from auth context
            email: 'usuario@email.com', // Get from auth context
          },
        },
      });

      if (result.error) {
        setError(result.error.message || 'Erro no pagamento');
        toast.error('Erro no pagamento: ' + result.error.message);
      } else if (result.paymentIntent?.status === 'succeeded') {
        toast.success('Assinatura criada com sucesso!');
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao processar pagamento');
      toast.error('Erro ao processar pagamento');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Dados do cartão
        </label>
        <div className="border border-gray-300 rounded-lg p-4 bg-white">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
          />
        </div>
      </div>

      {error && (
        <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
          <AlertCircle className="h-5 w-5" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || isLoading}
        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Processando...</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <CreditCard className="h-4 w-4" />
            <span>
              Assinar por {plan.currency === 'BRL' ? 'R$' : '$'}{plan.price}/{plan.interval === 'month' ? 'mês' : 'ano'}
            </span>
          </div>
        )}
      </button>
    </form>
  );
}

function PricingPage() {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);

  const handlePlanSelect = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setShowCheckout(true);
  };

  const handleSuccess = () => {
    setShowCheckout(false);
    setSelectedPlan(null);
    // Redirect to dashboard or success page
    window.location.href = '/dashboard?subscription=success';
  };

  if (showCheckout && selectedPlan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="mb-6">
              <button
                onClick={() => setShowCheckout(false)}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-4"
              >
                ← Voltar para planos
              </button>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Finalizar assinatura
              </h2>
              <p className="text-gray-600">
                Plano selecionado: <span className="font-medium">{selectedPlan.name}</span>
              </p>
            </div>

            <Elements stripe={stripePromise}>
              <CheckoutForm plan={selectedPlan} onSuccess={handleSuccess} />
            </Elements>

            <div className="mt-6 text-xs text-gray-500 text-center">
              <p>Seus dados estão protegidos com criptografia SSL.</p>
              <p>Você pode cancelar a qualquer momento.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Escolha seu plano
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comece sua jornada de evolução com o plano que melhor se adapta às suas necessidades
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-xl shadow-lg p-8 border-2 transition-all hover:shadow-xl ${plan.isPopular
                ? 'border-blue-500 ring-2 ring-blue-200'
                : 'border-gray-200 hover:border-gray-300'
                }`}
            >
              {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Mais popular
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <p className="text-gray-600 mb-4">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">
                    {plan.currency === 'BRL' ? 'R$' : '$'}{plan.price}
                  </span>
                  <span className="text-gray-600">
                    /{plan.interval === 'month' ? 'mês' : 'ano'}
                  </span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handlePlanSelect(plan)}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${plan.isPopular
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
              >
                Escolher plano
              </button>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Perguntas frequentes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Posso cancelar a qualquer momento?
              </h3>
              <p className="text-gray-600">
                Sim! Você pode cancelar sua assinatura a qualquer momento sem multas ou taxas adicionais.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Há período de teste?
              </h3>
              <p className="text-gray-600">
                Oferecemos 7 dias grátis para novos usuários experimentarem todas as funcionalidades.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Como funciona o plano anual?
              </h3>
              <p className="text-gray-600">
                O plano anual oferece 2 meses grátis - você paga por 10 meses e usa por 12.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Posso mudar de plano depois?
              </h3>
              <p className="text-gray-600">
                Sim! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PricingPage;