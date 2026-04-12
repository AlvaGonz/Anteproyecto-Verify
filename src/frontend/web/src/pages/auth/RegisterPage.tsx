import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield, Mail, Lock, User, Building, ArrowRight, CheckCircle2 } from "lucide-react";

export const RegisterPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate registration
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    }, 2000);
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
    <div className="min-h-screen bg-surface flex flex-col p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-tertiary-container/10 rounded-full blur-[150px] pointer-events-none"></div>
      
      <header className="w-full max-w-7xl mx-auto flex justify-between items-center py-8 relative z-10">
        <Link to="/" className="flex items-center gap-2 group transition-all">
          <div className="w-12 h-12 bg-secondary text-white rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Shield className="w-6 h-6" />
          </div>
          <span className="text-2xl font-display font-black text-secondary tracking-tighter">VeriFinca</span>
        </Link>
        <p className="text-on-surface-variant hidden md:block">
          ¿Ya tienes una cuenta?{" "}
          <Link to="/login" className="text-primary font-bold hover:underline ml-2">Iniciar Sesión</Link>
        </p>
      </header>

      <main className="flex-1 flex items-center justify-center py-12">
        <div className="w-full max-w-4xl grid md:grid-cols-2 bg-surface-container-lowest rounded-3xl overflow-hidden shadow-modal border border-outline-variant/20 relative z-10">
          <div className="p-12 bg-[#223382] text-white flex flex-col justify-between overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#111144] opacity-50"></div>
            <div className="relative z-10 space-y-8">
              <h1 className="text-4xl md:text-5xl font-display font-black leading-tight tracking-tighter">
                Únete a la Red de <span className="text-primary-container">Integridad</span> Inmobiliaria
              </h1>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-primary-container" />
                  </div>
                  <div>
                    <h4 className="font-bold">Acceso a Expedientes</h4>
                    <p className="text-sm text-white/70">Consulta documentos legales y técnicos en tiempo real.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-primary-container" />
                  </div>
                  <div>
                    <h4 className="font-bold">Certificados Digitales</h4>
                    <p className="text-sm text-white/70">Emite y valida certificados con respaldo institucional.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-primary-container" />
                  </div>
                  <div>
                    <h4 className="font-bold">Dashboard Profesional</h4>
                    <p className="text-sm text-white/70">Gestiona múltiples proyectos con herramientas avanzadas.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10 pt-12 flex items-center gap-4 border-t border-white/10">
              <div className="flex -space-x-3">
                {[1,2,3].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-[#223382] bg-surface-variant flex items-center justify-center text-[10px] font-bold text-secondary">PRO</div>
                ))}
              </div>
              <p className="text-xs text-white/60">Únete a más de 250 profesionales hoy.</p>
            </div>
            
            <div className="absolute bottom-[-100px] right-[-50px] opacity-10 pointer-events-none">
              <Shield className="w-96 h-96" />
            </div>
          </div>

          <div className="p-12">
            <div className="mb-10">
              <h3 className="text-2xl font-display font-extrabold text-[#223382] tracking-tight">Solicitud de Acceso</h3>
              <p className="text-on-surface-variant">Completa tus datos profesionales</p>
            </div>

            <form onSubmit={handleRegister} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="vf-search-group col-span-2">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-outline" />
                  <input type="text" placeholder="Nombre completo" className="vf-search-input !py-4" required />
                </div>
              </div>

              <div className="vf-search-group">
                <Building className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-outline" />
                <input type="text" placeholder="Empresa / Institución" className="vf-search-input !py-4" required />
              </div>

              <div className="vf-search-group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-outline" />
                <input type="email" placeholder="Correo corporativo" className="vf-search-input !py-4" required />
              </div>

              <div className="vf-search-group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-outline" />
                <input type="password" placeholder="Contraseña de acceso" className="vf-search-input !py-4" required />
              </div>

              <div className="pb-4">
                <label className="flex gap-3 cursor-pointer group">
                  <input type="checkbox" className="mt-1 w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary/20" required />
                  <span className="text-sm text-on-surface-variant leading-relaxed group-hover:text-on-surface transition-colors">
                    Acepto los <a href="#" className="font-bold text-primary hover:underline">términos de uso</a> y la <a href="#" className="font-bold text-primary hover:underline">política de privacidad</a> institucional.
                  </span>
                </label>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="vf-btn-primary w-full shadow-2xl disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Enviando solicitud...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Crear cuenta profesional <ArrowRight className="w-5 h-5" />
                  </span>
                )}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};
