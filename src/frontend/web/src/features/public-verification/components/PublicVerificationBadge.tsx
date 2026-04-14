import React from "react";
import { CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type VerificationStatus = "verified" | "pending" | "failed" | "observation";

interface PublicVerificationBadgeProps {
  status: VerificationStatus;
  className?: string;
  showIcon?: boolean;
}

export const PublicVerificationBadge: React.FC<PublicVerificationBadgeProps> = ({
  status,
  className,
  showIcon = true,
}) => {
  const configs = {
    verified: {
      label: "VERIFICADO",
      icon: CheckCircle2,
      classes: "bg-emerald-50 text-emerald-700 border-emerald-200",
      dot: "bg-emerald-500",
    },
    pending: {
      label: "EN PROCESO",
      icon: AlertCircle,
      classes: "bg-amber-50 text-amber-700 border-amber-200",
      dot: "bg-amber-500",
    },
    observation: {
      label: "OBSERVACIONES",
      icon: AlertCircle,
      classes: "bg-primary-subtle text-primary border-primary/20",
      dot: "bg-primary",
    },
    failed: {
      label: "NO VÁLIDO",
      icon: XCircle,
      classes: "bg-error-container text-on-error-container border-error/10",
      dot: "bg-error",
    },
  };

  const config = configs[status];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-black tracking-widest uppercase transition-all duration-300",
        config.classes,
        className
      )}
    >
      <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", config.dot)} />
      {config.label}
      {showIcon && <Icon className="w-3.5 h-3.5" />}
    </div>
  );
};
