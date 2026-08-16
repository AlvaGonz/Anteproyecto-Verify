// react-doctor-disable no-giant-component
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "react-router-dom";
import { registerSchema, type RegisterFormValues } from "../schemas";
import { useRegister } from "../api/useAuth";
import { VerificationEmailActions } from "./VerificationEmailActions";
import { RegisterFormLayout } from "./RegisterFormLayout";

const blockNonDigits = (e: React.KeyboardEvent<HTMLInputElement>) => {
  const allowedKeys = ["Backspace", "Tab", "ArrowLeft", "ArrowRight", "Delete", "Enter"];
  if (!allowedKeys.includes(e.key) && !/^[0-9]$/.test(e.key)) {
    e.preventDefault();
  }
};

export const RegisterForm = () => {
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect');
  const { mutate: register_, isPending, error } = useRegister();
  const [modalType, setModalType] = useState<"terms" | "privacy" | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const [documentType, setDocumentType] = useState<"cedula" | "rnc">("cedula");
  const [isRncValid, setIsRncValid] = useState<boolean | null>(null);
  const [isValidatingRnc, setIsValidatingRnc] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    formState: { errors: formErrors, isValid },
  } = useForm<RegisterFormValues>({ 
    resolver: zodResolver(registerSchema),
    mode: "onChange",
    defaultValues: { documentType: "cedula" }
  });

  const toggleDocumentType = () => {
    const newType = documentType === "cedula" ? "rnc" : "cedula";
    setDocumentType(newType);
    // Set value without immediate validation to free the main thread for the 60fps animation
    setValue("documentType", newType, { shouldValidate: false });
    
    if (newType === "cedula") {
      setValue("rnc", undefined);
      setIsRncValid(null);
    } else {
      setValue("cedula", undefined);
    }

    // Trigger validation asynchronously after the animation starts
    setTimeout(() => {
      setValue("documentType", newType, { shouldValidate: true });
    }, 100);
  };

  const rncValue = watch("rnc");

  useEffect(() => {
    if (documentType !== "rnc" || !rncValue || rncValue.length < 9) {
      setIsRncValid(null);
      setIsValidatingRnc(false);
      return;
    }
    const timer = setTimeout(async () => {
      setIsValidatingRnc(true);
      try {
        const response = await fetch(`/api/dgii/rnc/${rncValue}`);
        if (response.ok) {
          setIsRncValid(true);
        } else {
          setIsRncValid(false);
        }
      } catch (err) {
        setIsRncValid(false);
      } finally {
        setIsValidatingRnc(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [rncValue, documentType]);

const onSubmit = (data: RegisterFormValues) => {
     if (documentType === "rnc" && isRncValid !== true) {
       setError("rnc", { type: "manual", message: "Debe ser un RNC válido en la DGII." });
       return;
     }

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
    const { acceptedTerms, ...restData } = data;
    const submitData = {
      ...restData,
      telefono: data.telefono ? data.telefono.replace(/\D/g, '') : "",
      cedula: data.cedula ? data.cedula.replace(/\D/g, '') : "",
      rnc: data.rnc ? data.rnc.trim() : "",
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

const password = (watch("password") as string) || "";
   const checks = [
    { label: "Mínimo 8 caracteres", passed: password.length >= 8 },
    { label: "Al menos 1 Mayúscula", passed: /[A-Z]/.test(password) },
    { label: "Al menos 1 Minúscula", passed: /[a-z]/.test(password) },
    { label: "Al menos 1 Número", passed: /[0-9]/.test(password) },
    { label: "Al menos 1 Carácter Especial (!@#$%^&*-)", passed: /[!@#$%^&*\-]/.test(password) },
   ];

  const telefonoOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
    let formatted = digits;
    if (digits.length > 6) formatted = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    else if (digits.length > 3) formatted = `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    else if (digits.length > 0) formatted = `(${digits}`;
    e.target.value = formatted;
  };

  const cedulaOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 3 && val.length <= 10) val = `${val.slice(0, 3)}-${val.slice(3)}`;
    else if (val.length > 10) val = `${val.slice(0, 3)}-${val.slice(3, 10)}-${val.slice(10, 11)}`;
    e.target.value = val;
  };

  const rncOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // raw value without formatting, per user request
    const val = e.target.value;
    e.target.value = val;
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
      telefonoOnChange={telefonoOnChange}
      blockNonDigits={blockNonDigits}
      cedulaOnChange={cedulaOnChange}
      rncOnChange={rncOnChange}
      documentType={documentType}
      toggleDocumentType={toggleDocumentType}
      isRncValid={isRncValid}
      isValidatingRnc={isValidatingRnc}
      openModal={openModal}
      closeModal={closeModal}
      acceptAndCloseModal={acceptAndCloseModal}
      isPending={isPending}
      isValid={isValid}
      modalType={modalType}
    />
  );
};
