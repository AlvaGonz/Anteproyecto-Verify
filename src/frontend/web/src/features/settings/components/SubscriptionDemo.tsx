import React from 'react';
import { SubscriptionInfoCard } from './SubscriptionInfoCard';
import { useMySubscription } from '../api/useSettings';

const MOCK_DATA = {
  plan: 'empresa',
  planPrice: 99,
  subscriptionStatus: 'active',
  currentPeriodEnd: '2026-08-20T00:03:36.0000000',
  stripeSubscriptionId: 'sub_1Tv4gIIlzw9mY1SE1S0qY6KN',
  isManagedByStripe: true,
  billingCycle: 'month',
  isGuest: false,
  inviterPlan: undefined,
  inviterName: undefined,
  planLimits: {
    maxConsultas: -1,
    maxProyectos: -1,
    presentacionPublica: true,
    qrIncluido: true,
    maxUsuariosSecundarios: 5,
    maxAlmacenamientoMb: 10240,
    alertasTiempoReal: true,
    modeloLm: true,
    validacionLote: true,
    exportacionExcel: true,
    exportacionPdf: true,
    integracionCrm: true,
    soporteTipo: 'Prioritario 24/7',
    accesoApi: true,
    consultasUsadas: 142,
    proyectosCreados: 8,
  },
};

export const SubscriptionDemo: React.FC = () => {
  const { data, isLoading, isError, error, refetch } = useMySubscription();

  const useMock = false;

  if (useMock) {
    return (
      <div className="p-8">
        <h2 className="text-2xl font-bold text-[#223382] mb-6">Demo: Subscription Info Card (Mock Data)</h2>
        <SubscriptionInfoCard />
      </div>
    );
  }

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-[#223382] mb-6">Subscription Settings</h2>
      <SubscriptionInfoCard />
      {isError && (
        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">
          <strong>Debug Info:</strong>
          <pre className="mt-2 text-xs overflow-auto max-h-40">{JSON.stringify({
            status: error?.response?.status,
            data: error?.response?.data,
            message: error?.message,
            url: error?.config?.url,
          }, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default SubscriptionDemo;