import React, { ReactNode, useState } from "react";
import { useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface AdminLayoutProps {
  children: ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Compute title based on route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes("/dashboard")) return "Dashboard";
    if (path.includes("/projects/new")) return "Nuevo Expediente";
    if (path.includes("/projects") && path.includes("/edit")) return "Editar Expediente";
    if (path.includes("/projects") && path.includes("/documents")) return "Gestion de Documentos";
    if (path.includes("/projects") && path.includes("/validations")) return "Validacion de Datos";
    if (path.includes("/projects") && path.includes("/audit")) return "Auditoria del Sistema";
    if (path.includes("/projects") && path.includes("/reports")) return "Reportes y Estadisticas";
    if (path.includes("/projects")) return "Gestion de Expedientes";
    if (path.includes("/rules")) return "Reglas de Validacion";
    if (path.includes("/admin/audit-log")) return "Registro de Auditoria";
    if (path.includes("/settings")) return "Configuracion";
    return "Administracion";
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#FFF8F3]">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-gray-900/60 backdrop-blur-sm md:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar for mobile */}
      <div className={`fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 md:hidden ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Sidebar for desktop */}
      <div className="hidden md:flex md:flex-shrink-0">
        <Sidebar />
      </div>

      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <Header 
          title={getPageTitle()}
          onMenuClick={() => setSidebarOpen(true)} 
        />
        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none scroll-smooth">
          <div className="py-8">
            <div className="max-w-[1600px] mx-auto px-6 lg:px-10">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
