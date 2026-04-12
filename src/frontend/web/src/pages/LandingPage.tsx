import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Shield,
  FileCheck,
  MapPin,
  Clock,
  ChevronRight,
  Search,
  Building2,
  Scale,
  QrCode,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Timer,
  Users,
  Globe,
  Lock,
  Zap,
  Menu,
  X,
} from "lucide-react";
import { ProyectoDto, ProjectStatus, IntegrityStatus, ProjectCategory } from "../features/projects/types";
import { projectsApi } from "../features/projects/api/projectsApi";

/* ===== NAVIGATION ===== */
const LandingNav: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[var(--color-brand-primary)]/95 backdrop-blur-md shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link to="/" className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-[var(--color-brand-accent-soft)]" />
            <span className="text-xl font-bold text-[var(--color-text-on-dark)] tracking-tight">
              VeriFinca
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#como-funciona" className="text-sm font-medium text-[var(--color-text-on-dark)] opacity-80 hover:opacity-100 transition-opacity">
              Como Funciona
            </a>
            <a href="#proyectos" className="text-sm font-medium text-[var(--color-text-on-dark)] opacity-80 hover:opacity-100 transition-opacity">
              Proyectos
            </a>
            <a href="#verificar" className="text-sm font-medium text-[var(--color-text-on-dark)] opacity-80 hover:opacity-100 transition-opacity">
              Verificar
            </a>
            <Link
              to="/admin/dashboard"
              className="text-sm font-medium text-[var(--color-text-on-dark)] opacity-80 hover:opacity-100 transition-opacity"
            >
              Plataforma
            </Link>
            <Link
              to="/verify"
              className="vf-btn-accent text-sm py-2 px-5"
            >
              <QrCode className="w-4 h-4" />
              Verificar Sello
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden text-[var(--color-text-on-dark)] p-2"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden pb-4 border-t border-white/10">
            <div className="flex flex-col gap-2 pt-4">
              <a href="#como-funciona" onClick={() => setOpen(false)} className="text-sm font-medium text-[var(--color-text-on-dark)] py-2 px-3 rounded-lg hover:bg-white/10">
                Como Funciona
              </a>
              <a href="#proyectos" onClick={() => setOpen(false)} className="text-sm font-medium text-[var(--color-text-on-dark)] py-2 px-3 rounded-lg hover:bg-white/10">
                Proyectos
              </a>
              <Link to="/admin/dashboard" onClick={() => setOpen(false)} className="text-sm font-medium text-[var(--color-text-on-dark)] py-2 px-3 rounded-lg hover:bg-white/10">
                Plataforma
              </Link>
              <Link to="/verify" onClick={() => setOpen(false)} className="vf-btn-accent text-sm py-2 px-5 mt-2">
                <QrCode className="w-4 h-4" /> Verificar Sello
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

/* ===== HERO ===== */
const HeroSection: React.FC = () => (
  <section className="relative overflow-hidden bg-[var(--color-brand-primary)] pt-32 pb-20 lg:pt-40 lg:pb-32">
    {/* Background pattern */}
    <div className="absolute inset-0 opacity-[0.04]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M30 0l30 30-30 30L0 30z' fill-opacity='0.2'/%3E%3C/g%3E%3C/svg%3E")`,
        backgroundSize: "60px 60px",
      }}
    />
    <div className="absolute top-20 right-0 w-[600px] h-[600px] rounded-full bg-[var(--color-brand-secondary)] opacity-5 blur-3xl" />
    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[var(--color-brand-accent)] opacity-5 blur-3xl" />

    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div className="animate-fade-in-up">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 rounded-full bg-[var(--color-brand-accent-soft)] animate-pulse" />
            <span className="text-sm font-medium text-[var(--color-text-on-dark)] opacity-90">
              Plataforma Oficial de Verificacion Inmobiliaria
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight mb-6">
            Confianza{" "}
            <span className="text-[var(--color-brand-accent-soft)]">verificable</span>
            {" "}en cada proyecto inmobiliario
          </h1>

          <p className="text-lg text-[var(--color-text-on-dark)] opacity-80 max-w-xl mb-8 leading-relaxed">
            Validamos documentacion legal, fiscal y catastral de proyectos en
            Republica Dominicana. Reducimos el proceso de verificacion de
            <strong className="text-[var(--color-brand-accent-soft)]"> 15 dias a 2 minutos</strong>.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link to="/projects" className="vf-btn-accent py-3 px-6 text-base">
              <Building2 className="w-5 h-5" />
              Explorar Proyectos
            </Link>
            <a href="#verificar" className="vf-btn-secondary py-3 px-6 text-base bg-white/10 border-white/20 text-white hover:bg-white/20">
              <Search className="w-5 h-5" />
              Verificar un Proyecto
            </a>
          </div>

          {/* Trust numbers */}
          <div className="flex gap-8 mt-12 pt-8 border-t border-white/10">
            <div>
              <div className="text-2xl font-bold text-white">500+</div>
              <div className="text-sm text-[var(--color-text-on-dark)] opacity-60">Proyectos verificados</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">99.2%</div>
              <div className="text-sm text-[var(--color-text-on-dark)] opacity-60">Disponibilidad</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">&lt;2min</div>
              <div className="text-sm text-[var(--color-text-on-dark)] opacity-60">Tiempo de validacion</div>
            </div>
          </div>
        </div>

        {/* Hero visual - verification flow card */}
        <div className="hidden lg:block animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <div className="relative">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-brand-accent-soft)] flex items-center justify-center">
                  <Shield className="w-5 h-5 text-[var(--color-brand-primary)]" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">Sello de Integridad Digital</div>
                  <div className="text-xs text-white/60">Emitido por VeriFinca</div>
                </div>
              </div>

              {/* Verification steps */}
              {[
                { icon: FileCheck, label: "Documentacion Legal", status: "Verificado", color: "text-emerald-400" },
                { icon: Scale, label: "Validacion DGII / RNC", status: "Verificado", color: "text-emerald-400" },
                { icon: MapPin, label: "Catastro Nacional", status: "Verificado", color: "text-emerald-400" },
                { icon: Building2, label: "Ayuntamiento Municipal", status: "Verificado", color: "text-emerald-400" },
                { icon: QrCode, label: "Sello de Integridad", status: "Emitido", color: "text-[var(--color-brand-accent-soft)]" },
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-3 py-3 border-b border-white/5 last:border-0">
                  <step.icon className="w-4 h-4 text-white/50" />
                  <span className="text-sm text-white/80 flex-1">{step.label}</span>
                  <span className={`text-xs font-semibold ${step.color}`}>{step.status}</span>
                </div>
              ))}

              <div className="mt-6 bg-emerald-500/10 rounded-lg p-3 flex items-center gap-3 border border-emerald-500/20">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <span className="text-sm text-emerald-300 font-medium">
                  Proyecto verificado - Score de Integridad: 95/100
                </span>
              </div>
            </div>

            {/* Floating badge */}
            <div className="absolute -top-4 -right-4 bg-[var(--color-brand-accent-soft)] text-[var(--color-text-strong)] px-4 py-2 rounded-full text-sm font-bold shadow-lg">
              Ley 126-02
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

/* ===== HOW IT WORKS ===== */
const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      icon: Building2,
      title: "Registro del Proyecto",
      description: "El desarrollador registra el expediente digital con metadatos, GPS e informacion del proyecto.",
      color: "bg-[var(--color-brand-primary)]",
    },
    {
      icon: FileCheck,
      title: "Diagnostico Documental",
      description: "El sistema identifica documentos faltantes segun el tipo de proyecto y regulaciones del RI.",
      color: "bg-[var(--color-brand-secondary)]",
    },
    {
      icon: Globe,
      title: "Validacion Institucional",
      description: "Contraste automatico con DGII, Catastro Nacional, Ayuntamientos y Jurisdiccion Inmobiliaria.",
      color: "bg-[var(--color-brand-accent)]",
    },
    {
      icon: QrCode,
      title: "Sello de Integridad",
      description: "Proyectos aprobados reciben un codigo QR firmado digitalmente (Ley 126-02) verificable publicamente.",
      color: "bg-[var(--color-brand-accent-soft)]",
    },
  ];

  return (
    <section id="como-funciona" className="py-20 lg:py-28 bg-[var(--color-surface-base)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-[var(--color-surface-alt)] rounded-full px-4 py-1.5 mb-4">
            <Zap className="w-4 h-4 text-[var(--color-brand-accent)]" />
            <span className="text-sm font-semibold text-[var(--color-text-strong)]">Proceso Simplificado</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-text-strong)] mb-4">
            Como funciona VeriFinca
          </h2>
          <p className="text-base text-[var(--color-text-strong)] opacity-70">
            Un proceso automatizado que reduce la verificacion manual de semanas a minutos.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <div key={i} className="relative group">
              <div className="vf-card p-6 h-full hover:-translate-y-1 transition-transform duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl ${step.color} flex items-center justify-center`}>
                    <step.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs font-bold text-[var(--color-surface-muted)] uppercase tracking-wider">
                    Paso {i + 1}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[var(--color-text-strong)] mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-[var(--color-text-strong)] opacity-70 leading-relaxed">
                  {step.description}
                </p>
              </div>
              {/* Connector */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                  <ChevronRight className="w-6 h-6 text-[var(--color-surface-muted)]" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ===== FEATURES ===== */
const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: Shield,
      title: "Diagnostico Documental RI",
      description: "Evaluacion automatica basada en los requisitos del Registro Inmobiliario y Ley 108-05.",
    },
    {
      icon: Scale,
      title: "Validacion DGII",
      description: "Verificacion del estatus fiscal, RNC activo y cumplimiento tributario del desarrollador.",
    },
    {
      icon: MapPin,
      title: "Georeferenciacion Catastral",
      description: "Contraste de limites y areas declaradas con los registros del Catastro Nacional.",
    },
    {
      icon: Lock,
      title: "Gestion de Consentimiento",
      description: "Captura legal de consentimiento para consultas crediticias bajo la Ley 172-13.",
    },
    {
      icon: FileCheck,
      title: "Deteccion de Duplicidad",
      description: "Identificacion de duplicidades registrales y documentales para prevenir fraude.",
    },
    {
      icon: Users,
      title: "Verificacion Crediticia",
      description: "Consulta a TransUnion o equivalente para historial crediticio del desarrollador.",
    },
  ];

  return (
    <section className="py-20 lg:py-28 bg-[var(--color-surface-alt)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <div className="lg:sticky lg:top-28">
            <div className="inline-flex items-center gap-2 bg-[var(--color-brand-primary)]/10 rounded-full px-4 py-1.5 mb-4">
              <Shield className="w-4 h-4 text-[var(--color-brand-primary)]" />
              <span className="text-sm font-semibold text-[var(--color-brand-primary)]">Capacidades</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-text-strong)] mb-4">
              Validacion integral contra fuentes oficiales
            </h2>
            <p className="text-base text-[var(--color-text-strong)] opacity-70 mb-8 leading-relaxed">
              VeriFinca cruza datos en tiempo real con las principales instituciones dominicanas para
              asegurar la legitimidad de cada proyecto inmobiliario.
            </p>
            <div className="flex gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-[var(--color-brand-accent)]">20+</div>
                <div className="text-xs text-[var(--color-text-strong)] opacity-60 mt-1">Tipos de documento</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[var(--color-brand-secondary)]">6</div>
                <div className="text-xs text-[var(--color-text-strong)] opacity-60 mt-1">Fuentes oficiales</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[var(--color-brand-primary)]">AES-256</div>
                <div className="text-xs text-[var(--color-text-strong)] opacity-60 mt-1">Cifrado</div>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            {features.map((f, i) => (
              <div key={i} className="vf-card p-5 flex gap-4 items-start hover:-translate-y-0.5 transition-transform">
                <div className="w-10 h-10 rounded-lg bg-[var(--color-brand-primary)]/10 flex items-center justify-center flex-shrink-0">
                  <f.icon className="w-5 h-5 text-[var(--color-brand-primary)]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[var(--color-text-strong)] mb-1">{f.title}</h3>
                  <p className="text-sm text-[var(--color-text-strong)] opacity-70 leading-relaxed">{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

/* ===== PROJECTS SHOWCASE ===== */
const getCategoryLabel = (cat: ProjectCategory) => {
  switch (cat) {
    case ProjectCategory.Residencial: return "Residencial";
    case ProjectCategory.Comercial: return "Comercial";
    case ProjectCategory.Turistico: return "Turistico";
    case ProjectCategory.Mixto: return "Mixto";
    default: return "Otro";
  }
};

const getStatusInfo = (status: ProjectStatus) => {
  switch (status) {
    case ProjectStatus.Published: return { label: "Publicado", class: "vf-badge-success" };
    case ProjectStatus.InReview: return { label: "En Revision", class: "vf-badge-warning" };
    case ProjectStatus.Observed: return { label: "Observado", class: "vf-badge-accent" };
    case ProjectStatus.Validated: return { label: "Validado", class: "vf-badge-primary" };
    case ProjectStatus.Rejected: return { label: "Rechazado", class: "vf-badge-error" };
    default: return { label: "Borrador", class: "vf-badge-neutral" };
  }
};

const getIntegrityInfo = (status: IntegrityStatus) => {
  switch (status) {
    case IntegrityStatus.Verified: return { label: "Verificado", icon: CheckCircle2, color: "text-emerald-600" };
    case IntegrityStatus.Failed: return { label: "Fallido", icon: AlertTriangle, color: "text-red-600" };
    default: return { label: "Pendiente", icon: Timer, color: "text-amber-600" };
  }
};

const ProjectShowcaseCard: React.FC<{ project: ProyectoDto }> = ({ project }) => {
  const statusInfo = getStatusInfo(project.estadoProyecto);
  const integrityInfo = getIntegrityInfo(project.estadoIntegridad);
  const IntIcon = integrityInfo.icon;

  return (
    <Link
      to={`/projects/${project.id}`}
      className="vf-card p-6 flex flex-col h-full hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
    >
      {/* Top row */}
      <div className="flex items-start justify-between mb-3">
        <span className={`vf-badge ${statusInfo.class}`}>{statusInfo.label}</span>
        <span className="text-xs font-mono text-[var(--color-text-strong)] opacity-50">
          {project.codigoInterno}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-lg font-bold text-[var(--color-text-strong)] mb-1 group-hover:text-[var(--color-brand-primary)] transition-colors">
        {project.nombre}
      </h3>

      {/* Location */}
      <div className="flex items-center gap-1.5 text-sm text-[var(--color-text-strong)] opacity-60 mb-4">
        <MapPin className="w-3.5 h-3.5" />
        {project.ubicacionTexto}
      </div>

      {/* Details */}
      <div className="flex-1" />

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-[var(--color-surface-base)] rounded-lg px-3 py-2">
          <div className="text-xs text-[var(--color-text-strong)] opacity-50 mb-0.5">Categoria</div>
          <div className="text-sm font-semibold text-[var(--color-text-strong)]">
            {getCategoryLabel(project.categoria)}
          </div>
        </div>
        <div className="bg-[var(--color-surface-base)] rounded-lg px-3 py-2">
          <div className="text-xs text-[var(--color-text-strong)] opacity-50 mb-0.5">Valor</div>
          <div className="text-sm font-semibold text-[var(--color-text-strong)]">
            {project.valorEstimado ? `$${(project.valorEstimado / 1_000_000).toFixed(1)}M` : "N/D"}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-[var(--color-surface-muted)]/50">
        <div className={`flex items-center gap-1.5 text-sm font-semibold ${integrityInfo.color}`}>
          <IntIcon className="w-4 h-4" />
          {integrityInfo.label}
        </div>
        <span className="text-sm font-medium text-[var(--color-brand-primary)] group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
          Ver Detalle <ArrowRight className="w-4 h-4" />
        </span>
      </div>
    </Link>
  );
};

const ProjectsShowcase: React.FC = () => {
  const [projects, setProjects] = useState<ProyectoDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "verified" | "review">("all");

  useEffect(() => {
    (async () => {
      try {
        const data = await projectsApi.getProjects();
        setProjects(data);
      } catch (e) {
        console.error("Error loading projects", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = projects.filter((p) => {
    if (filter === "verified") return p.estadoIntegridad === IntegrityStatus.Verified;
    if (filter === "review") return p.estadoProyecto === ProjectStatus.InReview || p.estadoProyecto === ProjectStatus.Observed;
    return true;
  });

  return (
    <section id="proyectos" className="py-20 lg:py-28 bg-[var(--color-surface-base)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 bg-[var(--color-surface-alt)] rounded-full px-4 py-1.5 mb-4">
              <Building2 className="w-4 h-4 text-[var(--color-brand-secondary)]" />
              <span className="text-sm font-semibold text-[var(--color-text-strong)]">Proyectos Registrados</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-text-strong)]">
              Proyectos inmobiliarios
            </h2>
          </div>
          <div className="flex gap-2">
            {[
              { key: "all" as const, label: "Todos" },
              { key: "verified" as const, label: "Verificados" },
              { key: "review" as const, label: "En Revision" },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === f.key
                    ? "bg-[var(--color-brand-primary)] text-[var(--color-text-on-dark)]"
                    : "bg-[var(--color-surface-alt)] text-[var(--color-text-strong)] hover:bg-[var(--color-surface-muted)]"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="vf-card-flat p-6 h-[280px] animate-pulse">
                <div className="h-5 w-24 bg-[var(--color-surface-muted)] rounded-full mb-4" />
                <div className="h-6 w-3/4 bg-[var(--color-surface-muted)] rounded mb-2" />
                <div className="h-4 w-1/2 bg-[var(--color-surface-muted)] rounded" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Building2 className="w-12 h-12 text-[var(--color-surface-muted)] mx-auto mb-4" />
            <p className="text-lg font-medium text-[var(--color-text-strong)] opacity-70">
              No hay proyectos que coincidan con el filtro seleccionado.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((project) => (
              <ProjectShowcaseCard key={project.id} project={project} />
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Link to="/projects" className="vf-btn-secondary py-3 px-8 text-base">
            Ver Todos los Proyectos
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
};

/* ===== VERIFICATION CTA ===== */
const VerificationSection: React.FC = () => {
  const [code, setCode] = useState("");

  return (
    <section id="verificar" className="py-20 lg:py-28 bg-[var(--color-brand-primary)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 mb-6">
          <QrCode className="w-4 h-4 text-[var(--color-brand-accent-soft)]" />
          <span className="text-sm font-semibold text-[var(--color-text-on-dark)]">Consulta Publica</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          Verifica un proyecto ahora
        </h2>
        <p className="text-base text-[var(--color-text-on-dark)] opacity-70 mb-10 max-w-xl mx-auto">
          Ingresa el codigo de verificacion o escanea el QR del proyecto para consultar su estado de integridad.
          No se exponen datos personales (Ley 172-13).
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (code.trim()) window.location.hash = `/verify/${code.trim()}`;
          }}
          className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto"
        >
          <input
            type="text"
            placeholder="Ej. VF-2026-ABC123XYZ"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1 py-3 px-5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-base focus:outline-none focus:border-[var(--color-brand-accent-soft)] focus:ring-2 focus:ring-[var(--color-brand-accent-soft)]/30"
          />
          <button
            type="submit"
            className="vf-btn-accent py-3 px-6 text-base rounded-xl"
          >
            <Search className="w-5 h-5" />
            Verificar
          </button>
        </form>

        <div className="flex items-center justify-center gap-6 mt-10 pt-6 border-t border-white/10">
          <div className="flex items-center gap-2 text-white/60 text-sm">
            <Lock className="w-4 h-4" />
            Cifrado AES-256
          </div>
          <div className="flex items-center gap-2 text-white/60 text-sm">
            <Shield className="w-4 h-4" />
            Ley 126-02
          </div>
          <div className="flex items-center gap-2 text-white/60 text-sm">
            <Clock className="w-4 h-4" />
            Consulta en tiempo real
          </div>
        </div>
      </div>
    </section>
  );
};

/* ===== FOOTER ===== */
const Footer: React.FC = () => (
  <footer className="bg-[var(--color-brand-primary-hover)] py-12">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-6 h-6 text-[var(--color-brand-accent-soft)]" />
            <span className="text-lg font-bold text-white">VeriFinca</span>
          </div>
          <p className="text-sm text-white/50 leading-relaxed">
            Sistema integral de verificacion y autenticacion de proyectos inmobiliarios en
            Republica Dominicana.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Plataforma</h4>
          <ul className="space-y-2">
            <li><Link to="/projects" className="text-sm text-white/50 hover:text-white transition-colors">Proyectos</Link></li>
            <li><Link to="/verify" className="text-sm text-white/50 hover:text-white transition-colors">Verificar Sello</Link></li>
            <li><Link to="/consulta-publica" className="text-sm text-white/50 hover:text-white transition-colors">Consulta Publica</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Admin</h4>
          <ul className="space-y-2">
            <li><Link to="/admin/dashboard" className="text-sm text-white/50 hover:text-white transition-colors">Dashboard</Link></li>
            <li><Link to="/admin/projects" className="text-sm text-white/50 hover:text-white transition-colors">Gestion de Proyectos</Link></li>
            <li><Link to="/admin/rules" className="text-sm text-white/50 hover:text-white transition-colors">Reglas de Validacion</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Legal</h4>
          <ul className="space-y-2">
            <li className="text-sm text-white/50">Ley 172-13 Proteccion de Datos</li>
            <li className="text-sm text-white/50">Ley 126-02 Comercio Electronico</li>
            <li className="text-sm text-white/50">Ley 108-05 Registro Inmobiliario</li>
          </ul>
        </div>
      </div>

      <div className="mt-12 pt-6 border-t border-white/10 text-center">
        <p className="text-sm text-white/40">
          &copy; {new Date().getFullYear()} VeriFinca. Sistema de verificacion de proyectos inmobiliarios.
          Republica Dominicana.
        </p>
      </div>
    </div>
  </footer>
);

/* ===== MAIN LANDING PAGE ===== */
export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen">
      <LandingNav />
      <HeroSection />
      <HowItWorksSection />
      <FeaturesSection />
      <ProjectsShowcase />
      <VerificationSection />
      <Footer />
    </div>
  );
};
