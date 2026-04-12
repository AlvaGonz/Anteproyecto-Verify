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
      className="flex flex-col w-64 border-r h-full bg-secondary text-white border-white/5"
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-20 px-6 border-b border-white/5">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
            <Shield className="w-5 h-5 text-on-primary" />
          </div>
          <span className="font-display font-black text-xl text-white tracking-tighter">
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
                className={`group flex items-center px-4 py-3 text-sm font-headline font-bold rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-white/10 text-white shadow-inner"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <item.icon
                  className={`mr-3 flex-shrink-0 h-5 w-5 transition-colors ${
                    isActive ? "text-primary" : "text-white/40 group-hover:text-white/80"
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
      <div className="flex-shrink-0 flex p-6 border-t border-white/5 bg-secondary-container/5">
        <div className="flex-shrink-0 w-full group block">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-sm font-bold text-on-primary shadow-lg">
              AD
            </div>
            <div className="ml-3">
              <p className="text-sm font-bold text-white leading-none">Admin User</p>
              <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Administrador</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
