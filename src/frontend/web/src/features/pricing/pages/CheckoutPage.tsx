import { useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';
import { getStripePriceId, PlanId, BillingCycle } from '../utils/stripePriceMap';
import apiClient from '../../../infrastructure/api/client';
import { useAuth } from '../../../shared/context/AuthContext';
import { SubscriptionConsentCheckbox } from '../components/SubscriptionConsentCheckbox';

// Load Stripe outside component to avoid recreating it
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

export const CheckoutPage = () => {
  const [searchParams] = useSearchParams();
  const plan = searchParams.get('plan') as PlanId;
  const billing = searchParams.get('billing') as BillingCycle;
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [hasConsented, setHasConsented] = useState<boolean>(false);
  const [consentData, setConsentData] = useState<{ timestamp: string; ip: string | null; userAgent: string } | null>(null);

  const fetchClientSecret = useCallback(async () => {
    try {
      const priceId = getStripePriceId(plan, billing);
      // Calls backend: POST /api/v1/subscriptions/create-session
      const response = await apiClient.post('/v1/subscriptions/create-session', {
        priceId,
        userId: user?.id || '',
        consent: consentData
      });
      return response.data.clientSecret;
    } catch (err: any) {
      console.error('Error creating checkout session', err);
      setError('Error al iniciar el proceso de pago. Por favor intente más tarde.');
      throw err;
    }
  }, [plan, billing, user?.id]);

  if (!plan || !billing) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-red-500">Plan o ciclo de facturación inválido.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pt-20">
      <div className="max-w-4xl mx-auto w-full p-4">
        <h1 className="text-2xl font-bold mb-6 text-center text-primary">Completar Suscripción</h1>
        {!hasConsented ? (
          <SubscriptionConsentCheckbox 
            plan={plan}
            billing={billing}
            onConsent={(data) => {
              setConsentData(data);
              setHasConsented(true);
            }} 
          />
        ) : (
          <div id="checkout" className="bg-white rounded-lg shadow-sm p-4 animate-in fade-in duration-500">
            <EmbeddedCheckoutProvider stripe={stripePromise} options={{ fetchClientSecret }}>
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          </div>
        )}
      </div>
    </div>
  );
};
