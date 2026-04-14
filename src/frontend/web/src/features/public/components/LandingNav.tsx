import React from "react";
import { Link } from "react-router-dom";

export const LandingNav: React.FC = () => {
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
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
