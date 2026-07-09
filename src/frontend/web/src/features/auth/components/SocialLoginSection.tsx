import React from "react";
import { Link } from "react-router-dom";
import { GoogleSignInButton } from "./GoogleSignInButton";

export const SocialLoginSection: React.FC = () => (
  <>
    <div className="mt-8">
      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border/50"></div>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-3 bg-white text-text-secondary uppercase tracking-widest font-black text-[10px]">O CONTINUAR CON</span>
        </div>
      </div>

      <GoogleSignInButton />
    </div>

    <div className="mt-8 pt-6 border-t border-border/50 text-center">
      <p className="text-sm text-text-secondary font-medium">
        ¿Ya tienes una cuenta?{" "}
        <Link to="/login" className="text-primary font-bold hover:underline">
          Inicia sesión aquí
        </Link>
      </p>
    </div>
  </>
);
