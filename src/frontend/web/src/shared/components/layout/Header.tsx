import React from "react";
import { Link } from "react-router-dom";
import { NotificationBell } from "../../../features/notifications/components/NotificationBell";
import { Menu } from "lucide-react";

interface HeaderProps {
  onMenuClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  return (
    <header className="sticky top-0 z-10 vf-glass overflow-hidden border-b border-outline-variant/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button
              onClick={onMenuClick}
              className="md:hidden p-2 rounded-xl text-on-surface hover:bg-surface-container-high transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Mobile brand - hidden on desktop as Sidebar has it */}
            <Link to="/" className="md:hidden flex items-center">
              <img
                src="/brand/isotipo/ISOTIPO NEGRO.svg"
                alt="VeriFinca"
                className="h-8 w-auto"
              />
            </Link>
          </div>

          <div className="flex items-center gap-6">
            <Link
              to="/"
              className="hidden sm:block text-sm font-bold text-on-surface-variant hover:text-primary transition-colors uppercase tracking-widest px-3 py-1"
            >
              Portal Público
            </Link>
            <div className="h-6 w-px bg-outline-variant/30 hidden sm:block"></div>
            <NotificationBell />
          </div>
        </div>
      </div>
    </header>
  );
};
