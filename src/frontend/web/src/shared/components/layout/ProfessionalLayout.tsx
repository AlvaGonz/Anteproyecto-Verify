import React, { ReactNode } from "react";
import { PortalSidebarNav } from "./PortalSidebarNav";

interface ProfessionalLayoutProps {
  children: ReactNode;
}

export const ProfessionalLayout: React.FC<ProfessionalLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen bg-[#FFF8F3]">
      <PortalSidebarNav />
      <div className="flex-1 ml-64 overflow-y-auto">
        <header className="h-16 border-b border-[#DAD1C8] bg-white px-8 flex items-center justify-between sticky top-0 z-10">
          <h1 className="text-[#111144] font-display font-black text-xl">Carga de Expediente</h1>
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#5C5C5C]">ID: 4F7D-8E2B-1A9C</span>
            <div className="w-8 h-8 rounded-full bg-[#9BACD8] flex items-center justify-center text-white text-xs font-bold">JD</div>
          </div>
        </header>
        <main className="p-8 max-w-6xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
