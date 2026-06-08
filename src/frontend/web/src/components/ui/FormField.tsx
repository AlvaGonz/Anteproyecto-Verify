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
    <label htmlFor={htmlFor} className="text-sm font-medium text-gray-700">
      {label}
      {required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
    </label>
    {children}
    {error && (
      <p role="alert" className="text-xs text-red-600 mt-0.5">
        {error}
      </p>
    )}
  </div>
);
