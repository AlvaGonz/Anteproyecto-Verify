import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const consentSchema = z.object({
  accepted: z.literal(true, {
    error: () => 'Debe aceptar los términos para continuar',
  }),
});

type ConsentFormValues = z.infer<typeof consentSchema>;

interface SubscriptionConsentCheckboxProps {
  plan: string;
  billing: string;
  onConsent: (data: { timestamp: string; userAgent: string }) => void;
}

export const SubscriptionConsentCheckbox: React.FC<SubscriptionConsentCheckboxProps> = ({
  billing,
  onConsent,
}) => {
  
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ConsentFormValues>({
    resolver: zodResolver(consentSchema),
    defaultValues: {
      accepted: undefined,
    },
    mode: 'onChange'
  });

  const onSubmit = (data: ConsentFormValues) => {
    if (data.accepted) {
      onConsent({
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
      });
    }
  };

  const billingCycleText = billing === 'yearly' ? 'año' : 'mes';
  // Fallback text if translation doesn't handle interpolation or is missing
  const consentLabel = `He leído y acepto los Términos de Servicio, la Política de Privacidad y la Política de Facturación de VeriFinca. Autorizo el cobro automático cada ${billingCycleText}.`;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full">
      <h2 className="text-2xl font-headline font-bold text-on-surface mb-6">Términos de Facturación</h2>
      
      <p className="text-sm font-body text-on-surface-variant mb-6 leading-relaxed">
        Antes de procesar tu pago, necesitamos tu confirmación expresa según la <strong>Ley 172-13</strong>. 
        Este paso es obligatorio para activar tu suscripción y autorizar cobros automáticos.
      </p>

      <div className="bg-surface-variant/30 border border-outline-variant/40 rounded-xl p-5 mb-6">
        <div className="flex items-start gap-3">
          <div className="flex items-center h-5 mt-0.5">
            <input
              id="consent-checkbox"
              type="checkbox"
              {...register('accepted')}
              className="w-4 h-4 text-primary bg-surface-container border-outline rounded focus:ring-primary focus:ring-2"
            />
          </div>
          <div className="text-sm font-body text-on-surface-variant">
            <label htmlFor="consent-checkbox" className="font-medium text-on-surface cursor-pointer leading-snug block mb-2">
              {consentLabel}
            </label>
            <p className="text-xs text-on-surface-variant/80">
              {billing === 'yearly' ? 'Los planes anuales no son reembolsables después de 30 días.' : ''}
            </p>
          </div>
        </div>
      </div>

      {errors.accepted && (
        <div className="flex items-center gap-2 text-error text-sm font-medium mb-6 bg-error/10 p-3 rounded-lg border border-error/20">
          <span className="material-symbols-outlined text-[18px]">error</span>
          <p>{errors.accepted.message}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={!isValid}
        className="w-full bg-primary hover:bg-primary/90 text-on-primary font-label font-bold py-3.5 px-4 rounded-lg shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex justify-center items-center gap-2 btn-interact"
      >
        Aceptar y Continuar al Pago
        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
      </button>

      <div className="mt-6 flex flex-col items-center justify-center gap-2 text-[11px] text-on-surface-variant/60 text-center font-body">
        <span className="material-symbols-outlined text-[18px] opacity-70">gavel</span>
        <p>
          Tu dirección IP y la marca de tiempo actual 
          serán registradas en el servidor como prueba de consentimiento.
        </p>
      </div>
    </form>
  );
};
