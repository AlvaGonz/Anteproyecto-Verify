import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';

const consentSchema = z.object({
  accepted: z.literal(true, {
    errorMap: () => ({ message: 'Debe aceptar los términos para continuar' }),
  }),
});

type ConsentFormValues = z.infer<typeof consentSchema>;

interface SubscriptionConsentCheckboxProps {
  plan: string;
  billing: string;
  onConsent: (data: { timestamp: string; ip: string | null; userAgent: string }) => void;
}

export const SubscriptionConsentCheckbox: React.FC<SubscriptionConsentCheckboxProps> = ({
  billing,
  onConsent,
}) => {
  const { t } = useTranslation();
  const [ip, setIp] = useState<string | null>(null);

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

  useEffect(() => {
    fetch('https://api.ipify.org?format=json')
      .then((res) => res.json())
      .then((data) => setIp(data.ip))
      .catch(() => setIp('unknown'));
  }, []);

  const onSubmit = (data: ConsentFormValues) => {
    if (data.accepted) {
      onConsent({
        timestamp: new Date().toISOString(),
        ip,
        userAgent: navigator.userAgent,
      });
    }
  };

  const billingCycleText = billing === 'yearly' ? 'año' : 'mes';
  // Fallback text if translation doesn't handle interpolation or is missing
  const consentLabel = t('legal.consent.label', { planAmount: 'el monto correspondiente', billingCycle: billingCycleText }) 
    || `He leído y acepto los Términos de Servicio, la Política de Privacidad y la Política de Facturación de VeriFinca. Autorizo el cobro automático cada ${billingCycleText}.`;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-lg shadow-sm border border-outline-variant/30 max-w-2xl mx-auto my-8">
      <h3 className="text-xl font-headline font-bold text-on-surface mb-4">Confirmación de Suscripción</h3>
      
      <div className="flex items-start gap-3 mb-4">
        <div className="flex items-center h-5 mt-1">
          <input
            id="consent-checkbox"
            type="checkbox"
            {...register('accepted')}
            className="w-4 h-4 text-primary bg-surface-container border-outline rounded focus:ring-primary focus:ring-2"
          />
        </div>
        <div className="text-sm font-body text-on-surface-variant">
          <label htmlFor="consent-checkbox" className="font-medium text-on-surface cursor-pointer">
            {consentLabel}
          </label>
          <p className="mt-2 text-xs text-on-surface-variant/80">
            {t('legal.consent.annualPenaltyWarning')}
          </p>
        </div>
      </div>
      
      {errors.accepted && (
        <p className="text-error text-sm font-medium mb-4">{errors.accepted.message}</p>
      )}

      <button
        type="submit"
        disabled={!isValid}
        className="w-full bg-primary hover:bg-primary/90 text-on-primary font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Continuar al Pago
      </button>
      
      <p className="text-[11px] text-on-surface-variant/60 mt-4 text-center">
        Su dirección IP ({ip || 'cargando...'}) y la marca de tiempo serán registradas como prueba de su consentimiento conforme a la Ley 172-13.
      </p>
    </form>
  );
};
