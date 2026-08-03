import React, { useEffect, useState } from "react";
import { useAuth } from "../../../shared/context/AuthContext";
import { useToast } from "../../../shared/components/ui/Toast/ToastContext";
import { useUpdatePublicPreferences } from "../api/useSettings";
import { Loader2, Eye, UserRound, Fingerprint, BadgeCheck } from "lucide-react";

type NombreModo = "realName" | "nickname";
type IdentificacionModo = "cedula" | "rnc";

const DEFAULT_NOMBRE: NombreModo[] = ["realName"];
const DEFAULT_IDENTIFICACION: IdentificacionModo[] = ["cedula"];

const checkCls =
  "peer absolute inset-0 z-10 opacity-0 cursor-pointer";

const checkVisualCls =
  "inline-flex items-center gap-3 w-full rounded-xl border border-border bg-white/50 px-4 py-3 cursor-pointer transition-colors duration-200 peer-focus-visible:ring-2 peer-focus-visible:ring-primary/50 peer-checked:border-primary peer-checked:bg-primary-subtle peer-checked:shadow-[0_0_0_1px_var(--color-primary)]";

const checkBoxCls =
  "relative w-5 h-5 rounded-md border-2 border-border bg-white shrink-0 transition-colors duration-200 peer-checked:border-primary peer-checked:bg-primary after:absolute after:left-[4px] after:top-[1px] after:w-[6px] after:h-[10px] after:border-r-2 after:border-b-2 after:border-white after:rotate-45 after:opacity-0 after:transition-opacity after:duration-200 peer-checked:after:opacity-100";

const checkTitleCls =
  "block text-sm font-bold text-text-primary";

export const PreferenciasSection: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { addToast } = useToast();
  const updatePreferences = useUpdatePublicPreferences();

  const [nombreModo, setNombreModo] = useState<NombreModo[]>(() =>
    Array.isArray(user?.nombrePublicoModo) && user!.nombrePublicoModo!.length > 0
      ? user!.nombrePublicoModo as NombreModo[]
      : DEFAULT_NOMBRE
  );
  const [identificacionModo, setIdentificacionModo] = useState<IdentificacionModo[]>(() =>
    Array.isArray(user?.identificacionPublicaModo) && user!.identificacionPublicaModo!.length > 0
      ? user!.identificacionPublicaModo as IdentificacionModo[]
      : DEFAULT_IDENTIFICACION
  );

  useEffect(() => {
    if (!user) return;
    if (Array.isArray(user.nombrePublicoModo) && user.nombrePublicoModo.length > 0) {
      setNombreModo(user.nombrePublicoModo as NombreModo[]);
    }
    if (Array.isArray(user.identificacionPublicaModo) && user.identificacionPublicaModo.length > 0) {
      setIdentificacionModo(user.identificacionPublicaModo as IdentificacionModo[]);
    }
  }, [user]);

  // Multi-select with a hard rule: at least ONE option per group must stay selected.
  const toggleNombre = (modo: NombreModo) => {
    setNombreModo(prev => {
      const next = prev.includes(modo)
        ? prev.filter(m => m !== modo)
        : [...prev, modo];
      if (next.length === 0) {
        addToast("Debes mantener al menos una opción de nombre activa.", "info");
        return prev;
      }
      return next;
    });
  };

  const toggleIdentificacion = (modo: IdentificacionModo) => {
    setIdentificacionModo(prev => {
      const next = prev.includes(modo)
        ? prev.filter(m => m !== modo)
        : [...prev, modo];
      if (next.length === 0) {
        addToast("Debes mantener al menos una opción de identificación activa.", "info");
        return prev;
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updatePreferences.mutateAsync({ nombreModo, identificacionModo });
      await refreshUser();
      addToast("Preferencias actualizadas exitosamente", "success");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.Message ||
        "Error al guardar preferencias";
      addToast(msg, "error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full" data-testid="preferences-section">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        {/* Nombre público */}
        <section className="bg-surface-raised/30 border border-border rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#223382]/10 flex items-center justify-center shrink-0">
              <UserRound className="w-5 h-5 text-[#223382]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-text-primary">Nombre público</h2>
              <p className="text-xs text-text-secondary">
                Cómo aparecerás como responsable en tus proyectos públicos. Puedes elegir una o
                ambas opciones.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="relative block cursor-pointer">
                <input
                  type="checkbox"
                  name="nombreModo"
                  value="realName"
                  checked={nombreModo.includes("realName")}
                  onChange={() => toggleNombre("realName")}
                  className={checkCls}
                />
                <span className={checkVisualCls}>
                  <span className={checkBoxCls} aria-hidden="true" />
                  <span className={checkTitleCls}>Nombre real</span>
                </span>
              </label>
              <p className="mt-1.5 pl-1 text-xs text-text-secondary">
                Tu nombre y apellido registrados.
              </p>
            </div>

            <div>
              <label className="relative block cursor-pointer">
                <input
                  type="checkbox"
                  name="nombreModo"
                  value="nickname"
                  checked={nombreModo.includes("nickname")}
                  onChange={() => toggleNombre("nickname")}
                  className={checkCls}
                />
                <span className={checkVisualCls}>
                  <span className={checkBoxCls} aria-hidden="true" />
                  <span className={checkTitleCls}>Nickname (apodo)</span>
                </span>
              </label>
              <p className="mt-1.5 pl-1 text-xs text-text-secondary">
                {user?.nickname
                  ? `Se mostrará "${user.nickname}".`
                  : "No tienes un nickname configurado; se usará tu nombre y apellido hasta que lo agregues en Mi Perfil."}
              </p>
            </div>
          </div>

          <p className="text-[11px] text-text-secondary border-t border-border/60 pt-3">
            Al menos una opción debe permanecer seleccionada.
          </p>
        </section>

        {/* Identificación pública */}
        <section className="bg-surface-raised/30 border border-border rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#223382]/10 flex items-center justify-center shrink-0">
              <Fingerprint className="w-5 h-5 text-[#223382]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-text-primary">Identificación pública</h2>
              <p className="text-xs text-text-secondary">
                Qué documentos de identidad se muestran junto a tu nombre. Puedes elegir una o
                ambas opciones.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="relative block cursor-pointer">
                <input
                  type="checkbox"
                  name="identificacionModo"
                  value="cedula"
                  checked={identificacionModo.includes("cedula")}
                  onChange={() => toggleIdentificacion("cedula")}
                  className={checkCls}
                />
                <span className={checkVisualCls}>
                  <span className={checkBoxCls} aria-hidden="true" />
                  <span className={checkTitleCls}>Cédula</span>
                </span>
              </label>
              <p className="mt-1.5 pl-1 text-xs text-text-secondary">
                Tu número de cédula.
              </p>
            </div>

            <div>
              <label className="relative block cursor-pointer">
                <input
                  type="checkbox"
                  name="identificacionModo"
                  value="rnc"
                  checked={identificacionModo.includes("rnc")}
                  onChange={() => toggleIdentificacion("rnc")}
                  className={checkCls}
                />
                <span className={checkVisualCls}>
                  <span className={checkBoxCls} aria-hidden="true" />
                  <span className={checkTitleCls}>RNC (razón social)</span>
                </span>
              </label>
              <p className="mt-1.5 pl-1 text-xs text-text-secondary">
                {user?.rnc
                  ? "Se mostrará tu RNC y razón social."
                  : "No tienes RNC registrado; se mostrará tu cédula."}
              </p>
            </div>
          </div>

          <p className="text-[11px] text-text-secondary border-t border-border/60 pt-3">
            Al menos una opción debe permanecer seleccionada.
          </p>
        </section>
      </div>

      <div className="mt-6 flex items-center justify-end">
        <button
          type="submit"
          disabled={updatePreferences.isPending}
          className="inline-flex items-center gap-2 rounded-xl bg-[#223382] text-white px-6 py-2.5 text-sm font-bold transition-colors hover:bg-[#1b2a6b] disabled:opacity-60"
        >
          {updatePreferences.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <BadgeCheck className="w-4 h-4" />
          )}
          Guardar Preferencias
        </button>
      </div>

      <div className="mt-4 flex items-start gap-2 text-xs text-text-secondary">
        <Eye className="w-4 h-4 shrink-0 mt-0.5" />
        <p>
          Estas preferencias aplican a cómo eres presentado como responsable en la vista pública de
          tus proyectos publicados.
        </p>
      </div>
    </form>
  );
};
