import React from 'react';
import { SubscriptionInfoCard } from './SubscriptionInfoCard';
import { useMySubscription } from '../api/useSettings';



export const SubscriptionDemo: React.FC = () => {
  const { isError, error } = useMySubscription();

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
            status: (error as any)?.response?.status,
            data: (error as any)?.response?.data,
            message: error?.message,
            url: (error as any)?.config?.url,
          }, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default SubscriptionDemo;