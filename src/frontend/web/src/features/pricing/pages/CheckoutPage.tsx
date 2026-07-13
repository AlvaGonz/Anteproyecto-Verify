import { useState, useCallback, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';
import { getStripePriceId, PlanId, BillingCycle } from '../utils/stripePriceMap';
import apiClient from '../../../infrastructure/api/client';

import { SubscriptionConsentCheckbox } from '../components/SubscriptionConsentCheckbox';
import { useTranslation } from 'react-i18next';

// Load Stripe outside component to avoid recreating it
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

const PLAN_DETAILS: Record<PlanId, { name: string, priceMonthly: string, priceYearly: string, features: string[] }> = {
  profesional: {
    name: 'Profesional',
    priceMonthly: '$60 USD',
    priceYearly: '$48 USD',
    features: [
      'pricing.cards.pro.feature1',
      'pricing.cards.pro.feature2',
      'pricing.cards.pro.feature3',
      'pricing.cards.pro.feature4',
    ]
  },
  empresa: {
    name: 'Empresa',
    priceMonthly: '$170 USD',
    priceYearly: '$136 USD',
    features: [
      'pricing.cards.empresa.feature1',
      'pricing.cards.empresa.feature2',
      'pricing.cards.empresa.feature3',
      'pricing.cards.empresa.feature4',
    ]
  },
  corporativo: {
    name: 'Corporativo',
    priceMonthly: '$500 USD',
    priceYearly: '$400 USD',
    features: [
      'pricing.cards.corporativo.feature1',
      'pricing.cards.corporativo.feature2',
      'pricing.cards.corporativo.feature3',
      'pricing.cards.corporativo.feature4',
    ]
  }
};

export const CheckoutPage = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const plan = searchParams.get('plan') as PlanId;
  const billing = searchParams.get('billing') as BillingCycle;
  const source = searchParams.get('source');
  const navigate = useNavigate();

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    if (source === 'settings') {
      navigate('/admin/settings');
    } else if (source === 'portal') {
      navigate('/admin/dashboard');
    } else {
      navigate('/plans');
    }
  };
  const [error, setError] = useState<string | null>(null);
  const [hasConsented, setHasConsented] = useState<boolean>(false);
  const [consentData, setConsentData] = useState<{ timestamp: string; userAgent: string } | null>(null);

  const planInfo = useMemo(() => PLAN_DETAILS[plan], [plan]);
  const isAnnual = billing === 'yearly';

  const fetchClientSecret = useCallback(async () => {
    try {
      const priceId = getStripePriceId(plan, billing);
      // Calls backend: POST /api/v1/subscriptions/create-session
      const response = await apiClient.post('/v1/subscriptions/create-session', {
        priceId,
        planCode: plan,
        billingCycle: billing,
        consent: consentData
      });
      return response.data.clientSecret;
    } catch (err: any) {
      console.error('Error creating checkout session', err);
      setError('Error al iniciar el proceso de pago. Por favor intente más tarde.');
      throw err;
    }
  }, [plan, billing, consentData]);

  if (!plan || !billing || !planInfo) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-error text-lg font-medium mb-4">Plan o ciclo de facturación inválido.</p>
          <button onClick={handleBack} className="text-primary hover:underline font-medium">Volver a Planes</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col lg:flex-row">
      {/* Left Column: Order Summary */}
      <div className="w-full lg:w-2/5 bg-surface-variant/30 border-r border-outline-variant/30 p-8 lg:p-16 flex flex-col pt-24 lg:pt-32">
        <button onClick={handleBack} className="flex items-center text-sm font-medium text-on-surface-variant hover:text-primary mb-12 transition-colors w-fit">
          <span className="material-symbols-outlined text-[18px] mr-1">arrow_back</span>
          Volver a planes
        </button>

        <div className="flex-grow">
          <span className="inline-block text-primary font-label font-bold text-xs tracking-wider uppercase mb-3">
            Resumen de compra
          </span>
          <h1 className="text-3xl lg:text-4xl font-headline font-bold text-on-surface mb-2">
            Plan {planInfo.name}
          </h1>
          <p className="text-on-surface-variant font-body mb-10">
            Ciclo de facturación: <span className="font-semibold text-on-surface">{isAnnual ? 'Anual' : 'Mensual'}</span>
          </p>

          <div className="bg-surface rounded-xl p-6 border border-outline-variant/30 shadow-sm mb-10">
            <div className="flex items-baseline mb-1">
              <span className="text-4xl font-headline font-extrabold text-on-surface">
                {isAnnual ? planInfo.priceYearly : planInfo.priceMonthly}
              </span>
              <span className="text-on-surface-variant text-sm ml-2">/ mes</span>
            </div>
            {isAnnual && (
              <p className="text-sm font-medium text-primary mt-2">Facturado anualmente. Ahorras 20%.</p>
            )}

            <hr className="border-outline-variant/30 my-6" />

            <h4 className="font-label font-semibold text-on-surface mb-4">Qué incluye:</h4>
            <ul className="space-y-3 font-body text-sm text-on-surface-variant">
              {planInfo.features.map((featureKey, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">check_circle</span>
                  <span dangerouslySetInnerHTML={{ __html: t(featureKey) }} />
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 text-sm text-on-surface-variant/70 font-body">
          <p className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-[16px]">lock</span>
            Pagos seguros procesados por Stripe
          </p>
          <p>Tus datos están encriptados y no los almacenamos.</p>
        </div>
      </div>

      {/* Right Column: Checkout / Action Area */}
      <div className="w-full lg:w-3/5 bg-surface p-8 lg:p-16 flex flex-col justify-center items-center pt-16 lg:pt-32 relative">
        <div className="w-full max-w-lg">
          {error ? (
            <div className="bg-error/10 border border-error/20 rounded-lg p-6 text-center">
              <span className="material-symbols-outlined text-error text-4xl mb-3">error</span>
              <p className="text-error font-medium mb-4">{error}</p>
              <button type="button"
                onClick={() => setError(null)}
                className="bg-error text-onError px-6 py-2 rounded-lg font-bold text-sm hover:bg-error/90 transition-colors"
              >
                Reintentar
              </button>
            </div>
          ) : !hasConsented ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <SubscriptionConsentCheckbox
                plan={plan}
                billing={billing}
                onConsent={(data) => {
                  setConsentData(data);
                  setHasConsented(true);
                }}
              />
            </div>
          ) : (
            <div id="checkout" className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
              <div className="mb-6 flex justify-between items-center">
                <h2 className="text-2xl font-headline font-bold text-on-surface">Información de pago</h2>
                <button type="button"
                  onClick={() => setHasConsented(false)}
                  className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors flex items-center"
                >
                  <span className="material-symbols-outlined text-[16px] mr-1">edit</span>
                  Editar términos
                </button>
              </div>
              <EmbeddedCheckoutProvider stripe={stripePromise} options={{ fetchClientSecret }}>
                <EmbeddedCheckout />
              </EmbeddedCheckoutProvider>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

