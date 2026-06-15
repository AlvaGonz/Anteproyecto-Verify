import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  ShieldAlert,
  Settings,
  X,
  Plus,
  Compass,
  History
} from "lucide-react";
import { useProjects } from "../../../features/projects/api/useProjects";

interface SidebarProps {
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const location = useLocation();
  const { data: projects } = useProjects();
  const projectCount = projects?.length || 0;

  const navigation = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Expedientes", href: "/admin/projects", icon: FolderKanban },
    { name: "Reglas de Validacion", href: "/admin/rules", icon: ShieldAlert },
    { name: "Logs de Auditoría", href: "/admin/audit-log", icon: History },
    { name: "Configuracion", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div
      className="flex flex-col w-[280px] h-full bg-secondary text-white relative overflow-hidden"
    >
      {/* Background patterns */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full -mr-32 -mt-32"></div>
      
      {/* Logo Section */}
      <div className="relative z-10 flex flex-col px-8 pt-10 pb-8">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-premium-sm group-hover:scale-110 transition-transform">
            <img
              src="/brand/isotipo/ISOTIPO WHITE.optimized.svg"
              alt="VeriFinca"
              className="h-6 w-auto"
            />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-display font-black text-xl tracking-tighter">VERIFINCA</span>
            <span className="text-[10px] font-black tracking-[0.2em] text-primary">PORTAL ADMIN</span>
          </div>
        </Link>
        {onClose && (
          <button onClick={onClose} className="absolute top-10 right-4 md:hidden text-white/40 hover:text-white p-2">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Section */}
      <div className="relative z-10 flex-1 flex flex-col px-4 py-6">
        <div className="px-4 mb-4">
           <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Principal</p>
        </div>
        <nav className="space-y-1.5 flex-1">
          {navigation.map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={onClose}
                className={`group flex items-center px-4 py-3.5 text-sm font-bold rounded-2xl transition-all duration-300 relative overflow-hidden ${
                  isActive
                    ? "text-white bg-white/10 shadow-inner"
                    : "text-white/50 hover:text-white/80 hover:bg-white/5"
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full shadow-[0_0_10px_#F98513]"></div>
                )}
                <item.icon
                  className={`mr-3.5 flex-shrink-0 h-5 w-5 transition-all duration-300 ${
                    isActive ? "text-primary scale-110" : "text-white/30 group-hover:text-white/60"
                  }`}
                  aria-hidden="true"
                />
                {item.name}
                {item.name === "Expedientes" && projectCount > 0 && (
                   <span className="ml-auto text-[9px] font-black bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">{projectCount}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Global Action Button */}
        <div className="mt-8 px-2">
          <Link
            to="/admin/projects/new"
            className="flex items-center justify-center gap-3 w-full py-4 bg-primary hover:bg-primary-hover text-white rounded-2xl font-display font-black text-xs uppercase tracking-widest transition-all shadow-premium hover:shadow-premium-lg group"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            NUEVO EXPEDIENTE
          </Link>
        </div>
        
        {/* Footer Links */}
        <div className="mt-auto px-4 pb-4 space-y-4">
          <div className="h-px bg-white/10 w-full"></div>
          <Link
            to="/projects"
            className="flex items-center gap-3 text-[10px] font-black text-white/30 hover:text-primary transition-colors uppercase tracking-[0.1em]"
          >
            <Compass className="w-4 h-4" />
            Explorar Portal Público
          </Link>
        </div>
      </div>

      {/* User Section */}
      <div className="relative z-10 p-6 bg-white/[0.03] border-t border-white/5">
        <div className="flex items-center gap-3">
          <div className="relative">
             <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center text-sm font-black text-white shadow-lg overflow-hidden border border-white/10">
                AD
             </div>
             <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-success rounded-full border-2 border-secondary overflow-hidden"></div>
          </div>
          <div className="flex flex-col min-w-0">
            <p className="text-sm font-bold text-white leading-tight truncate">Administrador</p>
            <p className="text-[9px] text-white/30 font-black uppercase tracking-widest mt-0.5">VeriFinca Global</p>
          </div>
        </div>
      </div>
    </div>
  );
};
