import React from "react";
import { Link } from "react-router-dom";
import { NotificationBell } from "../../../features/notifications/components/NotificationBell";
import { Shield, Menu } from "lucide-react";

interface HeaderProps {
  onMenuClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  return (
    <header
      className="sticky top-0 z-10 border-b"
      style={{
        backgroundColor: "var(--color-surface-alt)",
        borderColor: "var(--color-surface-muted)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14">
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button
              onClick={onMenuClick}
              className="md:hidden p-2 rounded-lg text-[var(--color-text-strong)] hover:bg-[var(--color-surface-muted)]/50"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Mobile brand */}
            <Link to="/" className="md:hidden flex items-center gap-2">
              <Shield className="w-5 h-5 text-[var(--color-brand-primary)]" />
              <span className="font-bold text-base text-[var(--color-brand-primary)]">
                VeriFinca
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="text-sm font-medium text-[var(--color-text-strong)] opacity-60 hover:opacity-100 transition-opacity"
            >
              Inicio
            </Link>
            <NotificationBell />
          </div>
        </div>
      </div>
    </header>
  );
};
