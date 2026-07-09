import { useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { useAuth } from "../../../shared/context/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { isSubscriptionActive } from "../../pricing/utils/planPermissions";
import { Loader2 } from "lucide-react";

export const GoogleSignInButton = () => {
  const { googleLogin } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get("redirect");
  
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setIsPending(true);
        setError(null);
        // Enviamos el access_token al backend
        const user = await googleLogin(tokenResponse.access_token);
        
        if (redirectUrl) {
          navigate(redirectUrl);
        } else if (user?.pendingPlanCode && !isSubscriptionActive(user.subscriptionStatus)) {
          navigate(`/checkout?plan=${user.pendingPlanCode}&billing=${user.pendingBillingCycle || 'monthly'}`);
        } else {
          navigate("/admin/dashboard");
        }
      } catch (err: any) {
        setError(err?.message || "Error de autenticación con Google.");
        setIsPending(false);
      }
    },
    onError: () => {
      setError("El inicio de sesión con Google falló.");
      setIsPending(false);
    }
  });

  return (
    <div className="w-full flex flex-col items-center">
      {error && (
        <div className="w-full mb-4 p-3 bg-rose-50 border-l-4 border-rose-500 text-rose-700 rounded text-sm font-medium animate-in fade-in duration-200">
          {error}
        </div>
      )}
      
      {isPending ? (
        <div className="w-full h-[52px] border-[1.5px] border-border rounded-[8px] flex items-center justify-center gap-3 font-sans font-medium text-text-secondary bg-surface-raised transition-all shadow-sm">
          <Loader2 className="w-5 h-5 animate-spin" />
          Procesando...
        </div>
      ) : (
        <button
          type="button"
          onClick={() => login()}
          className="w-full h-[52px] flex items-center justify-center gap-3 bg-white border-[1.5px] border-border rounded-[8px] text-text-primary font-medium hover:bg-surface-raised transition-colors focus:outline-none focus:ring-4 focus:ring-primary/20 shadow-sm"
        >
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
          </svg>
          Continuar con Google
        </button>
      )}
    </div>
  );
};
