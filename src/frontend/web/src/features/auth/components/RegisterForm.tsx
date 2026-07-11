// react-doctor-disable no-giant-component
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useSearchParams } from "react-router-dom";
import { registerSchema, type RegisterFormValues } from "../schemas";
import { useRegister } from "../api/useAuth";
import { VerificationEmailActions } from "./VerificationEmailActions";
import { usePhoneInput } from "@/shared/hooks/usePhoneInput";
import { RegisterFormLayout } from "./RegisterFormLayout";

const blockNonDigits = (e: React.KeyboardEvent<HTMLInputElement>) => {
  const allowedKeys = ["Backspace", "Tab", "ArrowLeft", "ArrowRight", "Delete", "Enter"];
  if (!allowedKeys.includes(e.key) && !/^[0-9]$/.test(e.key)) {
    e.preventDefault();
  }
};

export const RegisterForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect');
  const { mutate: register_, isPending, error } = useRegister();
  const [modalType, setModalType] = useState<"terms" | "privacy" | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors: formErrors, isValid },
  } = useForm<RegisterFormValues>({ 
    resolver: zodResolver(registerSchema),
    mode: "onChange" 
  });

const onSubmit = (data: RegisterFormValues) => {
     // Use raw digits from phone hook for submission
     const telefonoDigits = phone.digits;
     // ponytail: extract plan/billing from redirect URL so backend stores as pendingPlanCode
     let pendingPlanCode: string | undefined;
     let pendingBillingCycle: string | undefined;
     if (redirectUrl) {
       try {
         const url = new URL(redirectUrl, window.location.origin);
         pendingPlanCode = url.searchParams.get('plan') ?? undefined;
         pendingBillingCycle = url.searchParams.get('billing') ?? undefined;
       } catch (err) {
         console.warn('Invalid redirect URL, plan/billing context lost:', redirectUrl, err);
       }
     }
     const { acceptedTerms: _, ...submitData } = {
       ...data,
       telefono: telefonoDigits,
       returnUrl: redirectUrl || undefined,
       pendingPlanCode,
       pendingBillingCycle
     };
     register_(submitData, { onSuccess: () => {
       if (redirectUrl) {
         window.sessionStorage.setItem('redirect_after_verification', redirectUrl);
       }
       setIsSuccess(true);
     } });
   };

const password = watch("password") || "";
   const checks = [
    { label: "Mínimo 8 caracteres", passed: password.length >= 8 },
    { label: "Al menos 1 Mayúscula", passed: /[A-Z]/.test(password) },
    { label: "Al menos 1 Minúscula", passed: /[a-z]/.test(password) },
    { label: "Al menos 1 Número", passed: /[0-9]/.test(password) },
    { label: "Al menos 1 Carácter Especial (!@#$%^&*-)", passed: /[!@#$%^&*\-]/.test(password) },
   ];

// Phone input hook
   const phoneValueRaw = watch("telefono") ? watch("telefono").replace(/\D/g, '') : "";
   const phone = usePhoneInput(phoneValueRaw, (formattedValue) => {
     const digits = formattedValue.replace(/\D/g, '');
     setValue("telefono", digits, { shouldValidate: true, shouldDirty: true });
   });

  const cedulaOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 3 && val.length <= 10) val = `${val.slice(0, 3)}-${val.slice(3)}`;
    else if (val.length > 10) val = `${val.slice(0, 3)}-${val.slice(3, 10)}-${val.slice(10, 11)}`;
    setValue("cedula", val, { shouldValidate: true, shouldDirty: true });
  };

  const openModal = (type: "terms" | "privacy") => {
    setModalType(type);
  };

  const closeModal = () => {
    setModalType(null);
  };

  const acceptAndCloseModal = () => {
    setValue("acceptedTerms", true, { shouldValidate: true, shouldDirty: true });
    setModalType(null);
  };

  if (isSuccess) {
    return (
      <VerificationEmailActions 
        email={watch("email")} 
        redirectUrl={redirectUrl || undefined} 
        onRetryRegister={() => setIsSuccess(false)} 
      />
    );
  }

  return (
    <RegisterFormLayout
      error={error}
      handleSubmit={handleSubmit}
      onSubmit={onSubmit}
      register={register}
      formErrors={formErrors}
      password={password}
      checks={checks}
      phone={{ value: phone.value, handleChange: phone.handleChange }}
      blockNonDigits={blockNonDigits}
      cedulaOnChange={cedulaOnChange}
      openModal={openModal}
      closeModal={closeModal}
      acceptAndCloseModal={acceptAndCloseModal}
      isPending={isPending}
      isValid={isValid}
      modalType={modalType}
    />
  );
};
