import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield, Mail, Lock, ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../features/auth/context/AuthContext";
import { useToast } from "../../shared/components/ui/Toast/ToastContext";

export const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await login(email, password);
      addToast("Bienvenido de nuevo a VeriFinca", "success");
      navigate("/admin/dashboard");
    } catch (error) {
      addToast("Error de autenticación. Verifique sus credenciales.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F1EC] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Premium Background Elements */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 90, 0],
          x: [0, 50, 0]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] pointer-events-none"
      />
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          x: [0, -30, 0],
          y: [0, 40, 0]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[100px] pointer-events-none"
      />

      {/* Logo Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Link to="/" className="flex items-center gap-3 mb-10 group">
          <img
            src="/brand/logotipo/LOGOTIPO.svg"
            alt="VeriFinca"
            className="h-20 w-auto"
          />
        </Link>
      </motion.div>

      {/* Main Login Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-full max-w-md vf-glass-card rounded-[24px] p-8 md:p-12 relative z-10"
      >
        <div className="mb-10 text-center">
          <h1 className="h1 text-secondary mb-3">Acceso al Portal</h1>
          <p className="body text-text-secondary">Ingrese sus credenciales para continuar.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="label-lg text-secondary ml-1">Correo Electrónico</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-border" />
              <input
                type="email"
                placeholder="ejemplo@verifinca.com"
                className="vf-input w-full pl-12 h-[52px]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label className="label-lg text-secondary">Contraseña</label>
              <button type="button" className="text-[12px] font-medium text-primary hover:underline">
                ¿Olvidó su contraseña?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-border" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="vf-input w-full pl-12 pr-12 h-[52px]"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-border hover:text-secondary transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 py-2">
            <input
              type="checkbox"
              id="remember"
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20 cursor-pointer"
            />
            <label htmlFor="remember" className="text-[14px] font-medium text-text-secondary cursor-pointer select-none">
              Mantener sesión iniciada
            </label>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={submitting}
            className="vf-btn-primary w-full h-[56px] text-[16px] font-bold shadow-floating"
          >
            <AnimatePresence mode="wait">
              {submitting ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Autenticando...
                </motion.div>
              ) : (
                <motion.div
                  key="normal"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  Iniciar Sesión Segura <ArrowRight className="w-5 h-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </form>

        <div className="mt-10 pt-8 border-t border-border/50 text-center">
          <p className="body text-[14px]">
            ¿No tiene acceso aún?{" "}
            <Link to="/register" className="text-secondary font-bold hover:underline">
              Contactar Soporte
            </Link>
          </p>
        </div>
      </motion.div>

      {/* Footer Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-12 flex flex-col items-center gap-2"
      >
        <p className="text-[12px] text-border font-bold uppercase tracking-widest">
          Dominican Real Estate Integrity Protocol
        </p>
        <div className="flex gap-4 text-[11px] font-medium text-border/80">
          <a href="#" className="hover:text-secondary">Términos</a>
          <a href="#" className="hover:text-secondary">Privacidad</a>
          <a href="#" className="hover:text-secondary">Seguridad</a>
        </div>
      </motion.div>
    </div>
  );
};
