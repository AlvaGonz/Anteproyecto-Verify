import React from "react";
import { Menu } from "lucide-react";

import { NotificationBell } from "../../../features/notifications/components/NotificationBell";

interface HeaderProps {
  onMenuClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
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

  return (
    <header className="sticky top-0 z-20 w-full h-16 shrink-0 bg-white/70 backdrop-blur-xl border-b border-gray-100 flex items-center justify-between px-4 sm:px-8">
      <div className="flex items-center gap-4">
        {onMenuClick && (
          <button type="button"
            onClick={onMenuClick}
            className="p-2 md:hidden hover:bg-gray-100 rounded-xl transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-500" />
          </button>
        )}
      </div>
      <div className="flex items-center gap-3 min-w-[120px] justify-end">
        <NotificationBell />
      </div>
    </header>
  );
};
