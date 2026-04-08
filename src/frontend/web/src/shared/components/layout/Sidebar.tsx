import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  FileCheck,
  Settings,
} from "lucide-react";

export const Sidebar: React.FC = () => {
  const location = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Proyectos", href: "/admin/projects", icon: FolderKanban },
    { name: "Validaciones", href: "/admin/validations", icon: FileCheck },
    { name: "Configuración", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="flex flex-col w-64 border-r h-full" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border-warm)' }}>
      <div className="flex items-center justify-center h-16 border-b" style={{ borderColor: 'var(--color-border-warm)' }}>
        <span className="font-bold text-xl tracking-tight" style={{ color: 'var(--color-brand-primary)' }}>
          VeriFinca
        </span>
      </div>
      <div className="flex-1 flex flex-col overflow-y-auto">
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? "shadow-sm"
                    : "hover:bg-[var(--color-surface-alt)]"
                }`}
                style={{
                  backgroundColor: isActive ? 'var(--color-brand-primary)' : 'transparent',
                  color: isActive ? '#ffffff' : 'var(--color-text-main)',
                }}
              >
                <item.icon
                  className={`mr-3 flex-shrink-0 h-5 w-5 ${
                    isActive
                      ? "text-white"
                      : "text-[var(--color-accent-cool)] group-hover:text-[var(--color-brand-primary)]"
                  }`}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="flex-shrink-0 flex p-4 border-t" style={{ borderColor: 'var(--color-border-warm)' }}>
        <div className="flex-shrink-0 w-full group block">
          <div className="flex items-center">
            <div>
              <div className="inline-block h-9 w-9 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: 'var(--color-accent-warm)' }}>
                AD
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium" style={{ color: 'var(--color-text-strong)' }}>Admin User</p>
              <p className="text-xs font-medium hover:underline" style={{ color: 'var(--color-brand-primary)' }}>
                Ver perfil
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
