import React from "react";
import { Menu, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { NotificationBell } from "../../../features/notifications/components/NotificationBell";

interface HeaderProps {
  title: string;
  onMenuClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, onMenuClick }) => {
  const navigate = useNavigate();

  const searchInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const value = e.currentTarget.value.trim();
      if (value) {
        navigate(`/admin/projects?q=${encodeURIComponent(value)}`);
      }
    }
  };

  return (
    <header className="sticky top-0 z-20 w-full h-20 bg-white/70 backdrop-blur-xl border-b border-gray-100 flex items-center justify-between px-8">
      <div className="flex items-center gap-4">
        {onMenuClick && (
          <button type="button"
            onClick={onMenuClick}
            className="p-2 md:hidden hover:bg-gray-100 rounded-xl transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-500" />
          </button>
        )}
        <div className="flex flex-col">
          <h1 className="text-xl font-display font-black text-gray-900 tracking-tight">
            {title}
          </h1>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></span>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              SISTEMA ACTIVO
            </span>
          </div>
        </div>
      </div>

      <div className="hidden md:flex flex-1 max-w-md mx-12">
        <div className="relative w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Buscar expedientes, folios o propietarios..."
            className="w-full h-11 pl-11 pr-4 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 transition-all group-hover:bg-gray-100"
            onKeyDown={handleSearch}
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* VeriFinca AI Status */}

        <NotificationBell />
      </div>
    </header>
  );
};
