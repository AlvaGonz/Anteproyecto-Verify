import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  ArrowRight,
  ArrowLeft,
  MapPin,
  Gavel,
  Building2,
  ShieldCheck,
  Zap,
  Lock,
  ChevronRight
} from "lucide-react";
import { mockProjects } from "../infrastructure/mock/mockProjects";
import { ProjectStatus } from "../features/projects/types";
import { motion } from "framer-motion";

/* ===== MOTION VARIANTS ===== */
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
};

/* ===== NAVIGATION ===== */
const LandingNav: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-50 flex justify-between items-center px-6 md:px-12 h-20 transition-all duration-500 ${scrolled
        ? "bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm h-16"
        : "bg-transparent h-24"
        }`}
    >
      <Link to="/" className="flex items-center group">
        <img
          src="/brand/logotipo/LOGOTIPO.svg"
          alt="VeriFinca"
          className="h-10 w-auto group-hover:scale-105 transition-transform"
        />
      </Link>

      <div className="hidden lg:flex items-center gap-10">
        {[
          { label: "Servicios", href: "#servicios" },
          { label: "Metodología", href: "#metodologia" },
          { label: "Proyectos", href: "#proyectos" },
          { label: "Precios", href: "#" },
        ].map((item) => (
          <a
            key={item.label}
            href={item.href}
            className="text-sm font-bold text-secondary/70 hover:text-secondary transition-colors tracking-tight"
          >
            {item.label}
          </a>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <Link
          to="/login"
          className="hidden sm:block text-sm font-bold text-secondary hover:text-primary px-4 py-2 transition-colors"
        >
          Acceso Clientes
        </Link>
        <Link
          to="/register"
          className="bg-secondary text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-primary hover:shadow-lg hover:shadow-primary/20 active:scale-95 transition-all"
        >
          Crear cuenta
        </Link>
      </div>
    </nav>
  );
};

/* ===== HERO SECTION ===== */
const HeroSection: React.FC = () => {
  const [code, setCode] = useState("");

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden px-6 md:px-12 pt-20">
      {/* Abstract Background Elements */}
      <div className="absolute top-1/4 right-0 w-1/2 h-1/2 bg-primary/5 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-secondary/5 rounded-full blur-[100px] -z-10" />

      <div className="absolute right-0 top-0 w-full md:w-[60%] h-full z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/40 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10" />
        <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px] z-[5]" />

        {/* Animated Scan Line */}
        <motion.div
          animate={{ top: ['0%', '100%', '0%'] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute left-0 w-full h-[2px] bg-primary/40 z-20 shadow-[0_0_20px_rgba(249,133,19,0.7)]"
        />

        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover opacity-40 mix-blend-multiply transition-all duration-1000 z-0 scale-110"
          poster="/media/verifinca_institutional.png"
        >
          <source src="/media/landing_Sketch_to_finished_202604121407.mp4" type="video/mp4" />
        </video>
      </div>

      <div className="relative z-10 max-w-5xl space-y-12">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-black uppercase tracking-widest border border-primary/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            Autoridad Institucional Inmobiliaria
          </div>
          <h1 className="text-5xl md:text-8xl font-display font-black text-secondary leading-[0.95] tracking-tight">
            Seguridad técnica y <span className="text-primary italic">jurídica</span> en un clic
          </h1>
          <p className="text-gray-500 text-lg md:text-xl max-w-xl font-medium leading-relaxed">
            La plataforma líder en validación de proyectos inmobiliarios en RD. Conectamos datos institucionales en tiempo real para inversores y desarrolladores.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="max-w-3xl"
        >
          <div className="bg-white p-2 rounded-3xl flex flex-col sm:flex-row items-center shadow-2xl shadow-secondary/10 border border-gray-100 group focus-within:ring-4 focus-within:ring-primary/5 transition-all">
            <div className="flex-1 w-full flex items-center px-4">
              <Search className="w-5 h-5 text-gray-300 group-focus-within:text-primary" />
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Nombre del proyecto o código de radicación..."
                className="w-full bg-transparent border-none focus:ring-0 px-3 py-4 text-base font-bold placeholder:text-gray-300 outline-none"
              />
            </div>
            <Link
              to={code ? `/verify/${code}` : "/verify"}
              className="w-full sm:w-auto bg-secondary text-white px-10 py-4 rounded-2xl font-display font-black text-lg hover:bg-primary active:scale-95 transition-all shadow-lg shadow-secondary/20 flex items-center justify-center gap-2"
            >
              Consultar Ahora
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
          <div className="mt-4 flex flex-wrap gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest px-4">
            <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-primary" /> Validación Express</span>
            <span className="flex items-center gap-1.5 border-l border-gray-200 pl-4"><Lock className="w-3.5 h-3.5 text-primary" /> Conexión Notarial</span>
            <span className="flex items-center gap-1.5 border-l border-gray-200 pl-4"><Building2 className="w-3.5 h-3.5 text-primary" /> Data Curaduría</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

/* ===== METRICS ===== */
const TrustStripSection: React.FC = () => (
  <section className="bg-white py-20 px-6">
    <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12">
      {[
        { value: "120+", label: "Expedientes Validados" },
        { value: "1.2B", label: "Inversión Auditada" },
        { value: "24h", label: "Garantía de Respuesta" },
        { value: "RD", label: "Alcance Nacional" },
      ].map((stat, i) => (
        <motion.div
          key={stat.label}
          {...fadeInUp}
          transition={{ delay: i * 0.1 }}
          className="text-center md:text-left space-y-1"
        >
          <p className="text-4xl md:text-5xl font-display font-black text-secondary tracking-tighter">
            {stat.value}
          </p>
          <p className="text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-[0.2em]">
            {stat.label}
          </p>
        </motion.div>
      ))}
    </div>
  </section>
);

/* ===== FEATURED PROJECTS ===== */
const FeaturedProjectsSection: React.FC = () => {
  const validatedProjects = mockProjects
    .filter((p) => p.estadoProyecto === ProjectStatus.Validated && (p.completionRate || 0) >= 0.8)
    .slice(0, 12);

  // Duplicar la lista para el efecto de scroll infinito
  const displayProjects = [...validatedProjects, ...validatedProjects];

  return (
    <section id="proyectos" className="py-32 px-6 bg-gray-50/50">
      <div className="max-w-7xl mx-auto space-y-16">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-6xl font-display font-black text-secondary tracking-tight uppercase">
              Proyectos <span className="text-primary italic">Verificadores</span>
            </h2>
            <p className="text-gray-500 text-lg max-w-xl font-medium">
              Estos proyectos han superado nuestra auditoría técnica con un cumplimiento superior al 80%.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 items-center">
            <Link
              to="/projects"
              className="group flex items-center gap-3 bg-white px-6 py-4 rounded-2xl border border-gray-100 shadow-sm text-secondary font-black text-sm hover:shadow-md transition-all"
            >
              Explorar Base de Datos
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        <div
          className="relative overflow-hidden py-10 -mx-6 px-6 group/ticker"
        >
          {/* Estilos para el scroll infinito suave con pausa real */}
          <style>{`
            @keyframes ticker {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .animate-ticker-custom {
              animation: ticker ${validatedProjects.length * 5}s linear infinite;
            }
            .group\\/ticker:hover .animate-ticker-custom {
              animation-play-state: paused;
            }
          `}</style>

          {/* Degradados laterales para suavizar el flujo */}
          <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-gray-50/50 to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-gray-50/50 to-transparent z-10 pointer-events-none" />

          <div
            className="flex gap-8 animate-ticker-custom"
            style={{
              width: "fit-content",
            }}
          >
            {displayProjects.map((project, i) => (
              <motion.div
                key={`${project.id}-${i}`}
                className="w-[400px] flex-shrink-0"
              >
                <Link to={`/projects/${project.id}`} className="block h-full group">
                  <div className="bg-white rounded-[32px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-700 text-left h-full flex flex-col relative">
                    {/* Badge absolute */}
                    <div className="absolute top-6 left-6 z-20">
                      <div className="px-4 py-1.5 bg-white/95 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-primary shadow-sm border border-primary/10">
                        VERIFICADO {Math.round((project.completionRate || 0) * 100)}%
                      </div>
                    </div>

                    <div className="aspect-[4/5] relative overflow-hidden bg-gray-100">
                      <img
                        src={project.imagenUrl || `https://images.unsplash.com/photo-1590059132218-22ca5570058b?q=80&w=800&auto=format&fit=crop`}
                        alt={project.nombre}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-secondary/40 via-transparent to-transparent group-hover:from-secondary/90 transition-all duration-700" />

                      <div className="absolute inset-0 p-8 flex flex-col justify-end transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                        <p className="text-white/80 text-[10px] font-black tracking-widest uppercase flex items-center gap-2 mb-2">
                          <MapPin className="w-3 h-3 text-primary" /> {project.ubicacionTexto}
                        </p>
                        <h3 className="text-white text-3xl font-black leading-none">{project.nombre}</h3>
                      </div>
                    </div>

                    <div className="p-8 space-y-6 flex-grow flex flex-col">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sector Inmobiliario</span>
                          <p className="text-lg font-black text-secondary tracking-tight">{project.categoria}</p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-secondary group-hover:bg-primary group-hover:text-white group-hover:rotate-[360deg] transition-all duration-700">
                          <ArrowRight className="w-5 h-5" />
                        </div>
                      </div>

                      <div className="pt-6 border-t border-gray-50 mt-auto flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">ID Registro</span>
                          <span className="text-xs font-bold text-gray-500">{project.codigoInterno}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

/* ===== BENTO METHODOLOGY ===== */
const MethodologySection: React.FC = () => (
  <section id="metodologia" className="py-32 px-6 bg-white overflow-hidden relative">
    <div className="max-w-7xl mx-auto space-y-24">
      <div className="text-center space-y-4 relative z-10">
        <h2 className="text-4xl md:text-6xl font-display font-black text-secondary tracking-tight">
          Protección en cada etapa
        </h2>
        <p className="text-gray-500 text-lg max-w-2xl mx-auto font-medium">
          Combinamos tecnología de punta con validaciones institucionales directas para garantizar integridad total.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Card 1: Large */}
        <motion.div {...fadeInUp} className="md:col-span-2 bg-secondary p-12 rounded-[40px] text-white space-y-12 relative overflow-hidden group">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-primary/20 rounded-full blur-[80px]" />
          <div className="space-y-4">
            <span className="text-primary font-black text-xs uppercase tracking-[0.3em]">Fase 01</span>
            <h3 className="text-3xl md:text-5xl font-display font-black leading-none !text-white">Ingesta de <br />Data Maestra</h3>
          </div>
          <p className="text-white/60 text-lg max-w-sm leading-relaxed">
            Procesamos la documentación legal del proyecto comparándola con repositorios históricos y cartografía digital certificada.
          </p>
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10 group-hover:bg-primary transition-colors">
            <Zap className="w-6 h-6" />
          </div>
        </motion.div>

        {/* Card 2: Medium */}
        <motion.div {...fadeInUp} transition={{ delay: 0.1 }} className="bg-gray-50 p-10 rounded-[40px] flex flex-col justify-between border border-gray-100 hover:border-primary/20 transition-all">
          <div className="space-y-4">
            <span className="text-gray-400 font-black text-[10px] uppercase tracking-[0.3em]">Fase 02</span>
            <h3 className="text-2xl font-bold text-gray-900 leading-tight">Validación <br />Cruzada</h3>
          </div>
          <p className="text-gray-500 text-sm leading-relaxed">
            Integración directa con organismos de catastro y servicios notariales.
          </p>
        </motion.div>

        {/* Card 3: Medium */}
        <motion.div {...fadeInUp} transition={{ delay: 0.2 }} className="bg-white p-10 rounded-[40px] flex flex-col justify-between border border-gray-100 hover:border-primary/20 transition-all shadow-xl shadow-secondary/5">
          <div className="space-y-4">
            <span className="text-gray-400 font-black text-[10px] uppercase tracking-[0.3em]">Fase 03</span>
            <h3 className="text-2xl font-bold text-gray-900 leading-tight">Sello de <br />Integridad</h3>
          </div>
          <p className="text-gray-500 text-sm leading-relaxed">
            Emisión de certificado inmutable con código QR de verificación instantánea.
          </p>
        </motion.div>
      </div>
    </div>
  </section>
);

/* ===== CTA ===== */
const CtaSection: React.FC = () => (
  <section id="servicios" className="py-20 px-6 bg-white mt-12">
    <motion.div
      {...fadeInUp}
      className="max-w-7xl mx-auto bg-primary rounded-[48px] p-12 md:p-24 relative overflow-hidden text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-12"
    >
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
      <div className="space-y-6 relative z-10 max-w-2xl">
        <h2 className="text-4xl md:text-6xl font-display font-black text-white leading-none tracking-tight">
          Lleva tu proyecto al siguiente nivel de confianza
        </h2>
        <p className="text-white/80 text-lg md:text-xl font-medium">
          Únete a la red de desarrolladores que han transformado la industria en RD.
        </p>
      </div>
      <div className="relative z-10 flex flex-col items-center gap-4">
        <Link
          to="/register"
          className="bg-white text-primary px-12 py-5 rounded-[24px] font-display font-black text-xl shadow-xl hover:scale-105 active:scale-95 transition-all w-full md:w-auto"
        >
          Empezar Ahora
        </Link>
        <span className="text-white/60 text-xs font-black uppercase tracking-[0.3em]">Garantía VeriFinca</span>
      </div>
    </motion.div>
  </section>
);

/* ===== FOOTER ===== */
const LandingFooter: React.FC = () => (
  <footer className="bg-secondary pt-24 pb-12 px-6 overflow-hidden relative">
    <div className="max-w-7xl mx-auto flex flex-col gap-20">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-white/60">
        <div className="md:col-span-2 space-y-8">
          <Link to="/">
            <img src="/brand/logotipo/LOGOTIPO WHITE.svg" alt="VeriFinca" className="h-12 w-auto" />
          </Link>
          <p className="text-lg max-w-md leading-relaxed text-white/40 font-medium">
            Construyendo infraestructuras de confianza para el futuro inmobiliario de la República Dominicana.
          </p>
        </div>
        <div className="space-y-6">
          <h4 className="text-white font-black text-xs uppercase tracking-widest">Navegación</h4>
          <ul className="space-y-4 text-sm font-bold">
            <li><a href="#" className="hover:text-primary transition-colors">Verificar Código</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Instituciones</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Portal Auditor</a></li>
          </ul>
        </div>
        <div className="space-y-6">
          <h4 className="text-white font-black text-xs uppercase tracking-widest">Legal</h4>
          <ul className="space-y-4 text-sm font-bold">
            <li><a href="#" className="hover:text-primary transition-colors">Términos de Servicio</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Privacidad</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Cookies</a></li>
          </ul>
        </div>
      </div>

      <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">
          © 2026 VeriFinca. Construyendo Confianza.
        </p>
        <div className="flex gap-4">
          {[Gavel, Building2].map((Icon, i) => (
            <div key={i} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 cursor-pointer transition-all border border-white/5">
              <Icon className="w-5 h-5 text-white/40" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </footer>
);

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white selection:bg-primary/20 selection:text-primary overflow-x-hidden">
      <LandingNav />
      <HeroSection />
      <TrustStripSection />
      <FeaturedProjectsSection />
      <MethodologySection />
      <CtaSection />
      <LandingFooter />
    </div>
  );
};
