import { OcrField, OcrFieldReviewState } from '../types';

export const getConfidenceColor = (confidence: number): string => {
  if (confidence >= 0.8) return 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30';
  if (confidence >= 0.5) return 'bg-amber-500/20 text-amber-500 border-amber-500/30';
  return 'bg-rose-500/20 text-rose-500 border-rose-500/30';
};

export const getReviewStateBadge = (state: OcrFieldReviewState) => {
  switch (state) {
    case OcrFieldReviewState.Confirmed:
      return { label: 'Confirmado', className: 'bg-blue-500/20 text-blue-500 border-blue-500/30' };
    case OcrFieldReviewState.Corrected:
      return { label: 'Corregido', className: 'bg-purple-500/20 text-purple-500 border-purple-500/30' };
    case OcrFieldReviewState.Absent:
      return { label: 'Ausente', className: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30' };
    case OcrFieldReviewState.Unreviewed:
    default:
      return { label: 'Pendiente', className: 'bg-orange-500/20 text-orange-500 border-orange-500/30' };
  }
};

export const isFieldReviewed = (state: OcrFieldReviewState): boolean => {
  return state !== OcrFieldReviewState.Unreviewed;
};

export const canSubmitReview = (fields: Record<string, OcrField>): boolean => {
  return Object.values(fields).every(field => isFieldReviewed(field.reviewState));
};
