import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export const LandingNav: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const navLinks = [
    { label: "Proyectos", href: "/projects" },
    { label: "Planes", href: "/plans" },
    { label: "Legal", href: "/legal" },
  ];

  const isDarkBackground = !scrolled && location.pathname === "/projects";

  const linkClassName = isDarkBackground
    ? "text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 px-4 py-2 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    : "text-sm font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low px-4 py-2 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

  const clientAccessClassName = isDarkBackground
    ? "text-sm font-semibold text-slate-300 hover:text-white px-4 py-2 rounded-lg hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    : "text-sm font-semibold text-on-surface-variant hover:text-on-surface px-4 py-2 rounded-lg hover:bg-surface-container-low transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

  const hamburgerClassName = isDarkBackground
    ? "lg:hidden p-2 -mr-2 text-white hover:text-white rounded-lg hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    : "lg:hidden p-2 -mr-2 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-container-low transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

  const logoSrc = isDarkBackground
    ? "/brand/logotipo/LOGOTIPO WHITE.optimized.svg"
    : "/brand/logotipo/LOGOTIPO.optimized.svg";

  return (
    <div className={`fixed inset-x-0 top-0 z-50 flex justify-center transition-all duration-300 ${scrolled ? "px-4 pt-4" : "px-0 pt-0"}`}>
      <nav
        className={`relative w-full max-w-7xl flex justify-between items-center transition-all duration-300 ${scrolled
            ? "h-16 px-6 md:px-8 bg-surface/90 backdrop-blur-md border border-outline-variant/30 shadow-sm rounded-2xl"
            : "h-24 px-6 md:px-12 bg-transparent"
          }`}
      >
        <Link to="/" className="flex items-center group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg">
          <img
            src={logoSrc}
            alt="VeriFinca"
            className="h-9 w-auto group-hover:scale-105 transition-transform duration-300"
          />
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-2">
          {navLinks.map((item) => {
            if (item.href.startsWith("/")) {
              return <Link key={item.label} to={item.href} className={linkClassName}>{item.label}</Link>;
            }
            return <a key={item.label} href={item.href} className={linkClassName}>{item.label}</a>;
          })}
        </div>

        {/* Desktop Buttons */}
        <div className="hidden lg:flex items-center gap-3">
          {isAuthenticated ? (
            <Link to="/admin/dashboard" className="bg-primary text-on-primary px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-primary/90 hover:shadow-md hover:shadow-primary/20 active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
              Ir al Portal
            </Link>
          ) : (
            <>
              <Link to="/login" className={clientAccessClassName}>
                Acceso Clientes
              </Link>
              <Link to="/register" className="bg-primary text-on-primary px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-primary/90 hover:shadow-md hover:shadow-primary/20 active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
                Crear cuenta
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button type="button"
          className={hamburgerClassName}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Abrir menú"
        >
          <span className="material-symbols-outlined text-2xl">{mobileMenuOpen ? "close" : "menu"}</span>
        </button>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="absolute top-[calc(100%+8px)] left-0 right-0 p-4 bg-surface/95 backdrop-blur-xl border border-outline-variant/30 shadow-lg rounded-2xl flex flex-col gap-2 lg:hidden animate-in fade-in slide-in-from-top-4 duration-200">
            {navLinks.map((item) => {
              const className = "text-base font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low px-4 py-3 rounded-xl transition-colors";
              if (item.href.startsWith("/")) {
                return <Link key={item.label} to={item.href} className={className}>{item.label}</Link>;
              }
              return <a key={item.label} href={item.href} className={className}>{item.label}</a>;
            })}
            <div className="h-px w-full bg-outline-variant/30 my-2" />
            {isAuthenticated ? (
              <Link to="/admin/dashboard" className="bg-primary text-on-primary text-center px-5 py-3 rounded-xl font-semibold text-base hover:bg-primary/90 active:scale-[0.98] transition-all">
                Ir al Portal
              </Link>
            ) : (
              <div className="flex flex-col gap-2">
                <Link to="/login" className="text-center text-base font-semibold text-on-surface-variant hover:text-on-surface px-4 py-3 rounded-xl hover:bg-surface-container-low transition-colors">
                  Acceso Clientes
                </Link>
                <Link to="/register" className="bg-primary text-on-primary text-center px-5 py-3 rounded-xl font-semibold text-base hover:bg-primary/90 active:scale-[0.98] transition-all">
                  Crear cuenta
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>
    </div>
  );
};
