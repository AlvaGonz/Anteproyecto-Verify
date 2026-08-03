import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  FolderOpen, 
  CloudUpload, 
  FileCheck, 
  BarChart, 
  Settings 
} from "lucide-react";
import { clsx } from "clsx";

const NAV_ITEMS = [
  { name: "Mis Proyectos", href: "/projects", icon: FolderOpen },
  { name: "Cargar Documentos", href: "#", icon: CloudUpload, active: true },
  { name: "Estado de Validación", href: "/validations", icon: FileCheck },
  { name: "Reportes", href: "/reports", icon: BarChart },
  { name: "Configuración", href: "/settings", icon: Settings },
];
interface PortalSidebarNavProps {
  onClose?: () => void;
}

export const PortalSidebarNav: React.FC<PortalSidebarNavProps> = () => {
  const location = useLocation();

  return (
    <nav className="h-full w-64 bg-[#223382] py-8 flex flex-col shadow-premium">
      {/* Branding */}
      <div className="px-8 mb-12">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
             <img src="/brand/isotipo/ISOTIPO WHITE.optimized.svg" alt="V" className="w-5" />
          </div>
          <span className="text-white font-display font-black text-xl tracking-tight">VeriFinca</span>
        </Link>
      </div>

      {/* Nav List */}
      <ul className="flex-1 px-4 space-y-2">
        {NAV_ITEMS.map((item) => {
          const isActive = item.active || location.pathname.includes(item.href);
          return (
            <li key={item.name}>
              <Link
                to={item.href}
                className={clsx(
                  "flex items-center gap-3 px-4 py-3 text-sm font-bold transition-all duration-300",
                  isActive
                    ? "bg-[#F98513] text-[#5d2d00] rounded-full shadow-lg"
                    : "text-white/70 hover:text-white hover:bg-white/10 rounded-full"
                )}
              >
                <item.icon size={20} className={isActive ? "text-[#5d2d00]" : "text-white/40"} />
                {item.name}
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Footer Info (Optional) */}
      <div className="px-8 pt-6 border-t border-white/10">
        <p className="text-white/30 text-[10px] uppercase font-black tracking-widest">Portal Profesional</p>
      </div>
    </nav>
  );
};
