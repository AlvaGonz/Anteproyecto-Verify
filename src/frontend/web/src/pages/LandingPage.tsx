import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Search, ChevronLeft, ChevronRight, ArrowRight as ArrowForward, MapPin as LocationOn, Landmark as AccountBalance, Gavel as GavelIcon } from "lucide-react";
import {
  ProjectStatus,
  IntegrityStatus,
  ProyectoDto
} from "../features/projects/types";
import { projectsApi } from "../features/projects/api/projectsApi";

/* ===== NAVIGATION ===== */
const LandingNav: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-50 flex justify-between items-center px-8 h-20 transition-all duration-300 font-headline font-bold tracking-tight shadow-2xl shadow-secondary/10 ${scrolled ? 'bg-secondary/95 backdrop-blur-xl' : 'bg-secondary dark:bg-[#111144]'}`}>
      <div className="text-2xl font-extrabold text-[#F4F1EC]">VeriFinca</div>
      <div className="hidden md:flex items-center gap-8">
        <a className="text-white border-b-4 border-primary pb-1 hover:text-white transition-colors duration-300" href="#servicios">Servicios</a>
        <a className="text-[#F4F1EC]/80 hover:text-white transition-colors duration-300" href="#proyectos">Propiedades</a>
        <a className="text-[#F4F1EC]/80 hover:text-white transition-colors duration-300" href="#empresa">Empresa</a>
      </div>
      <div className="flex items-center gap-4">
        <Link to="/login" className="text-white/80 hover:text-white font-bold transition-colors">
          Iniciar Sesión
        </Link>
        <Link to="/register" className="vf-btn-primary !px-6 !py-2.5">
          Acceso Profesional
        </Link>
      </div>
    </nav>
  );
};

/* ===== HERO ===== */
const HeroSection: React.FC = () => {
  const [code, setCode] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim()) {
      window.location.hash = `/verify/${code.trim()}`;
    }
  };

  return (
    <section className="relative min-h-[870px] flex items-center overflow-hidden px-8 md:px-16 pt-20">
      {/* Background Video Loop */}
      <div className="absolute right-0 top-0 w-full md:w-1/2 h-full -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/40 to-transparent z-10 w-full"></div>
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover opacity-60 grayscale hover:grayscale-0 transition-all duration-1000"
        >
          <source src="/media/landing_Sketch_to_finished_202604121407.mp4" type="video/mp4" />
          Tu navegador no soporta el elemento de video.
        </video>
      </div>

      <div className="max-w-4xl space-y-8">
        <div className="space-y-4">
          <span className="text-secondary font-headline font-bold uppercase tracking-widest text-sm bg-secondary-container/20 px-4 py-1.5 rounded-full inline-block">Autoridad Institucional</span>
          <h1 className="text-5xl md:text-7xl font-headline font-[800] text-secondary leading-[1.1] tracking-tight">
            Consulta la validez legal de cualquier proyecto inmobiliario
          </h1>
        </div>

        {/* Search Container */}
        <div className="relative group max-w-2xl">
          <form onSubmit={handleSearch} className="bg-surface-container-lowest p-2 rounded-full flex flex-col sm:flex-row items-center shadow-2xl shadow-[#111144]/10 border border-outline-variant/20 transition-all focus-within:ring-2 focus-within:ring-primary-container">
            <div className="hidden sm:block pl-6 text-outline">
              <Search className="w-6 h-6" />
            </div>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full bg-transparent border-none focus:ring-0 px-4 py-2 sm:py-0 text-lg font-medium placeholder:text-outline/60 outline-none"
              placeholder="Ingresa el codigo o nombre del proyecto"
              type="text"
            />
            <button type="submit" className="w-full sm:w-auto bg-primary-container mt-2 sm:mt-0 text-on-primary-container px-8 py-4 rounded-full font-headline font-bold text-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer flex justify-center items-center gap-2">
              <Search className="w-5 h-5 sm:hidden" />
              Consultar proyecto
            </button>
          </form>
        </div>

        <p className="text-on-surface-variant text-lg max-w-xl font-light">
          Acceda a la base de datos mas robusta de validacion institucional en tiempo real.
          Seguridad juridica para inversores y profesionales.
        </p>
      </div>
    </section>
  );
};

/* ===== TRUST STRIP ===== */
const TrustStrip: React.FC = () => (
  <section className="bg-surface-container-low py-16 px-8 border-y border-outline-variant/10">
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
      <div className="flex flex-col items-center md:items-start space-y-2">
        <span className="text-4xl font-headline font-extrabold text-secondary">500+</span>
        <span className="text-on-surface-variant uppercase tracking-widest text-xs font-semibold">Proyectos validados</span>
      </div>
      <div className="flex flex-col items-center md:items-start space-y-2 border-x-0 md:border-x border-outline-variant/30 px-0 md:px-12">
        <span className="text-4xl font-headline font-extrabold text-secondary">15k</span>
        <span className="text-on-surface-variant uppercase tracking-widest text-xs font-semibold">Documentos revisados</span>
      </div>
      <div className="flex flex-col items-center md:items-start space-y-2">
        <span className="text-4xl font-headline font-extrabold text-secondary">20+</span>
        <span className="text-on-surface-variant uppercase tracking-widest text-xs font-semibold">Instituciones conectadas</span>
      </div>
    </div>
  </section>
);

/* ===== PROJECTS CAROUSEL ===== */
const getIntegrityBadge = (status: IntegrityStatus) => {
  switch (status) {
    case IntegrityStatus.Verified:
      return <span className="bg-primary-container text-on-primary-container px-4 py-1.5 rounded-full text-xs font-bold shadow-lg">Verificado</span>;
    case IntegrityStatus.Failed:
      return <span className="bg-error-container text-on-error-container px-4 py-1.5 rounded-full text-xs font-bold shadow-lg">Observado</span>;
    default:
      return <span className="bg-secondary-container text-on-secondary-container px-4 py-1.5 rounded-full text-xs font-bold shadow-lg">En revision</span>;
  }
};

const ProjectShowcaseCard: React.FC<{ project: ProyectoDto }> = ({ project }) => {
  const imagePlaceholder = project.estadoIntegridad === IntegrityStatus.Verified ?
    "https://lh3.googleusercontent.com/aida-public/AB6AXuA-yxambKq-MDwXrLr8SQMhX9qKEQPzyDfJJoIfq_daCtiVY-rKuihX6J_3NuhCGft1rq5sApK2weuYH47iHLVVCwcWZ7x27ch7lUIgvZ7_6FTF_53MtMQtu7Rmue_DksGm__qlnjlMwJzuAX6DcqtUqifhXSJJTnQnmvwfuGzIeLP809m0AqD2CQlNOVsOfQMqNpd7PnoAIw7OgD7vsM1m_e4BFBkv6AnGLTO9p_Zl_3f6caOQrdBYMZgWskxRMU9JcCBN0wxEuTM"
    : project.estadoIntegridad === IntegrityStatus.Failed ? "https://lh3.googleusercontent.com/aida-public/AB6AXuApNYdq1fBuPkUf27TUYKFLOWUwfdrWhiRz_I8D4gjAWs0q2Ec5jiQD3UcVdsKMBPLpoT-UXCekET20CqAgvoKDYWcDPyCw-gVmj8nQnbAfF4gamkl-fVCxEp2IwU7_vFhDgdXdJ8GtIBlruupWvTx02uyZQ_cXuaYrBAJC7lE3x5iLT03pXZ8BANqxgbRaC3YvKd0HNjAbbp9exzZTgXAt9mMOhz3HDIiTeEAN3kHFRdpwaIxvOQ3cd9dJlVY6FbeUhRXqSolF1KI"
      : "https://lh3.googleusercontent.com/aida-public/AB6AXuCXVO8D2hnijRbR5NYneAZKuktnR6hSWeBL-o-5zD1IRCRmJF9Scg0xoJu69VwzeiFnB2QYBEc3C2gGzLhP1h9mQGjOw0NjFrJuCTP4aSi7vC6bhR7NsJsNs7Hgu8WjPZ9kqm7LgB08vCWNrbnXpRe27owNMltaZYgcv-g15xirkkF0rK5sxiqgTu5vQXzFLTwD_FXiDvvLb9QHyYQcdeQi2oXIfs6HuRIALXJqzO5lmsvXJ43pOJEUuDLsu9VB9fwxPRGUulT8NL4";

  return (
    <Link to={`/projects/${project.id}`} className="min-w-[80vw] md:min-w-[calc(33.333%-22px)] snap-start group bg-surface-container-lowest rounded-lg overflow-hidden border border-outline-variant/30 hover:shadow-xl transition-all duration-300 block">
      <div className="h-64 relative overflow-hidden bg-surface-container">
        <div className="absolute inset-0 bg-gradient-to-tr from-secondary/20 to-transparent"></div>
        <img
          alt={project.nombre}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          src={imagePlaceholder}
        />
        <div className="absolute top-4 right-4">
          {getIntegrityBadge(project.estadoIntegridad)}
        </div>
      </div>
      <div className="p-8 space-y-4">
        <div className="space-y-1">
          <h3 className="text-xl font-headline font-bold text-secondary truncate">{project.nombre}</h3>
          <div className="flex items-center text-on-surface-variant text-sm gap-1 truncate">
            <LocationOn className="w-4 h-4" />
            {project.ubicacionTexto}
          </div>
        </div>
        <div className="pt-4 border-t border-outline-variant/10 flex justify-between items-center">
          <span className="text-xs font-medium text-outline uppercase tracking-tighter">
            {project.estadoIntegridad === IntegrityStatus.Verified ? "Validado" : "Estado"}: {project.codigoInterno}
          </span>
          <button className="text-secondary font-bold text-sm hover:underline">Detalles</button>
        </div>
      </div>
    </Link>
  );
};

const ProjectsCarouselSection: React.FC = () => {
  const [projects, setProjects] = useState<ProyectoDto[]>([]);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    projectsApi.getProjects().then(setProjects).catch(console.error);
  }, []);

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -400, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 400, behavior: 'smooth' });
    }
  };

  const featuredProjects = projects.filter(p => p.estadoProyecto === ProjectStatus.Published || p.estadoProyecto === ProjectStatus.Validated).slice(0, 6);

  return (
    <section id="proyectos" className="py-24 px-8 bg-surface">
      <div className="max-w-7xl mx-auto relative">
        <div className="flex flex-col md:flex-row justify-between md:items-end mb-16 gap-6">
          <div className="space-y-4">
            <span className="text-primary font-bold uppercase tracking-widest text-xs">Portafolio</span>
            <h2 className="text-4xl font-headline font-bold text-secondary">Proyectos Destacados</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <button onClick={scrollLeft} className="p-2 rounded-full border border-outline-variant/30 text-secondary hover:bg-secondary hover:text-white transition-colors cursor-pointer">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button onClick={scrollRight} className="p-2 rounded-full border border-outline-variant/30 text-secondary hover:bg-secondary hover:text-white transition-colors cursor-pointer">
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
            <Link to="/projects" className="text-secondary font-bold flex items-center gap-2 hover:underline ml-4">
              Ver todos <ArrowForward className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {featuredProjects.length === 0 ? (
          <div className="flex gap-8 overflow-hidden">
            {[1, 2, 3].map(i => (
              <div key={i} className="min-w-[80vw] md:min-w-[calc(33.333%-22px)] h-[450px] bg-secondary/[0.03] rounded-3xl animate-pulse overflow-hidden">
                <div className="h-64 bg-secondary/[0.05]" />
                <div className="p-8 space-y-4">
                  <div className="h-6 w-3/4 bg-secondary/[0.08] rounded-xl" />
                  <div className="h-4 w-1/2 bg-secondary/[0.05] rounded-xl" />
                  <div className="pt-8 flex justify-between">
                    <div className="h-4 w-1/4 bg-secondary/[0.05] rounded-xl" />
                    <div className="h-4 w-1/4 bg-secondary/[0.05] rounded-xl" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            ref={carouselRef}
            className="flex overflow-x-auto no-scrollbar snap-x snap-mandatory gap-8 pb-4 scroll-smooth"
            style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
          >
            {featuredProjects.map(project => (
              <ProjectShowcaseCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

/* ===== HOW IT WORKS (Bento) ===== */
const HowItWorksSection: React.FC = () => (
  <section className="py-24 px-8 bg-surface-container-low">
    <div className="max-w-7xl mx-auto space-y-16">
      <div className="text-center space-y-4">
        <span className="text-primary font-bold uppercase tracking-widest text-xs">Metodologia</span>
        <h2 className="text-4xl md:text-5xl font-headline font-bold text-secondary">Transparencia en 3 Pasos</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        <div className="bg-surface p-12 rounded-lg flex flex-col space-y-6 border border-outline-variant/20">
          <div className="w-16 h-16 bg-secondary text-white rounded-2xl flex items-center justify-center font-headline font-black text-2xl">01</div>
          <div className="space-y-2">
            <h3 className="text-2xl font-headline font-extrabold text-secondary">Buscar</h3>
            <p className="text-on-surface-variant">Localice el proyecto mediante su nombre legal o codigo unico de radicacion nacional.</p>
          </div>
        </div>

        <div className="bg-secondary p-12 rounded-lg flex flex-col space-y-6 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-[#111144] opacity-50"></div>
          <div className="relative z-10 w-16 h-16 bg-primary-container text-on-primary-container rounded-2xl flex items-center justify-center font-headline font-black text-2xl">02</div>
          <div className="relative z-10 space-y-2">
            <h3 className="text-2xl font-headline font-extrabold">Consultar</h3>
            <p className="text-white/70">Nuestro motor de busqueda conecta con curadurias, notarias y registros publicos en tiempo real.</p>
          </div>
        </div>

        <div className="bg-surface p-12 rounded-lg flex flex-col space-y-6 border border-outline-variant/20">
          <div className="w-16 h-16 bg-secondary text-white rounded-2xl flex items-center justify-center font-headline font-black text-2xl">03</div>
          <div className="space-y-2">
            <h3 className="text-2xl font-headline font-extrabold text-secondary">Verificar</h3>
            <p className="text-on-surface-variant">Obtenga el certificado de validez tecnica y juridica con sello de autoridad institucional.</p>
          </div>
        </div>

      </div>
    </div>
  </section>
);

/* ===== FINAL CTA ===== */
const FinalCTASection: React.FC = () => (
  <section className="relative py-24 px-8 overflow-hidden bg-surface">
    <div className="max-w-5xl mx-auto bg-primary text-white rounded-xl p-12 md:p-20 relative overflow-hidden text-center md:text-left">
      {/* Abstract Geometric Decoration */}
      <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -left-20 -top-20 w-60 h-60 bg-primary-container/20 rounded-full blur-2xl pointer-events-none"></div>

      <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h2 className="text-4xl font-headline font-extrabold leading-tight">¿Es usted un profesional inmobiliario?</h2>
          <p className="text-white/80 text-lg">Unase al portal profesional y obtenga reportes detallados y API para integraciones directas.</p>
        </div>
        <div className="flex flex-col md:items-end gap-4">
          <Link to="/register" className="vf-btn-primary !px-10 !py-5 !rounded-xl !text-xl shadow-2xl">
            Solicitar Acceso
          </Link>
          <p className="text-white/60 text-sm">Soporte institucional 24/7</p>
        </div>
      </div>
    </div>
  </section>
);

/* ===== FOOTER ===== */
const Footer: React.FC = () => (
  <footer className="bg-[#111144] dark:bg-[#080822] text-[#F4F1EC] font-['Inter'] font-light tracking-wide w-full py-12 px-8 flex flex-col md:flex-row justify-between items-center gap-6">
    <div className="flex flex-col items-center md:items-start gap-4">
      <div className="text-lg font-bold text-[#F4F1EC]">VeriFinca</div>
      <p className="text-[#F4F1EC]/60 text-center md:text-left max-w-xs">
        © {new Date().getFullYear()} VeriFinca. Institutional Authority in Real Estate.
      </p>
    </div>

    <div className="flex flex-wrap justify-center gap-8">
      <Link to="#" className="text-[#F4F1EC]/60 hover:text-[#F4F1EC] transition-colors">Terminos Legales</Link>
      <Link to="#" className="text-[#F4F1EC]/60 hover:text-[#F4F1EC] transition-colors">Privacidad</Link>
      <Link to="#" className="text-[#F4F1EC]/60 hover:text-[#F4F1EC] transition-colors">Conexiones Institucionales</Link>
      <Link to="#" className="text-[#F4F1EC]/60 hover:text-[#F4F1EC] transition-colors">Soporte</Link>
    </div>

    <div className="flex gap-4">
      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary-container hover:text-on-primary-container cursor-pointer transition-all">
        <GavelIcon className="w-5 h-5" />
      </div>
      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary-container hover:text-on-primary-container cursor-pointer transition-all">
        <AccountBalance className="w-5 h-5" />
      </div>
    </div>
  </footer>
);

/* ===== MAIN PAGE ===== */
export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-surface selection:bg-primary-container selection:text-on-primary-container font-body text-on-surface">
      <LandingNav />
      <main>
        <HeroSection />
        <TrustStrip />
        <ProjectsCarouselSection />
        <HowItWorksSection />
        <FinalCTASection />
      </main>
      <Footer />
    </div>
  );
};
