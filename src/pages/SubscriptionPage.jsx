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
    features: ['1 evento activo', '5 tareas por evento', 'Soporte por email'],
    description: 'Ideal para comenzar',
  },
  {
    name: 'BASIC',
    price: 29,
    features: ['10 eventos activos', '50 tareas por evento', 'Matching con IA', 'Analytics básico', 'Soporte por email'],
    description: 'Para organizaciones pequeñas',
  },
  {
    name: 'PROFESSIONAL',
    price: 99,
    features: ['Eventos ilimitados', 'Tareas ilimitadas', 'IA Predictiva', 'Analytics avanzado', 'Soporte por chat'],
    description: 'Máximo impacto para tu organización',
    popular: true,
  },
];

// Plan Enterprise - Solo para clientes especiales
const enterprisePlan = {
  name: 'ENTERPRISE',
  price: 299,
  features: ['Todo PROFESSIONAL', 'Integraciones personalizadas', 'Soporte dedicado', 'SLA garantizado'],
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
  const [successMessage, setSuccessMessage] = useState(null);

  // Determinar qué planes mostrar según el usuario
  const availablePlans = useMemo(() => {
    const userEmail = user?.email || '';
    const showEnterprise = ENTERPRISE_AUTHORIZED_EMAILS.includes(userEmail);
    
    return showEnterprise ? [...basePlans, enterprisePlan] : basePlans;
  }, [user?.email]);

  useEffect(() => {
    fetchSubscription();
    
    // Verificar si viene de un checkout exitoso
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
      const sessionId = localStorage.getItem('stripe_checkout_session');
      
      if (sessionId) {
        setSuccessMessage('Verificando pago...');
        
        // Verificar y actualizar suscripción
        verifyCheckout(sessionId)
          .then(() => {
            setSuccessMessage('¡Pago procesado exitosamente! Tu suscripción ha sido actualizada.');
            setTimeout(() => setSuccessMessage(null), 5000);
          })
          .catch((err) => {
            console.error('Error al verificar checkout:', err);
            setSuccessMessage('Pago procesado. Refrescando suscripción...');
            // Intentar refrescar de todas formas
            setTimeout(() => {
              fetchSubscription();
              setTimeout(() => setSuccessMessage(null), 3000);
            }, 1000);
          });
      } else {
        setSuccessMessage('¡Pago procesado exitosamente! Refrescando suscripción...');
        setTimeout(() => {
          fetchSubscription();
          setTimeout(() => setSuccessMessage(null), 3000);
        }, 1000);
      }
      
      // Limpiar la URL
      window.history.replaceState({}, '', window.location.pathname);
    }
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
      
      // Guardar sessionId en localStorage para verificar después
      const sessionId = data?.data?.sessionId || data?.sessionId;
      if (sessionId) {
        localStorage.setItem('stripe_checkout_session', sessionId);
      }
      
      // Redirigir a Stripe Checkout
      if (data?.data?.url || data?.url) {
        window.location.href = data.data?.url || data.url;
      }
    } catch (err) {
      setError(err.message || 'Error al crear sesión de pago');
    }
  };

  const verifyCheckout = async (sessionId) => {
    try {
      const data = await authFetch('/payments/checkout/verify', {
        method: 'POST',
        body: { sessionId },
      });
      
      // Limpiar sessionId del localStorage
      localStorage.removeItem('stripe_checkout_session');
      
      // Refrescar suscripción
      await fetchSubscription();
      
      return data;
    } catch (err) {
      console.error('Error al verificar checkout:', err);
      throw err;
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
      
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 font-medium">{successMessage}</p>
        </div>
      )}

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
            
            <div className="flex gap-2">
              <button
                onClick={fetchSubscription}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm"
                title="Refrescar suscripción"
              >
                🔄 Actualizar
              </button>
              
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

            {(() => {
              const currentPlan = currentSubscription?.subscription?.plan?.toUpperCase();
              const planName = plan.name.toUpperCase();
              const isCurrentPlan = currentPlan === planName;
              
              return isCurrentPlan ? (
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
              );
            })()}
          </div>
        ))}
      </div>

    </div>
  );
};

export default SubscriptionPage;

