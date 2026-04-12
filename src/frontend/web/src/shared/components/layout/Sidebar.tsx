import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  ShieldAlert,
  Settings,
  Shield,
  X,
  ExternalLink,
} from "lucide-react";

interface SidebarProps {
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const location = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Proyectos", href: "/admin/projects", icon: FolderKanban },
    { name: "Reglas de Validacion", href: "/admin/rules", icon: ShieldAlert },
    { name: "Configuracion", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div
      className="flex flex-col w-64 border-r h-full"
      style={{
        backgroundColor: "var(--color-brand-primary)",
        borderColor: "rgba(255,255,255,0.08)",
      }}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-14 px-5 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        <Link to="/" className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-[var(--color-brand-accent-soft)]" />
          <span className="font-bold text-lg text-[var(--color-text-on-dark)] tracking-tight">
            VeriFinca
          </span>
        </Link>
        {onClose && (
          <button onClick={onClose} className="md:hidden text-white/60 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={onClose}
                className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-150 ${
                  isActive
                    ? "bg-white/15 text-white"
                    : "text-white/60 hover:bg-white/8 hover:text-white/90"
                }`}
              >
                <item.icon
                  className={`mr-3 flex-shrink-0 h-5 w-5 ${
                    isActive ? "text-[var(--color-brand-accent-soft)]" : "text-white/40 group-hover:text-white/60"
                  }`}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Quick link to public site */}
        <div className="px-3 pb-3">
          <Link
            to="/projects"
            className="flex items-center gap-2 px-3 py-2.5 text-sm text-white/40 hover:text-white/70 transition-colors rounded-lg hover:bg-white/5"
          >
            <ExternalLink className="w-4 h-4" />
            Ver sitio publico
          </Link>
        </div>
      </div>

      {/* User */}
      <div className="flex-shrink-0 flex p-4 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        <div className="flex-shrink-0 w-full group block">
          <div className="flex items-center">
            <div
              className="h-9 w-9 rounded-lg flex items-center justify-center text-sm font-bold"
              style={{
                backgroundColor: "var(--color-brand-accent-soft)",
                color: "var(--color-text-strong)",
              }}
            >
              AD
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">Admin User</p>
              <p className="text-xs text-white/40">Administrador</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
