import type { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}

export const FormField = ({
  label, htmlFor, error, required, children,
}: FormFieldProps) => (
  <div className="flex flex-col gap-1">
    <label htmlFor={htmlFor} className="block text-sm font-semibold text-on-surface-variant font-label">
      {label}
      {required && <span className="text-error ml-1" aria-hidden="true">*</span>}
    </label>
    {children}
    {error && (
      <p role="alert" className="text-xs text-error font-semibold mt-1">
        {error}
      </p>
    )}
  </div>
);
