import React from "react";
import { NotificationBell } from "../../../features/notifications/components/NotificationBell";

export const Header: React.FC = () => {
  return (
    <header className="shadow-sm border-b z-10" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border-warm)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center md:hidden">
              <span className="font-bold text-xl" style={{ color: 'var(--color-brand-primary)' }}>
                VeriFinca
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <NotificationBell />
          </div>
        </div>
      </div>
    </header>
  );
};
