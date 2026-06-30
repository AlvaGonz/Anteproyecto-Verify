import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import apiClient from '../../../infrastructure/api/client';

export const CheckoutReturnPage = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    if (!sessionId) {
      setStatus('error');
      return;
    }

    const checkStatus = async () => {
      try {
        const response = await apiClient.get(`/v1/subscriptions/session-status?sessionId=${sessionId}`);
        if (response.data.status === 'complete') {
          setStatus('success');
        } else {
          setStatus('error');
        }
      } catch (err) {
        setStatus('error');
      }
    };
    checkStatus();
  }, [sessionId]);

  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-gray-600">Verificando estado del pago...</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col h-screen items-center justify-center gap-4">
        <p className="text-red-500 font-bold text-xl">Hubo un problema con el pago.</p>
        <button
          onClick={() => navigate('/precios')}
          className="px-6 py-2 bg-primary text-white rounded hover:bg-primary-hover"
        >
          Volver a planes
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen items-center justify-center gap-4 bg-green-50">
      <div className="text-green-600 text-5xl mb-4">✓</div>
      <h1 className="text-3xl font-bold text-green-700">¡Pago Exitoso!</h1>
      <p className="text-gray-700">Tu suscripción ha sido activada.</p>
      <button
        onClick={() => navigate('/dashboard')}
        className="mt-6 px-6 py-2 bg-primary text-white rounded hover:bg-primary-hover shadow-md"
      >
        Ir a mi Dashboard
      </button>
    </div>
  );
};
