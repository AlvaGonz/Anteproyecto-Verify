import React from "react";
import { useLocation } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import { motion, AnimatePresence, MotionConfig, type Variants } from "framer-motion";
import { LandingNav } from "../../../shared/components/layout/LandingNav";
import { LandingFooter } from "../../../shared/components/layout/LandingFooter";
import { BackToTopButton } from "../../../shared/components/ui/BackToTopButton";
import { TerminosSection, PrivacidadSection, DpaSection, SlaSection } from "./LegalSections1";
import {
  MarcoLegalSection,
  BillingSection,
  RefundsSection,
  StripeProcessorSection,
  FinancialLiabilitySection,
  PaymentDataSection,
  AcceptableUseSection,
} from "./LegalSections2";


const ICONS = {
  gavel: "gavel",
  privacyTip: "privacy_tip",
  verifiedUser: "verified_user",
  database: "database",
  update: "update",
  fiberManualRecord: "fiber_manual_record",
  checkCircle: "check_circle",
  download: "download",
  assignment: "assignment",
  timer: "timer",
  menu_book: "menu_book",
  visibility: "visibility",
  payments: "payments",
  history: "history",
  security: "security",
};

const navItems = [
  { id: "terminos", icon: ICONS.gavel, label: "Términos de Servicio" },
  { id: "privacidad", icon: ICONS.privacyTip, label: "Política de Privacidad" },
  { id: "dpa", icon: ICONS.assignment, label: "Acuerdo de Procesamiento de Datos (DPA)" },
  { id: "sla", icon: ICONS.timer, label: "Acuerdo de Nivel de Servicio (SLA)" },
  { id: "marco-legal", icon: ICONS.menu_book, label: "Marco Normativo" },
  { id: "billing", icon: ICONS.payments, label: "" },
  { id: "refunds", icon: ICONS.history, label: "" },
  { id: "stripeProcessor", icon: ICONS.security, label: "" },
  { id: "financialLiability", icon: ICONS.gavel, label: "" },
  { id: "paymentData", icon: ICONS.database, label: "" },
  { id: "acceptableUse", icon: ICONS.checkCircle, label: "" },
];

const navLabels: Record<string, string> = {
  terminos: "Términos de Servicio",
  privacidad: "Política de Privacidad",
  dpa: "Acuerdo de Procesamiento de Datos (DPA)",
  sla: "Acuerdo de Nivel de Servicio (SLA)",
  "marco-legal": "Marco Normativo",
  billing: "Facturación y Suscripciones",
  refunds: "Política de Reembolsos",
  stripeProcessor: "Procesador de Pagos",
  financialLiability: "Responsabilidad Financiera",
  paymentData: "Datos de Pago",
  acceptableUse: "Uso Aceptable",
};

/* =========================================================
   Drawer motion variants — spring in, snappy tween out
   ========================================================= */
const drawerVariants: Variants = {
  open: {
    x: "0%",
    transition: {
      type: "tween",
      duration: 0.3,
      ease: [0.32, 0.72, 0, 1],
      staggerChildren: 0.045,
      delayChildren: 0.06,
    },
  },
  closed: {
    x: "-100%",
    transition: { type: "tween", duration: 0.22, ease: [0.32, 0.72, 0, 1] },
  },
};

const panelItemVariants: Variants = {
  open: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 420, damping: 34 },
  },
  closed: {
    opacity: 0,
    y: 8,
    transition: { duration: 0.15, ease: "easeOut" },
  },
};

/* =========================================================
   Small checkbox icon component
   ========================================================= */
const CheckIcon: React.FC<{ checked: boolean }> = ({ checked }) => (
  <motion.div
    key={checked ? "checked" : "unchecked"}
    initial={{ scale: 0.4 }}
    animate={{ scale: 1 }}
    transition={{ type: "spring", stiffness: 500, damping: 20 }}
    className="inline-flex"
  >
    <span className={`material-symbols-outlined text-[clamp(1.125rem,6.2cqw,1.375rem)] transition-colors duration-200 ${checked ? "text-orange-600" : "text-slate-300"}`}>
      {checked ? "check_box" : "check_box_outline_blank"}
    </span>
  </motion.div>
);

export const LegalPage: React.FC = () => {
    const location = useLocation();

  const [isRevealed, setIsRevealed] = React.useState(false);
  const [activeSection, setActiveSection] = React.useState<string>("terminos");
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [checkedSections, setCheckedSections] = React.useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = React.useState(false);

  const drawerRef = React.useRef<HTMLDivElement>(null);
  const [drawerWidth, setDrawerWidth] = React.useState(300);

  const contentRef = React.useRef<HTMLDivElement>(null);
  const printElementRef = React.useRef<HTMLElement | null>(null);

  const handlePrint = useReactToPrint({ contentRef });

  // Lazy-content printer: no contentRef — we pass the target element at call time
  const handlePrintBatch = useReactToPrint({
    documentTitle: "VeriFinca - Documentos Legales",
    onAfterPrint: () => {
      // Remove the temp wrapper we built in downloadSelected
      if (printElementRef.current) {
        if (document.body.contains(printElementRef.current)) document.body.removeChild(printElementRef.current);
        printElementRef.current = null;
      }
      setCheckedSections(new Set());
    },
  });

  /* ── reveal on mount ── */
  React.useEffect(() => {
    const timer = setTimeout(() => setIsRevealed(true), 50);
    return () => clearTimeout(timer);
  }, []);

  /* ── track drawer width so the toggle button travels to its edge ── */
  React.useLayoutEffect(() => {
    const update = () => setDrawerWidth(drawerRef.current?.offsetWidth ?? 300);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  /* ── hash scroll ── */
  React.useEffect(() => {
    const rawHash = window.location.hash;
    const hashParts = rawHash.split("#");
    const elementId = hashParts[2];
    let timer: ReturnType<typeof setTimeout>;

    if (elementId) {
      const el = document.getElementById(elementId);
      if (el) timer = setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 150);
    } else if (location.hash) {
      const id = location.hash.replace("#", "");
      const el = document.getElementById(id);
      if (el) timer = setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 150);
    }
    return () => { if (timer) clearTimeout(timer); };
  }, [location]);

  /* ── intersection observer for active section ── */
  React.useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>("section[id]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("id");
            if (id) setActiveSection(id);
          }
        });
      },
      { root: null, rootMargin: "-20% 0px -80% 0px", threshold: 0 },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  /* ── helpers ── */
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.pushState(null, "", `#/legal#${id}`);
    setActiveSection(id);
  };

  const toggleCheck = (id: string) => {
    setCheckedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const downloadSelected = () => {
    if (checkedSections.size === 0) return;

    // Build a visible wrapper with cloned sections
    const wrapper = document.createElement("div");
    wrapper.style.cssText = "padding:2rem;max-width:800px;margin:0 auto;font-family:system-ui,sans-serif;color:#1e293b";

    checkedSections.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const clone = el.cloneNode(true) as HTMLElement;
      // Strip animation classes — they serve no purpose in print
      clone.className = clone.className
        .replace(/fade-up|stagger-\S+|is-visible/g, "")
        .replace(/\s+/g, " ")
        .trim();
      wrapper.appendChild(clone);
    });

    // Mount in DOM so react-to-print can find, measure, and style it
    document.body.appendChild(wrapper);
    printElementRef.current = wrapper;
    setIsDrawerOpen(false);

    // Small delay so the DOM is settled, then fire the lazy print
    setTimeout(() => handlePrintBatch(() => printElementRef.current), 300);

    // Saved micro-feedback: pop the check icon briefly
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1500);
  };

  const downloadFullDocument = () => {
    setIsDrawerOpen(false);
    handlePrint();
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1500);
  };

  const selCount = checkedSections.size;

  /* ── nav-link style helper ── */
  const navLinkClass = (id: string) => {
    const active = activeSection === id;
    return [
      "flex-1 min-w-0 flex items-center gap-3 rounded-lg px-3 py-2 sm:px-3.5 sm:py-2.5 font-body text-[clamp(0.875rem,5cqw,1.0625rem)] leading-snug text-left",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500",
      "transition-colors duration-150",
      active ? "text-orange-600 bg-orange-50 font-semibold" : "text-slate-600 hover:text-slate-900 hover:bg-surface-container-low",
    ].join(" ");
  };

  /* ── render ── */
  return (
    <div className="font-body text-on-surface antialiased min-h-screen bg-neutral">
      <LandingNav />

      {/* ── Floating drawer toggle button ── */}
      <MotionConfig reducedMotion="user">
        <motion.button
          type="button"
          onClick={() => setIsDrawerOpen((v) => !v)}
          initial={{ x: 0, y: "-50%" }}
          animate={{ x: isDrawerOpen ? drawerWidth : 0, y: "-50%" }}
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
          whileTap={{ scale: 0.92 }}
          className="fixed left-0 top-1/2 z-[60] flex items-center gap-2 bg-surface/90 backdrop-blur-md border border-outline-variant/50 border-l-0 rounded-r-xl px-3 py-3 shadow-sm text-slate-600 hover:text-orange-600 hover:bg-surface transition-colors duration-200 will-change-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
          aria-label={isDrawerOpen ? "Cerrar índice" : "Abrir índice legal"}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={isDrawerOpen ? "close" : "menu"}
              initial={{ rotate: -90, opacity: 0, scale: 0.4 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 90, opacity: 0, scale: 0.4 }}
              transition={{ type: "spring", stiffness: 500, damping: 24 }}
              className="inline-flex"
            >
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                {isDrawerOpen ? "close" : "menu_book"}
              </span>
            </motion.div>
          </AnimatePresence>
          <span className="text-xs font-semibold uppercase tracking-wider leading-tight hidden sm:block">
            {isDrawerOpen ? "Cerrar" : "Índice"}
          </span>
        </motion.button>

        {/* ── Drawer overlay + panel (framer-motion) ── */}
        <AnimatePresence>
          {isDrawerOpen && (
            <motion.div
              className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
              onClick={() => setIsDrawerOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Drawer panel (slides from left) — width adapts to the longest label */}
        <motion.div
          ref={drawerRef}
          variants={drawerVariants}
          initial="closed"
          animate={isDrawerOpen ? "open" : "closed"}
          className="fixed left-0 top-0 h-full w-fit min-w-[clamp(300px,26vw,380px)] max-w-[85vw] bg-surface z-50 shadow-2xl flex flex-col will-change-transform [container-type:inline-size]"
        >
          {/* Drawer header — static so the close button (X) is visible immediately */}
          <div className="flex items-center justify-between px-4 py-3 sm:px-5 sm:py-4 border-b border-outline-variant/40">
            <h2 className="font-headline text-[clamp(1.0625rem,6cqw,1.5rem)] font-bold text-slate-900">Índice Legal</h2>
            <button
              type="button"
              onClick={() => setIsDrawerOpen(false)}
              className="p-2 sm:p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-surface-container-low transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
              aria-label="Cerrar índice"
            >
              <span className="material-symbols-outlined text-[clamp(1.25rem,7.3cqw,1.5rem)]">close</span>
            </button>
          </div>

          {/* Nav items + checkboxes */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-0.5">
            {navItems.map((item) => {
              const label = item.label || navLabels[item.id as keyof typeof navLabels];
              return (
                <motion.div
                  key={item.id}
                  variants={panelItemVariants}
                  className="flex items-center rounded-lg group hover:bg-surface-container-low transition-colors duration-150"
                >
                  {/* Checkbox */}
                  <button
                    type="button"
                    onClick={() => toggleCheck(item.id)}
                    className="p-2.5 sm:p-2 rounded-lg text-slate-400 hover:text-orange-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                    title={`Seleccionar ${label}`}
                  >
                    <CheckIcon checked={checkedSections.has(item.id)} />
                  </button>

                  {/* Nav link */}
                  <button
                    type="button"
                    className={navLinkClass(item.id)}
                    onClick={() => { scrollTo(item.id); setIsDrawerOpen(false); }}
                  >
                    <span className="material-symbols-outlined text-[clamp(1.25rem,7cqw,1.5rem)]" style={{ fontVariationSettings: activeSection === item.id ? "'FILL' 1" : "'FILL' 0" }}>
                      {item.icon}
                    </span>
                    <span className="break-words">{label}</span>
                  </button>
                </motion.div>
              );
            })}
          </div>

          {/* Drawer footer */}
          <motion.div
            variants={panelItemVariants}
            className="border-t border-outline-variant/40 p-3 sm:p-4 space-y-2"
          >
            <button
              type="button"
              onClick={downloadSelected}
              disabled={selCount === 0}
              className={`w-full flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 sm:py-3 font-label font-semibold text-[clamp(0.875rem,5cqw,1.0625rem)] transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${selCount > 0
                  ? "bg-primary text-on-primary hover:bg-primary-hover shadow-sm"
                  : "bg-surface-container-low text-slate-400 cursor-not-allowed"
                }`}
            >
              <motion.div
                key={isSaving ? "saved" : "idle"}
                initial={{ scale: 0.4 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 20 }}
                className="inline-flex"
              >
                <span className={`material-symbols-outlined text-[clamp(1.125rem,6.2cqw,1.375rem)] ${isSaving ? "text-success" : ""}`}>
                  {isSaving ? "check_circle" : ICONS.download}
                </span>
              </motion.div>
              {selCount > 0
                ? (isSaving ? "Guardado" : `Descargar seleccionados (${selCount})`)
                : "Seleccionar secciones"}
            </button>

            <button
              type="button"
              onClick={downloadFullDocument}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-outline-variant/60 px-4 py-2.5 sm:py-3 font-label font-semibold text-[clamp(0.875rem,5cqw,1.0625rem)] text-slate-600 hover:bg-surface-container-low transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
            >
              <motion.div
                key={isSaving ? "saved" : "idle"}
                initial={{ scale: 0.4 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 20 }}
                className="inline-flex"
              >
                <span className={`material-symbols-outlined text-[clamp(1.125rem,6.2cqw,1.375rem)] ${isSaving ? "text-success" : ""}`}>
                  {isSaving ? "check_circle" : "description"}
                </span>
              </motion.div>
              {isSaving ? "Guardado" : "Descargar documento completo"}
            </button>
          </motion.div>
        </motion.div>
      </MotionConfig>

      {/* ── Main content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12">
        <main ref={contentRef} className="min-w-0 w-full max-w-4xl mx-auto">
          {/* Header */}
          <div className={`mb-12 fade-up stagger-2 ${isRevealed ? "is-visible" : ""}`}>
            <h1 className="font-headline text-4xl md:text-5xl font-black text-on-surface mb-4 leading-tight">
              Documentación Legal
            </h1>
            <p className="font-body text-lg text-on-surface-variant mb-6 leading-relaxed max-w-[65ch]">
              Términos de servicio, políticas de privacidad y acuerdos de cumplimiento que rigen el uso de VeriFinca.
            </p>
            <div className="inline-flex items-center gap-2 bg-surface-raised px-3 py-1.5 rounded-full border border-outline-variant">
              <span className="material-symbols-outlined text-primary text-sm">{ICONS.update}</span>
              <span className="font-label text-sm font-medium text-on-surface-variant">
                Última actualización: 22 de Junio, 2026
              </span>
            </div>
          </div>

          <TerminosSection isRevealed={isRevealed} ICONS={ICONS} />
          <PrivacidadSection isRevealed={isRevealed} ICONS={ICONS} />
          <DpaSection isRevealed={isRevealed} ICONS={ICONS} />
          <SlaSection isRevealed={isRevealed} ICONS={ICONS} />
          <MarcoLegalSection isRevealed={isRevealed} ICONS={ICONS} />
          <BillingSection  ICONS={ICONS} />
          <RefundsSection  ICONS={ICONS} />
          <StripeProcessorSection  ICONS={ICONS} />
          <FinancialLiabilitySection  ICONS={ICONS} />
          <PaymentDataSection  ICONS={ICONS} />
          <AcceptableUseSection  ICONS={ICONS} />
        </main>
      </div>

      {/* Contact Strip */}
      <section className="bg-secondary w-full py-12 px-4 sm:px-6 lg:px-8 mt-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-white text-center md:text-left">
            <h3 className="font-headline text-2xl font-bold mb-2">¿Necesita asistencia?</h3>
            <p className="font-body text-sm opacity-90 mb-1">
              Contáctenos para consultas sobre privacidad o términos de servicio.
            </p>
            <a className="font-body font-semibold hover:underline" href="mailto:legal@verifinca.do">legal@verifinca.do</a>
          </div>
          <div>
            <a
              href="https://wa.link/oi1w9m"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-center bg-primary hover:bg-primary-hover text-on-primary font-label font-bold py-3 px-8 rounded-lg transition-all duration-200 shadow-raised whitespace-nowrap w-full md:w-auto active:scale-[0.98]"
            >
              Contactar Soporte
            </a>
          </div>
        </div>
      </section>

      <LandingFooter />
      <BackToTopButton />
    </div>
  );
};
