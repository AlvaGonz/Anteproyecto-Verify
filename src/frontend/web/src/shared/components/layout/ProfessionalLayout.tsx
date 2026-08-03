import React, { ReactNode, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu } from "lucide-react";
import { PortalSidebarNav } from "./PortalSidebarNav";

interface ProfessionalLayoutProps {
  children: ReactNode;
}

export const ProfessionalLayout: React.FC<ProfessionalLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-[#FFF8F3]">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            key="sidebar-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-30 bg-gray-900/60 backdrop-blur-sm md:hidden cursor-default"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            key="sidebar-panel"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-y-0 left-0 z-40 md:hidden"
          >
            <PortalSidebarNav onClose={() => setSidebarOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar for desktop */}
      <div className="hidden md:flex md:flex-shrink-0">
        <PortalSidebarNav />
      </div>

      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <header className="h-16 shrink-0 border-b border-[#DAD1C8] bg-white px-4 md:px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 -ml-2 text-gray-500 hover:text-gray-900 focus:outline-none"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-[#111144] font-display font-black text-lg md:text-xl truncate max-w-[150px] sm:max-w-none">Carga de Expediente</h1>
          </div>
          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            <span className="hidden sm:inline-block text-[10px] font-black uppercase tracking-widest text-[#5C5C5C]">ID: 4F7D-8E2B-1A9C</span>
            <div className="w-8 h-8 rounded-full bg-[#9BACD8] flex items-center justify-center text-white text-xs font-bold shrink-0">JD</div>
          </div>
        </header>
        <main className="flex-1 relative overflow-y-auto p-4 sm:p-6 md:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
