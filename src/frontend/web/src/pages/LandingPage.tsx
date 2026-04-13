import React, { useEffect, useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  ArrowRight,
  MapPin,
  Gavel,
  Building2,
} from "lucide-react";
import { mockProjects } from "../infrastructure/mock/mockProjects";
import { ProjectStatus, IntegrityStatus } from "../features/projects/types";
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
      className={`fixed top-0 w-full z-50 flex justify-between items-center px-8 h-20 font-display font-bold tracking-tight transition-all duration-500 ${scrolled
        ? "bg-brand-blue shadow-2xl shadow-brand-blue-dark/10"
        : "bg-brand-blue"
        }`}
    >
      <Link to="/" className="flex items-center">
        <img
          src="/brand/isotipo/ISOTIPO NEGRO.svg"
          alt="VeriFinca"
          className="h-10 w-auto"
        />
      </Link>

      <div className="hidden md:flex items-center gap-8">
        {[
          { label: "Servicios", href: "#servicios", isActive: true },
          { label: "Empresa", href: "#metodologia", isActive: false },
        ].map((item) => (
          <a
            key={item.label}
            href={item.href}
            className={`transition-colors duration-300 ${item.isActive
              ? "text-white border-b-4 border-primary-container pb-1"
              : "text-brand-cream/80 hover:text-white"
              }`}
          >
            {item.label}
          </a>
        ))}
      </div>

      <div className="flex items-center gap-6">
        <Link
          to="/login"
          className="hidden md:inline-block text-brand-cream/80 hover:text-white transition-colors text-sm font-semibold"
        >
          Iniciar sesión
        </Link>
        <Link
          to="/register"
          className="bg-primary-container text-on-primary-container px-6 py-2.5 rounded-full font-bold active:scale-95 duration-200 transition-transform"
        >
          Registrarse
        </Link>
      </div>
    </nav>
  );
};

/* ===== HERO SECTION WITH VIDEO ===== */
const HeroSection: React.FC = () => {
  const [code, setCode] = useState("");

  return (
    <section className="relative min-h-[870px] flex items-center overflow-hidden px-8 md:px-16 pt-20">
      {/* Background architectural video/image — right half on desktop, full-width faded on mobile */}
      <div className="absolute right-0 top-0 w-full md:w-1/2 h-full z-0 overflow-hidden">
        {/* Gradient fade from surface into the media */}
        <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/80 to-transparent z-10 w-48 md:w-72" />
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover opacity-40 md:opacity-60 grayscale hover:grayscale-0 transition-all duration-700"
          poster="/media/verifinca_institutional.png"
        >
          <source
            src="/media/landing_Sketch_to_finished_202604121407.mp4"
            type="video/mp4"
          />
        </video>
      </div>

      <div className="relative z-10 max-w-4xl space-y-8">
        <motion.div {...fadeInUp} className="space-y-4">
          {/* Institutional authority badge — matching Stitch reference */}
          <h1 className="text-5xl md:text-7xl font-display font-extrabold text-brand-blue leading-[1.1] tracking-tight">
            Consulta la validez legal de proyectos inmobiliarios en la República Dominicana
          </h1>
        </motion.div>

        {/* Stitch search bar */}
        <motion.div
          {...fadeInUp}
          className="relative group max-w-2xl"
        >
          <div className="bg-surface-container-lowest p-2 rounded-full flex items-center shadow-2xl shadow-brand-blue-dark/10 border border-outline-variant/20 transition-all focus-within:ring-2 focus-within:ring-primary-container">
            <div className="pl-6 text-outline">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Ingresa el código o nombre del proyecto"
              className="w-full bg-transparent border-none focus:ring-0 px-4 text-lg font-medium placeholder:text-outline/60 outline-none"
            />
            <Link
              to={code ? `/verify/${code}` : "/verify"}
              className="bg-primary-container text-on-primary-container px-8 py-4 rounded-full font-display font-bold text-lg active:scale-95 transition-transform whitespace-nowrap"
            >
              Consultar proyecto
            </Link>
          </div>
        </motion.div>

        <motion.p
          {...fadeInUp}
          className="text-on-surface-variant text-lg max-w-xl font-light"
        >
          Acceda a la base de datos más robusta de validación institucional en
          tiempo real. Seguridad jurídica para inversores y profesionales.
        </motion.p>
      </div>
    </section>
  );
};

/* ===== TRUST STRIP (Stats) ===== */
const TrustStripSection: React.FC = () => (
  <section className="bg-surface-container-low py-16 px-8 border-y border-outline-variant/10">
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
      {[
        { value: "500+", label: "Proyectos validados" },
        { value: "15k", label: "Documentos revisados" },
        { value: "20+", label: "Instituciones conectadas" },
      ].map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.15 }}
          viewport={{ once: true }}
          className={`flex flex-col items-center md:items-start space-y-2 ${i === 1
            ? "border-x-0 md:border-x border-outline-variant/30 px-0 md:px-12"
            : ""
            }`}
        >
          <span className="text-4xl font-display font-extrabold text-brand-blue">
            {stat.value}
          </span>
          <span className="text-on-surface-variant uppercase tracking-widest text-xs font-semibold">
            {stat.label}
          </span>
        </motion.div>
      ))}
    </div>
  </section>
);

/* ===== FEATURED PROJECTS CAROUSEL ===== */
/* ===== FEATURED PROJECTS CAROUSEL ===== */
const validatedProjects = mockProjects
  .filter(p => p.estadoProyecto === ProjectStatus.Validated && p.estadoIntegridad === IntegrityStatus.Verified)
  .slice(0, 10);

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("es-ES", { month: "short", year: "numeric" });
};

const FeaturedProjectsSection: React.FC = () => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      if (carouselRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          carouselRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          carouselRef.current.scrollBy({ left: 400, behavior: "smooth" });
        }
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <section id="portafolio" className="py-24 px-8 bg-surface">
      <div className="max-w-7xl mx-auto relative">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
          <div className="space-y-4">
            <h2 className="text-4xl font-display font-bold text-brand-blue">
              Proyectos Destacados
            </h2>
            <p className="text-on-surface-variant max-w-2xl">
              Explora proyectos de alto impacto que han superado nuestro riguroso proceso de validación institucional.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/projects"
              className="text-secondary font-bold flex items-center gap-2 hover:underline"
            >
              Ver todos <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div
          ref={carouselRef}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="flex overflow-x-auto no-scrollbar snap-x snap-mandatory gap-8 pb-4 scroll-smooth"
        >
          {validatedProjects.map((project) => (
            <div
              key={project.id}
              className="min-w-full md:min-w-[calc(33.333%-22px)] snap-start group bg-surface-container-lowest rounded-lg overflow-hidden border border-outline-variant/30 hover:shadow-xl transition-all duration-300 flex-shrink-0"
            >
              <div className="h-64 relative overflow-hidden bg-surface-container">
                <div className="absolute inset-0 bg-gradient-to-tr from-secondary/20 to-transparent" />
                <img
                  alt={project.nombre}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  src={project.imagenUrl || "https://images.unsplash.com/photo-1582408921715-18e7806367c1?q=80&w=800&auto=format&fit=crop"}
                />
                <div className="absolute top-4 right-4">
                  <span
                    className="bg-primary-container text-on-primary-container px-4 py-1.5 rounded-full text-xs font-bold shadow-lg"
                  >
                    Validado
                  </span>
                </div>
              </div>
              <div className="p-8 space-y-4">
                <div className="space-y-1">
                  <h3 className="text-xl font-display font-bold text-brand-blue line-clamp-1">
                    {project.nombre}
                  </h3>
                  <div className="flex items-center text-on-surface-variant text-sm gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="line-clamp-1">{project.ubicacionTexto}</span>
                  </div>
                </div>
                <div className="pt-4 border-t border-outline-variant/10 flex justify-between items-center">
                  <span className="text-xs font-medium text-outline uppercase tracking-tighter">
                    Validado: {formatDate(project.updatedAtUtc || "")}
                  </span>
                  <Link
                    to={`/projects/${project.id}`}
                    className="text-secondary font-bold text-sm hover:underline"
                  >
                    Detalles
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ===== HOW IT WORKS — BENTO 3-STEP ===== */
const MethodologySection: React.FC = () => (
  <section id="metodologia" className="py-24 px-8 bg-surface-container-low">
    <div className="max-w-7xl mx-auto space-y-16">
      <div className="text-center space-y-4">
        <span className="label">Metodología</span>
        <h2 className="text-4xl md:text-5xl font-display font-bold text-brand-blue">
          Transparencia en 3 Pasos
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Step 1 — Light Card */}
        <motion.div
          {...fadeInUp}
          className="bg-surface p-12 rounded-lg flex flex-col space-y-6 border border-outline-variant/20"
        >
          <div className="w-16 h-16 bg-secondary text-white rounded-2xl flex items-center justify-center font-display font-black text-2xl">
            01
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-display font-extrabold text-brand-blue">
              Buscar
            </h3>
            <p className="text-on-surface-variant">
              Localice el proyecto mediante su nombre legal o código único de
              radicación nacional.
            </p>
          </div>
        </motion.div>

        {/* Step 2 — Blue Highlighted Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          viewport={{ once: true }}
          className="bg-brand-blue p-12 rounded-lg flex flex-col space-y-6 text-white shadow-2xl"
        >
          <div className="w-16 h-16 bg-primary-container text-on-primary-container rounded-2xl flex items-center justify-center font-display font-black text-2xl">
            02
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-display font-extrabold">Consultar</h3>
            <p className="text-white/70">
              Nuestro motor de búsqueda conecta con curadurías, notarías y
              registros públicos en tiempo real.
            </p>
          </div>
        </motion.div>

        {/* Step 3 — Light Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
          className="bg-surface p-12 rounded-lg flex flex-col space-y-6 border border-outline-variant/20"
        >
          <div className="w-16 h-16 bg-secondary text-white rounded-2xl flex items-center justify-center font-display font-black text-2xl">
            03
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-display font-extrabold text-brand-blue">
              Verificar
            </h3>
            <p className="text-on-surface-variant">
              Obtenga el certificado de validez técnica y jurídica con sello de
              autoridad institucional.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

/* ===== FINAL CTA ===== */
const CtaSection: React.FC = () => (
  <section id="servicios" className="relative py-24 px-8 overflow-hidden bg-surface">
    <motion.div
      {...fadeInUp}
      className="max-w-5xl mx-auto bg-primary text-white rounded-xl p-12 md:p-20 relative overflow-hidden"
    >
      {/* Abstract Geometric Decoration */}
      <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute -left-20 -top-20 w-60 h-60 bg-primary-container/20 rounded-full blur-2xl" />

      <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6 text-center md:text-left">
          <h2 className="text-4xl font-display font-extrabold leading-tight text-white">
            ¿Es usted un profesional inmobiliario?
          </h2>
          <p className="text-white/80 text-lg">
            Únase a VeriFinca y obtenga la confianza de sus clientes y la seguridad de sus inversiones.
          </p>
        </div>
        <div className="flex flex-col md:items-end gap-4">
          <Link
            to="/register"
            className="bg-primary-container text-on-primary-container px-10 py-5 rounded-full font-display font-black text-xl shadow-2xl active:scale-95 transition-transform text-center"
          >
            Solicitar Acceso
          </Link>
          <p className="text-white/60 text-sm text-center md:text-right">
            Soporte 24/7
          </p>
        </div>
      </div>
    </motion.div>
  </section>
);

/* ===== FOOTER ===== */
const LandingFooter: React.FC = () => (
  <footer className="bg-brand-blue-dark text-brand-cream font-sans font-light tracking-wide w-full py-12 px-8 flex flex-col md:flex-row justify-between items-center gap-6">
    <div className="flex flex-col items-center md:items-start gap-4">
      <Link to="/" className="flex items-center">
        <img
          src="/brand/logotipo/LOGOTIPO WHITE.svg"
          alt="VeriFinca"
          className="h-10 w-auto"
        />
      </Link>
      <p className="text-brand-cream/60 text-center md:text-left max-w-xs">
        © 2026 VeriFinca. Plataforma de Consulta de Proyectos Inmobiliarios en RD.
      </p>
    </div>
    <div className="flex flex-wrap justify-center gap-8">
      {[
        { label: "Términos Legales", href: "#" },
        { label: "Privacidad", href: "#" },
        { label: "Conexiones Institucionales", href: "#" },
        { label: "Soporte", href: "#" },
      ].map((link) => (
        <a
          key={link.label}
          href={link.href}
          className="text-brand-cream/60 hover:text-brand-cream transition-colors"
        >
          {link.label}
        </a>
      ))}
    </div>
    <div className="flex gap-4">
      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary-container hover:text-on-primary-container cursor-pointer transition-all">
        <Gavel className="w-5 h-5" />
      </div>
      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary-container hover:text-on-primary-container cursor-pointer transition-all">
        <Building2 className="w-5 h-5" />
      </div>
    </div>
  </footer>
);

/* ===== MAIN LANDING PAGE ===== */
export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-surface selection:bg-primary-container selection:text-on-primary-container overflow-x-hidden">
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
