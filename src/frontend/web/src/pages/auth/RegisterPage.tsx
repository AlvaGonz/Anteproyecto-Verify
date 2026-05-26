import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, ArrowRight, CheckCircle2, Loader2, ShieldCheck, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "../../shared/components/ui/Toast/ToastContext";

export const RegisterPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { addToast } = useToast();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Trigger the real backend email integration endpoint for UC-01
      const response = await fetch("http://localhost:5000/api/email-test/uc-01-account-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: email.toLowerCase(), name })
      });
      
      if (!response.ok) {
        let errorMsg = `Error ${response.status}: No se pudo enviar el correo de verificación.`;
        try {
          const errorJson = await response.json();
          if (errorJson && errorJson.error) {
            errorMsg = errorJson.error;
          }
        } catch {}
        throw new Error(errorMsg);
      }

      addToast("Cuenta registrada. Correo de verificación enviado exitosamente.", "success");
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err: any) {
      console.error("Failed to call backend email verification endpoint:", err);
      addToast(err.message || "Error al conectar con el servidor backend.", "error");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6">
        <div className="vf-glass p-12 rounded-2xl text-center max-w-lg animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-success-container text-success rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-display font-extrabold text-[#223382] mb-4">Solicitud Enviada</h1>
          <p className="text-on-surface-variant text-lg leading-relaxed mb-8">
            Tu solicitud de acceso profesional está siendo revisada por nuestro equipo técnico. Recibirás un correo de confirmación en las próximas 24 horas.
          </p>
          <div className="flex flex-col items-center gap-4">
            <span className="text-sm font-semibold text-primary">Redirigiendo al inicio de sesión...</span>
            <Link to="/login" className="text-secondary font-bold hover:underline">Ir ahora</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F1EC] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Decor */}
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

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10"
      >
        {/* Logo moved into sidebar */}

      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-full max-w-5xl bg-white border border-border rounded-[32px] shadow-premium flex flex-col md:flex-row overflow-hidden relative z-10"
      >
        {/* Left Side: Info */}
        <div className="w-full md:w-[400px] bg-[#223382] p-12 text-white relative flex flex-col justify-between overflow-hidden">
          {/* Subtle geometric pattern */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-[-10%] right-[-10%] w-64 h-64 border-2 border-white rounded-full" />
            <div className="absolute bottom-[-5%] left-[-5%] w-48 h-48 border border-white rounded-full opacity-50" />
          </div>

          <div className="relative z-10 flex flex-col h-full">
            <div className="mb-10">
              <Link to="/" className="inline-block mb-10 group transition-transform hover:scale-[1.02]">
                <img
                  src="/brand/logotipo/LOGOTIPO WHITE.svg"
                  alt="VeriFinca Logo"
                  className="h-10 w-auto"
                />
              </Link>
              <div className="inline-block px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-[10px] font-black uppercase tracking-widest text-primary-light mb-4">
                Plataforma Certificada
              </div>
              <h2 className="text-4xl font-display font-black leading-[1.1] mb-6 tracking-tighter !text-white">
                Integridad <br />
                <span className="text-primary-light">en cada m².</span>
              </h2>

              <p className="text-base text-white/70 leading-relaxed font-medium max-w-[280px]">
                La solución definitiva para la validación y gestión de proyectos inmobiliarios institucionales.
              </p>
            </div>

            <div className="space-y-8 flex-1">
              <div className="flex gap-5 group cursor-default">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 group-hover:border-primary/30 transition-all duration-300">
                  <ShieldCheck className="w-6 h-6 text-primary-light" />
                </div>
                <div className="flex flex-col justify-center">
                  <h4 className="font-display font-bold text-[15px] leading-tight mb-1 !text-white">Cifrado de Extremo a Extremo</h4>
                  <p className="text-xs text-white/80 leading-normal">Sus datos están protegidos por estándares globales de seguridad.</p>
                </div>
              </div>

              <div className="flex gap-5 group cursor-default">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 group-hover:border-primary/30 transition-all duration-300">
                  <Zap className="w-6 h-6 text-primary-light" />
                </div>
                <div className="flex flex-col justify-center">
                  <h4 className="font-display font-bold text-[15px] leading-tight mb-1 !text-white">Acceso Instantáneo</h4>
                  <p className="text-xs text-white/80 leading-normal">Infraestructura optimizada para una respuesta inmediata.</p>
                </div>
              </div>
            </div>

            <div className="pt-8 mt-12 border-t border-white/10">
              <div className="flex items-center gap-4">
                <div className="flex -space-x-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-[#223382] bg-surface-variant/20 backdrop-blur-sm flex items-center justify-center text-[9px] font-black text-primary-light shadow-lg">PRO</div>
                  ))}
                </div>
                <div>
                  <p className="text-[11px] font-bold text-white/80 leading-tight">Únete a la red</p>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest font-black">+250 PROFESIONALES</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="flex-1 p-12">
          <div className="mb-10 text-center md:text-left">
            <h3 className="text-2xl font-display font-extrabold text-[#223382] tracking-tight">Crear Cuenta</h3>
            <p className="text-text-secondary mt-1">Completa tus datos profesionales para comenzar</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="relative col-span-2">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-border" />
                <input 
                  type="text" 
                  placeholder="Nombre completo" 
                  className="vf-input w-full pl-12 h-[52px]" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required 
                />
              </div>
            </div>

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-border" />
              <input 
                type="email" 
                placeholder="Correo electrónico" 
                className="vf-input w-full pl-12 h-[52px]" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-border" />
              <input 
                type="password" 
                placeholder="Contraseña de acceso" 
                className="vf-input w-full pl-12 h-[52px]" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>

            <div className="pb-2 pt-2">
              <label className="flex gap-3 cursor-pointer group">
                <input type="checkbox" className="mt-1 w-4 h-4 rounded border-border text-primary focus:ring-primary/20" required />
                <span className="text-[13px] text-text-secondary leading-relaxed group-hover:text-text-primary transition-colors">
                  Acepto los <a href="#" className="font-bold text-primary hover:underline">términos de uso</a> y la <a href="#" className="font-bold text-primary hover:underline">política de privacidad</a>.
                </span>
              </label>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={loading}
              className="vf-btn-primary w-full h-[56px] text-base font-bold shadow-floating disabled:opacity-50 mt-4"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Procesando Registro...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Crear mi cuenta <ArrowRight className="w-5 h-5" />
                </span>
              )}
            </motion.button>
          </form>

          <div className="mt-8">
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/50"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-white text-text-secondary uppercase tracking-widest font-black text-[10px]">O CONTINUAR CON</span>
              </div>
            </div>

            <button
              type="button"
              className="w-full h-[52px] border border-border rounded-xl flex items-center justify-center gap-3 font-sans font-semibold text-text-primary hover:bg-surface-raised transition-all shadow-sm active:scale-[0.98] bg-white"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335" />
              </svg>
              Google
            </button>
          </div>


          <div className="mt-8 pt-6 border-t border-border/50 text-center">
            <p className="text-sm text-text-secondary">
              ¿Ya tienes una cuenta?{" "}
              <Link to="/login" className="text-primary font-bold hover:underline">
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
