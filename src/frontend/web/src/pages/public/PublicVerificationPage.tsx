import React from "react";
import { Link } from "react-router-dom";
import {
   ShieldCheck,
   Search,
   ArrowRight,
   Building2,
   FileCheck,
   Lock,
   ChevronRight,
   Shield,
   CheckCircle2,
   Clock,
   Zap
} from "lucide-react";

export const PublicVerificationPage: React.FC = () => {
   return (
      <div className="min-h-screen bg-surface font-sans text-text-primary flex flex-col selection:bg-primary/10 selection:text-primary">

         {/* Premium Navigation */}
         <nav className="fixed top-0 w-full z-50 bg-secondary/95 backdrop-blur-xl border-b border-white/5 h-20 px-8 flex justify-between items-center">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/20">
                  <ShieldCheck className="w-6 h-6 text-primary" />
               </div>
               <div className="flex flex-col leading-none">
                  <Link to="/" className="flex items-center group">
                     <img
                        src="/brand/logotipo/LOGOTIPO WHITE.svg"
                        alt="VeriFinca"
                        className="h-10 w-auto group-hover:scale-105 transition-transform"
                     />
                  </Link>
               </div>
            </div>

            <Link
               to="/verify"
               className="group flex items-center gap-3 bg-primary text-white px-5 py-2.5 rounded-full shadow-raised hover:shadow-floating transition-all active:scale-95"
            >
               <Search className="w-4 h-4" />
               <span className="text-xs font-black uppercase tracking-wider">Verificar Proyecto</span>
            </Link>
         </nav>

         {/* Main Content */}
         <main className="flex-1">

            {/* Hero Section */}
            <section className="relative pt-48 pb-32 px-8 bg-secondary overflow-hidden">
               <div className="vf-hud-grid opacity-20" />
               <div className="absolute inset-0 bg-gradient-to-br from-secondary via-secondary to-primary/20" />

               <div className="relative z-10 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                  <div className="animate-fade-in-up">
                     <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
                        <Zap className="w-4 h-4 text-primary" />
                        <span className="text-white/60 text-[10px] font-black tracking-[0.2em] uppercase">Protocolo de Integridad v4.0</span>
                     </div>
                     <h1 className="display-lg text-white mb-8 leading-[1.1]">
                        Garantía Institucional<br />
                        <span className="text-primary italic">Para Su Inversión</span>
                     </h1>
                     <p className="text-white/60 text-lg font-medium leading-relaxed mb-10 max-w-xl">
                        VeriFinca es la plataforma líder en verificación de integridad inmobiliaria. Nuestro portal público permite a los inversionistas validar la legitimidad de cualquier proyecto en tiempo real.
                     </p>
                     <div className="flex flex-wrap gap-4">
                        <Link to="/verify" className="h-16 px-8 bg-primary rounded-2xl flex items-center gap-3 text-white font-black text-lg shadow-floating hover:scale-[1.02] active:scale-95 transition-all">
                           EMPEZAR VERIFICACIÓN <ArrowRight className="w-5 h-5" />
                        </Link>
                        <button className="h-16 px-8 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3 text-white font-black text-lg hover:bg-white/10 transition-all">
                           SABER MÁS
                        </button>
                     </div>
                  </div>

                  <div className="relative lg:block hidden animate-fade-in-up delay-200">
                     {/* Visual HUD Decoration */}
                     <div className="relative bg-white/5 backdrop-blur-2xl rounded-[40px] border border-white/10 p-12 shadow-2xl overflow-hidden aspect-square flex flex-col items-center justify-center">
                        <div className="absolute inset-0 bg-primary/10 animate-pulse-slow" />
                        <ShieldCheck className="w-48 h-48 text-primary/80 relative z-10 mb-8" />
                        <div className="text-center relative z-10">
                           <div className="text-white/40 font-mono text-xs uppercase tracking-[0.4em] mb-2 leading-none">Status: Sincronizado</div>
                           <div className="text-primary text-4xl font-black font-display tracking-tight">BLOCKCHAIN ACTIVE</div>
                        </div>
                        {/* Scanner Line Effect */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_20px_#F98513] animate-scan-y" />
                     </div>
                  </div>
               </div>
            </section>

            {/* Info Grid */}
            <section className="py-32 px-8 bg-white">
               <div className="max-w-6xl mx-auto">
                  <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-20 animate-fade-in-up">
                     <div className="max-w-xl">
                        <h2 className="text-4xl font-display font-black text-secondary mb-4 leading-tight">¿Cómo funciona VeriFinca?</h2>
                        <p className="text-on-surface-variant font-medium leading-relaxed">
                           Un proceso riguroso de 3 pasos que transforma la incertidumbre en seguridad institucional para compradores y desarrolladores.
                        </p>
                     </div>
                     <div className="h-px flex-1 bg-outline-variant/20 hidden md:block mb-6 mx-8" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                     {[
                        {
                           icon: Search,
                           title: "Debida Diligencia",
                           desc: "Auditamos más de 45 puntos de control legal, técnico y financiero para asegurar que el proyecto cumple con la normativa vigente."
                        },
                        {
                           icon: Lock,
                           title: "Registro Inmutable",
                           desc: "Cada validación es sellada mediante criptografía asimétrica, creando una prueba de integridad que nadie puede alterar ni borrar."
                        },
                        {
                           icon: Clock,
                           title: "Mantenimiento",
                           desc: "Nuestro sistema monitorea continuamente el estatus de las licencias y avances para asegurar que la integridad se mantenga 24/7."
                        }
                     ].map((item, i) => (
                        <div key={i} className="group p-10 rounded-[40px] bg-surface-raised border border-outline-variant/10 hover:border-primary/20 transition-all duration-500 hover:shadow-premium animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
                           <div className="w-16 h-16 bg-secondary text-white rounded-3xl flex items-center justify-center mb-8 shadow-lg group-hover:bg-primary transition-colors duration-500">
                              <item.icon className="w-8 h-8" />
                           </div>
                           <h3 className="text-2xl font-bold font-['Manrope'] text-secondary mb-4">{item.title}</h3>
                           <p className="text-on-surface-variant text-sm font-medium leading-relaxed mb-8">{item.desc}</p>
                           <div className="flex items-center gap-2 text-primary text-xs font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0">
                              Leer más <ChevronRight className="w-4 h-4" />
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </section>

            {/* Trust Banner with Stats */}
            <section className="py-24 px-8 bg-surface-raised">
               <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-16">
                  <div className="animate-fade-in-up">
                     <h2 className="text-3xl font-display font-black text-secondary mb-6">Transparencia Total</h2>
                     <p className="text-on-surface-variant font-medium mb-8">Únase a los cientos de inversionistas que ya confían en la certificación VeriFinca.</p>
                     <div className="flex items-center gap-4 text-secondary font-black">
                        <div className="bg-primary/20 p-2 rounded-lg"><Shield className="w-6 h-6 text-primary" /></div>
                        <span>PROTECCIÓN RESPALDADA POR BLOCKCHAIN</span>
                     </div>
                  </div>
                  <div className="grid grid-cols-2 gap-8 md:gap-16">
                     {[
                        { val: "250+", lab: "PROYECTOS" },
                        { val: "15k+", lab: "CONSULTAS" },
                        { val: "99.9%", lab: "UPTIME" },
                        { val: "RD$4B+", lab: "PROTEGIDOS" }
                     ].map((stat, i) => (
                        <div key={i} className="text-center animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
                           <div className="text-4xl md:text-5xl font-display font-black text-primary mb-2">{stat.val}</div>
                           <div className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] opacity-40">{stat.lab}</div>
                        </div>
                     ))}
                  </div>
               </div>
            </section>

         </main>

         {/* Industrial Footer */}
         <footer className="bg-text-primary py-24 px-8">
            <div className="max-w-6xl mx-auto">
               <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
                  <div className="col-span-1 md:col-span-2">
                     <div className="flex items-center gap-3 mb-8">
                        <ShieldCheck className="w-8 h-8 text-primary" />
                        <span className="text-white text-3xl font-display font-black">VeriFinca</span>
                     </div>
                     <p className="text-white/40 text-sm font-medium leading-relaxed max-w-sm">
                        Empoderando al sector inmobiliario mediante la estandarización de procesos de integridad y transparencia institucional soportada por tecnología de punta.
                     </p>
                  </div>
                  <div>
                     <h4 className="text-white text-xs font-black uppercase tracking-widest mb-8 text-primary">Plataforma</h4>
                     <div className="flex flex-col gap-4">
                        <a href="#" className="text-white/60 hover:text-white transition-colors text-sm font-bold">Base de Datos</a>
                        <a href="#" className="text-white/60 hover:text-white transition-colors text-sm font-bold">API Pública</a>
                        <a href="#" className="text-white/60 hover:text-white transition-colors text-sm font-bold">Blockchain Explorer</a>
                     </div>
                  </div>
                  <div>
                     <h4 className="text-white text-xs font-black uppercase tracking-widest mb-8 text-primary">Comunidad</h4>
                     <div className="flex flex-col gap-4">
                        <a href="#" className="text-white/60 hover:text-white transition-colors text-sm font-bold">Desarrolladores</a>
                        <a href="#" className="text-white/60 hover:text-white transition-colors text-sm font-bold">Asociaciones</a>
                        <a href="#" className="text-white/60 hover:text-white transition-colors text-sm font-bold">Prensa</a>
                     </div>
                  </div>
               </div>

               <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
                  <p className="text-white/20 text-[10px] uppercase font-black tracking-widest">
                     © {new Date().getFullYear()} VeriFinca. República Dominicana. Todos los derechos reservados.
                  </p>
                  <div className="flex gap-8">
                     <a href="#" className="text-white/30 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest">Términos</a>
                     <a href="#" className="text-white/30 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest">Privacidad</a>
                  </div>
               </div>
            </div>
         </footer>
      </div>
   );
};
