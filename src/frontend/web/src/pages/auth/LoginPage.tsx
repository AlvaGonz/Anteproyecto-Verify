import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield, Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";

export const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate login
    setTimeout(() => {
      setLoading(false);
      navigate("/admin/dashboard");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-primary-container/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[30vw] h-[30vw] bg-secondary-container/20 rounded-full blur-[100px] pointer-events-none"></div>

      <Link to="/" className="flex items-center gap-2 mb-12 group transition-all">
        <div className="w-12 h-12 bg-secondary text-white rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
          <Shield className="w-6 h-6" />
        </div>
        <span className="text-2xl font-display font-black text-secondary tracking-tighter">VeriFinca</span>
      </Link>

      <div className="w-full max-w-md vf-glass p-10 rounded-2xl relative z-10 border border-white/20">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-display font-extrabold text-[#223382] mb-2 tracking-tight">Bienvenido</h1>
          <p className="text-on-surface-variant font-medium">Ingresa tus credenciales para acceder al portal</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="vf-search-group">
            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-outline" />
            <input 
              type="email" 
              placeholder="Correo electrónico"
              className="vf-search-input !py-4"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="vf-search-group">
            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-outline" />
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Contraseña"
              className="vf-search-input !py-4 pr-12"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary/20" />
              <span className="text-on-surface-variant group-hover:text-on-surface transition-colors">Recordarme</span>
            </label>
            <a href="#" className="text-primary font-bold hover:underline">¿Olvidaste tu contraseña?</a>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="vf-btn-primary w-full shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Autenticando...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Iniciar Sesión <ArrowRight className="w-5 h-5" />
              </span>
            )}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-outline-variant/10 text-center">
          <p className="text-on-surface-variant">
            ¿No tienes una cuenta?{" "}
            <Link to="/register" className="text-secondary font-bold hover:underline">Solicitar Acceso</Link>
          </p>
        </div>
      </div>

      <div className="mt-12 text-sm text-outline font-medium">
        © {new Date().getFullYear()} VeriFinca. Institutional Node.
      </div>
    </div>
  );
};
