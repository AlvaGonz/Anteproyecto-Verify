import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  LayoutDashboard,
  FolderKanban,
  ShieldAlert,
  Settings,
  X,
  Plus,
  Compass,
  History,
  LogOut,
  Award,
  ChevronLeft,
} from "lucide-react";
import { useProjects } from "../../../features/projects/api/useProjects";
import { useAuth } from "../../context/AuthContext";
import { clsx } from "clsx";

interface SidebarProps {
  onClose?: () => void;
}

const NAVIGATION = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Expedientes", href: "/admin/projects", icon: FolderKanban },
  { name: "Reglas de Validacion", href: "/admin/rules", icon: ShieldAlert },
  { name: "Logs de Auditoría", href: "/admin/audit-log", icon: History },
  { name: "Configuracion", href: "/admin/settings", icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: projects } = useProjects();
  const projectCount = projects?.length || 0;
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const fullName = user ? `${user.nombre || ""} ${user.apellido || ""}`.trim() : "";
  const firstName = fullName ? fullName.split(" ")[0] : "Usuario";
  const initials = fullName
    ? fullName
      .split(" ")
      .filter(Boolean)
      .map((n: string) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()
    : "US";
  const roleLabel = {
    admin: "Administrador",
    dev: "Desarrollador",
    validator: "Validador",
    user: "Usuario",
  }[user?.role || "user"] || "Usuario";

  return (
    <div
      className={clsx(
        "flex flex-col h-full bg-secondary text-white relative overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
        isCollapsed ? "w-[80px]" : "w-[280px]"
      )}
    >
      {/* Background decorative glow */}
      <div
        className={clsx(
          "absolute top-0 right-0 bg-primary/5 blur-[100px] rounded-full transition-all duration-700",
          isCollapsed ? "w-32 h-32 -mr-16 -mt-16" : "w-64 h-64 -mr-32 -mt-32"
        )}
      ></div>

      {/* Logo Section */}
      <div
        className={clsx(
          "relative flex flex-col transition-all duration-500",
          isCollapsed ? "px-3 pt-6 pb-4 items-center" : "px-8 pt-10 pb-8"
        )}
      >
        <Link
          to="/admin/dashboard"
          className={clsx("flex items-center gap-3 group", isCollapsed && "justify-center")}
        >
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-premium-sm group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
            <img
              src="/brand/isotipo/ISOTIPO WHITE.optimized.svg"
              alt="VeriFinca"
              className="h-6 w-auto"
            />
          </div>
          <div
            className={clsx(
              "flex flex-col leading-tight overflow-hidden transition-all duration-500",
              isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
            )}
          >
            <span className="font-display font-black text-xl tracking-tighter whitespace-nowrap">
              VERIFINCA
            </span>
            <span className="text-[10px] font-black tracking-[0.2em] text-primary whitespace-nowrap">
              PORTAL ADMIN
            </span>
          </div>
        </Link>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-10 right-4 md:hidden text-white/40 hover:text-white p-2 hover:scale-110 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Section */}
      <div className="relative flex-1 flex flex-col py-6 overflow-hidden">
        <div
          className={clsx(
            "px-4 mb-4 overflow-hidden transition-all duration-500",
            isCollapsed ? "opacity-0 h-0" : "opacity-100 h-auto"
          )}
        >
          <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">
            Principal
          </p>
        </div>

        <motion.nav
          className={clsx("space-y-1.5 flex-1", isCollapsed ? "px-2" : "px-4")}
          initial={shouldReduceMotion ? false : "hidden"}
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
          }}
        >
          {NAVIGATION.map((item, idx) => {
            const isActive = location.pathname.startsWith(item.href);
            return (
              <motion.div
                key={item.name}
                variants={{
                  hidden: { opacity: 0, x: -12 },
                  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
                }}
              >
                <Link
                  to={item.href}
                  onClick={onClose}
                  className={clsx(
                    "group flex items-center rounded-2xl transition-all duration-300 relative overflow-hidden",
                    isActive
                      ? "text-white bg-white/10 shadow-inner"
                      : "text-white/50 hover:text-white/80 hover:bg-white/5",
                    isCollapsed ? "justify-center px-0 py-3.5" : "px-4 py-3.5 text-sm font-bold"
                  )}
                >
                  {isActive && (
                    <div
                      className={clsx(
                        "absolute left-0 top-1/2 -translate-y-1/2 w-1 bg-primary rounded-r-full shadow-[0_0_10px_#F98513] transition-all duration-300",
                        isCollapsed ? "h-8" : "h-6"
                      )}
                    >
                      {!shouldReduceMotion && (
                        <motion.div
                          className="absolute inset-0 bg-primary rounded-r-full opacity-40"
                          animate={{ opacity: [0.4, 1, 0.4] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        />
                      )}
                    </div>
                  )}
                  <item.icon
                    className={clsx(
                      "flex-shrink-0 transition-all duration-300",
                      isActive
                        ? "text-primary scale-110 drop-shadow-[0_0_6px_rgba(249,133,19,0.5)]"
                        : "text-white/30 group-hover:text-white/60 group-hover:scale-110",
                      isCollapsed ? "h-6 w-6" : "h-5 w-5 mr-3.5"
                    )}
                    aria-hidden="true"
                  />
                  <span
                    className={clsx(
                      "overflow-hidden whitespace-nowrap transition-all duration-500",
                      isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                    )}
                  >
                    {item.name}
                  </span>
                  {item.name === "Expedientes" && projectCount > 0 && (
                    <span
                      className={clsx(
                        "ml-auto text-[9px] font-black bg-primary/20 text-primary rounded-full transition-all duration-300",
                        isCollapsed
                          ? "absolute -top-0.5 -right-0.5 px-1 py-0.5 min-w-[18px] h-[18px] flex items-center justify-center"
                          : "px-1.5 py-0.5"
                      )}
                    >
                      {projectCount > 99 ? "99+" : projectCount}
                    </span>
                  )}
                </Link>
              </motion.div>
            );
          })}
        </motion.nav>

        {/* Global Action Button */}
        <div className={clsx("transition-all duration-500", isCollapsed ? "px-2 mt-4" : "mt-8 px-2")}>
          <Link
            to="/admin/projects/new"
            className={clsx(
              "flex items-center bg-primary hover:bg-primary-hover text-white rounded-2xl font-display font-black text-xs uppercase tracking-widest transition-all shadow-premium hover:shadow-premium-lg group",
              isCollapsed ? "justify-center py-3.5" : "justify-center gap-3 w-full py-4"
            )}
            title="Nuevo Expediente"
          >
            <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
            <span
              className={clsx(
                "overflow-hidden whitespace-nowrap transition-all duration-500",
                isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
              )}
            >
              NUEVO EXPEDIENTE
            </span>
          </Link>
        </div>

        {/* Footer Links */}
        <div
          className={clsx(
            "mt-auto space-y-4 transition-all duration-500",
            isCollapsed ? "px-2 pb-4" : "px-4 pb-4"
          )}
        >
          <div className={clsx("h-px bg-white/10 transition-all duration-500", isCollapsed ? "mx-0" : "w-full")} />
          <Link
            to="/projects"
            title="Explorar Portal Público"
            className={clsx(
              "flex items-center gap-3 text-[10px] font-black text-white/30 hover:text-primary transition-colors uppercase tracking-[0.1em]",
              isCollapsed ? "justify-center" : ""
            )}
          >
            <Compass className="w-4 h-4 flex-shrink-0" />
            <span
              className={clsx(
                "overflow-hidden whitespace-nowrap transition-all duration-500",
                isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
              )}
            >
              Explorar Portal Público
            </span>
          </Link>
        </div>
      </div>

      {/* Collapse Toggle - Desktop only */}
      <div className="hidden md:block px-4 mt-4">
        <button
          type="button"
          onClick={() => setIsCollapsed((prev) => !prev)}
          className={clsx(
            "flex items-center w-full text-[10px] font-black text-white/30 hover:text-white transition-all duration-300 rounded-xl hover:bg-white/5",
            isCollapsed ? "justify-center py-2" : "px-2 py-2 gap-2"
          )}
          title={isCollapsed ? "Expandir panel" : "Colapsar panel"}
        >
          <ChevronLeft
            className={clsx(
              "w-4 h-4 transition-all duration-500",
              isCollapsed && "rotate-180"
            )}
          />
          <span
            className={clsx(
              "overflow-hidden whitespace-nowrap transition-all duration-500 uppercase tracking-widest",
              isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
            )}
          >
            Colapsar
          </span>
        </button>
      </div>

      {/* User Section */}
      <div
        className={clsx(
          "relative transition-all duration-500 bg-white/[0.03] border-t border-white/5",
          isCollapsed ? "p-3" : "p-6"
        )}
      >
        <div
          className={clsx(
            "flex items-center gap-3 hover:bg-white/5 rounded-xl transition-colors cursor-pointer",
            isCollapsed ? "justify-center p-2" : "p-2 -m-2"
          )}
          onClick={() => navigate("/admin/settings")}
        >
          <div className="relative flex-shrink-0">
            <div
              className={clsx(
                "rounded-xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center text-sm font-black text-white shadow-lg overflow-hidden border border-white/10 transition-all duration-300",
                isCollapsed ? "h-9 w-9" : "h-10 w-10"
              )}
            >
              {user?.avatarUrl ? (
                <img
                  data-testid="sidebar-avatar-img"
                  src={
                    /^(data|blob|http)/.test(user.avatarUrl)
                      ? user.avatarUrl
                      : `http://localhost:5000${user.avatarUrl}`
                  }
                  alt="Avatar"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                initials
              )}
            </div>
            <div
              className={clsx(
                "absolute -bottom-1 -right-1 bg-success rounded-full border-2 border-secondary overflow-hidden transition-all duration-300",
                isCollapsed ? "w-2.5 h-2.5" : "w-3.5 h-3.5"
              )}
            ></div>
          </div>
          <div
            className={clsx(
              "flex flex-col min-w-0 overflow-hidden transition-all duration-500",
              isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
            )}
          >
            <p className="text-sm font-bold text-white leading-tight truncate">{firstName}</p>
            <p className="text-[9px] text-white/30 font-black uppercase tracking-widest mt-0.5">
              {roleLabel}
            </p>
            {user?.isGuest && user?.inviterPlan && (
              <div
                data-testid="sidebar-plan-badge"
                className="flex items-center gap-1.5 mt-1.5 px-2 py-0.5 bg-primary/20 rounded-full w-fit"
              >
                <Award className="w-3 h-3 text-primary" />
                <span data-testid="plan-name" className="text-[9px] font-bold text-primary">
                  {user.inviterPlan}
                </span>
              </div>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className={clsx(
            "flex items-center w-full text-[10px] font-black text-white/30 hover:text-red-400 transition-all duration-300 uppercase tracking-widest rounded-xl hover:bg-white/5",
            isCollapsed ? "justify-center py-2 mt-1" : "px-2 py-2 gap-2 mt-3"
          )}
          title="Cerrar Sesión"
        >
          <LogOut className={clsx("flex-shrink-0", isCollapsed ? "w-4 h-4" : "w-3.5 h-3.5")} />
          <span
            className={clsx(
              "overflow-hidden whitespace-nowrap transition-all duration-500",
              isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
            )}
          >
            Cerrar Sesión
          </span>
        </button>
      </div>
    </div>
  );
};
