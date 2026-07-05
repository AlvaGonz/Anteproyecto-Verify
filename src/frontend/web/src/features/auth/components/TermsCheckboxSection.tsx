import React from "react";
import type { UseFormRegister, FieldErrors } from "react-hook-form";
import type { RegisterFormValues } from "../schemas";

export interface TermsCheckboxSectionProps {
  register: UseFormRegister<RegisterFormValues>;
  formErrors: FieldErrors<RegisterFormValues>;
  openModal: (type: "terms" | "privacy") => void;
}

export const TermsCheckboxSection: React.FC<TermsCheckboxSectionProps> = ({ register, formErrors, openModal }) => (
  <div className="pb-2 pt-2 relative">
    <label className="flex gap-3 cursor-pointer group">
      <input
        type="checkbox"
        className="mt-1 w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
        {...register("acceptedTerms")}
      />
      <span className="text-[13px] text-text-secondary leading-relaxed group-hover:text-text-primary transition-colors">
        Acepto los{" "}
        <button
          type="button"
          onClick={() => openModal("terms")}
          className="font-bold text-primary hover:underline bg-transparent border-none p-0 cursor-pointer inline"
        >
          términos de uso
        </button>{" "}
        y la{" "}
        <button
          type="button"
          onClick={() => openModal("privacy")}
          className="font-bold text-primary hover:underline bg-transparent border-none p-0 cursor-pointer inline"
        >
          política de privacidad
        </button>
        .
      </span>
    </label>
    {formErrors.acceptedTerms && (
      <span className="text-rose-500 text-[10px] font-medium absolute -bottom-3 left-7">
        {formErrors.acceptedTerms.message}
      </span>
    )}
  </div>
);
