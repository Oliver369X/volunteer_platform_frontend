import { useState, useEffect, useMemo } from 'react';
import PageHeader from '../components/PageHeader';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';
import useApi from '../hooks/useApi';
import { useAuth } from '../hooks/useAuth';

// Planes base disponibles para todos
const basePlans = [
  {
    name: 'FREE',
    price: 0,
    features: ['1 evento activo', '5 tareas por evento', 'Funciones básicas', 'Soporte por email'],
    description: 'Ideal para comenzar',
  },
  {
    name: 'BASIC',
    price: 49,
    features: ['Hasta 50 voluntarios', '10 tareas activas', 'Matching con IA', 'Reportes básicos', 'Gestión de eventos', 'Soporte por email'],
    description: 'Para organizaciones pequeñas',
  },
  {
    name: 'PREMIUM',
    price: 99,
    features: ['Voluntarios ilimitados', 'Tareas ilimitadas', 'IA avanzada de matching', 'Reportes y analytics completos', 'Tracking GPS en tiempo real', 'API personalizada', 'Soporte prioritario 24/7'],
    description: 'Máximo impacto para tu organización',
    popular: true,
  },
];

// Plan Enterprise - Solo para clientes especiales
const enterprisePlan = {
  name: 'ENTERPRISE',
  price: 299,
  features: ['Todo lo de PREMIUM', 'Integraciones personalizadas', 'Gestor de cuenta dedicado', 'Soporte técnico prioritario 24/7', 'SLA garantizado 99.9%', 'Capacitación personalizada', 'Consultoría estratégica'],
  description: 'Trato personalizado para grandes organizaciones',
  enterprise: true,
};

// Emails autorizados para ver el plan Enterprise
const ENTERPRISE_AUTHORIZED_EMAILS = ['oliver679801@gmail.com'];

const SubscriptionPage = () => {
  const api = useApi();
  const { authFetch, user } = useAuth();
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Determinar qué planes mostrar según el usuario
  const availablePlans = useMemo(() => {
    const userEmail = user?.email || '';
    const showEnterprise = ENTERPRISE_AUTHORIZED_EMAILS.includes(userEmail);
    
    return showEnterprise ? [...basePlans, enterprisePlan] : basePlans;
  }, [user?.email]);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const data = await api.getCurrentSubscription();
      setCurrentSubscription(data);
    } catch (err) {
      setError(err.message || 'Error al cargar suscripción');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planName) => {
    try {
      const data = await authFetch('/payments/checkout', {
        method: 'POST',
        body: { plan: planName },
      });
      
      // Redirigir a Stripe Checkout
      if (data?.data?.url || data?.url) {
        window.location.href = data.data?.url || data.url;
      }
    } catch (err) {
      setError(err.message || 'Error al crear sesión de pago');
    }
  };

  const handleCancel = async () => {
    if (!confirm('¿Estás seguro de cancelar tu suscripción?')) return;
    
    try {
      await authFetch('/payments/subscription/cancel', { method: 'POST' });
      fetchSubscription();
      alert('Suscripción cancelada. Se mantendrá activa hasta el final del período pagado.');
    } catch (err) {
      setError(err.message || 'Error al cancelar suscripción');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-6">
      <PageHeader
        title="Planes y Facturación"
        subtitle="Gestiona tu suscripción y accede a funcionalidades premium"
      />

      {error && <ErrorAlert message={error} onClose={() => setError(null)} />}

      {/* Plan Actual */}
      {currentSubscription && (
        <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Plan Actual</h3>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                {currentSubscription.subscription.plan}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Estado: {currentSubscription.subscription.status}
              </p>
            </div>
            
            {currentSubscription.subscription.plan !== 'FREE' && (
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
              >
                Cancelar Suscripción
              </button>
            )}
          </div>
        </div>
      )}

      {/* Planes Disponibles */}
      <div className={`grid gap-6 ${availablePlans.length === 4 ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
        {availablePlans.map((plan) => (
          <div
            key={plan.name}
            className={`bg-white rounded-2xl shadow-lg p-8 transition-all ${
              plan.popular 
                ? 'ring-2 ring-blue-500 relative transform hover:scale-105 bg-gradient-to-br from-blue-50 to-indigo-50' 
                : plan.enterprise
                ? 'ring-2 ring-amber-500 relative transform hover:scale-105 bg-gradient-to-br from-amber-50 to-orange-50'
                : 'hover:shadow-xl'
            }`}
          >
            {plan.popular && (
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <span className="bg-amber-400 text-slate-900 px-4 py-1 rounded-full text-xs font-bold shadow-lg">
                  Popular
                </span>
              </div>
            )}
            {plan.enterprise && (
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <span className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg">
                  🌟 Exclusivo
                </span>
              </div>
            )}

            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2 text-slate-900">{plan.name}</h3>
              <p className="text-sm text-slate-600 mb-4">{plan.description}</p>
              <div className="mb-4">
                <span className="text-4xl font-bold text-slate-900">${plan.price}</span>
                <span className="text-slate-600">/mes</span>
              </div>
            </div>

            <ul className="space-y-3 mb-8 min-h-[240px]">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-start text-sm">
                  <svg className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-slate-700">{feature}</span>
                </li>
              ))}
            </ul>

            {currentSubscription?.subscription.plan === plan.name ? (
              <button disabled className="w-full px-6 py-3 bg-slate-200 text-slate-600 rounded-lg cursor-not-allowed font-semibold">
                Plan Actual
              </button>
            ) : (
              <button
                onClick={() => plan.name !== 'FREE' && handleUpgrade(plan.name)}
                disabled={plan.name === 'FREE'}
                className={`w-full px-6 py-3 rounded-lg font-semibold transition-colors ${
                  plan.name === 'FREE'
                    ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                    : plan.enterprise
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700 shadow-lg'
                    : plan.popular
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                }`}
              >
                {plan.name === 'FREE' ? 'Plan Gratuito' : 'Actualizar Plan'}
              </button>
            )}
          </div>
        ))}
      </div>

    </div>
  );
};

export default SubscriptionPage;

