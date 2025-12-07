import { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';
import useApi from '../hooks/useApi';
import { useAuth } from '../hooks/useAuth';

const plans = [
  {
    name: 'FREE',
    price: 0,
    features: ['1 evento activo', '5 tareas por evento', 'Soporte por email'],
  },
  {
    name: 'BASIC',
    price: 29,
    features: ['10 eventos activos', '50 tareas por evento', 'Matching con IA', 'Analytics básico', 'Soporte por email'],
  },
  {
    name: 'PROFESSIONAL',
    price: 99,
    features: ['Eventos ilimitados', 'Tareas ilimitadas', 'IA Predictiva', 'Analytics avanzado', 'Soporte por chat'],
    popular: true,
  },
  {
    name: 'ENTERPRISE',
    price: 299,
    features: ['Todo PROFESSIONAL', 'Integraciones personalizadas', 'Soporte dedicado', 'SLA garantizado'],
  },
];

const SubscriptionPage = () => {
  const api = useApi();
  const { authFetch } = useAuth();
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`bg-white rounded-lg shadow-lg p-6 ${
              plan.popular ? 'ring-2 ring-blue-500 relative' : ''
            }`}
          >
            {plan.popular && (
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-xs font-semibold">
                  Más Popular
                </span>
              </div>
            )}

            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold">${plan.price}</span>
                <span className="text-gray-600">/mes</span>
              </div>
            </div>

            <ul className="space-y-3 mb-6">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-start text-sm">
                  <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>

            {currentSubscription?.subscription.plan === plan.name ? (
              <button disabled className="w-full px-4 py-2 bg-gray-300 text-gray-600 rounded-lg cursor-not-allowed">
                Plan Actual
              </button>
            ) : (
              <button
                onClick={() => plan.name !== 'FREE' && handleUpgrade(plan.name)}
                disabled={plan.name === 'FREE'}
                className={`w-full px-4 py-2 rounded-lg font-semibold ${
                  plan.name === 'FREE'
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {plan.name === 'FREE' ? 'Plan Gratuito' : 'Actualizar'}
              </button>
            )}
          </div>
        ))}
      </div>

    </div>
  );
};

export default SubscriptionPage;

