import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UpdateProfileSchema, UpdateProfileDto } from "../../auth/schemas";
import { useAuth } from "../../../shared/context/AuthContext";
import { useUpdateMyProfile } from "../api/useSettings";
import { useToast } from "../../../shared/components/ui/Toast/ToastContext";
import { usePhoneInput } from "@/shared/hooks/usePhoneInput";
import { useProvinces } from "../../provinces/api/useProvinces";
import { User, Mail, Phone, Shield, CreditCard, Award, Building2, Briefcase, MapPin, Globe, AtSign, BadgeCheck, ArrowRight, X } from "lucide-react";
import { UserAvatarUpload } from "../../../shared/components/ui/UserAvatarUpload";
import { useDgiiLookup, DgiiData } from "../../../shared/hooks/useDgiiLookup";

// Cédula formatting: XXX-XXXXXXX-X
const formatCedula = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 10) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 10)}-${digits.slice(10)}`;
};

const ROLE_LABEL: Record<string, string> = {
  admin: "Administrador",
  dev: "Desarrollador",
  validator: "Validador",
  user: "Usuario",
};

export const MyProfileForm: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { data: provincias } = useProvinces();
  const { addToast } = useToast();
  const updateProfile = useUpdateMyProfile();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingData, setPendingData] = useState<UpdateProfileDto | null>(null);
  const [cedulaDisplay, setCedulaDisplay] = useState(() => user?.cedula ? formatCedula(user.cedula) : "");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = useForm<UpdateProfileDto>({
    resolver: zodResolver(UpdateProfileSchema),
    defaultValues: {
      nombre: user?.nombre ?? "",
      apellido: user?.apellido ?? "",
      telefono: user?.telefono ?? "",
      cedula: user?.cedula ?? "",
      rnc: user?.rnc ?? "",
      direccion: user?.direccion ?? "",
      provincia: user?.provincia ?? "" as any,
      nickname: user?.nickname ?? "",
      changePassword: false,
    },
  });

  // Phone input hook
  const phoneValueRaw = watch("telefono") ? watch("telefono")!.replace(/\D/g, '') : "";
  const phone = usePhoneInput(phoneValueRaw, (formattedValue) => {
    const digits = formattedValue.replace(/\D/g, '');
    setValue("telefono", digits, { shouldValidate: true, shouldDirty: true });
  });

  // RNC auto-search logic
  const { searchRnc, isSearching: isSearchingRnc, error: rncSearchError, setError: setRncSearchError } = useDgiiLookup();
  const [previewDgii, setPreviewDgii] = useState<DgiiData | null>(null);
  const currentRnc = watch("rnc");

  useEffect(() => {
    if (currentRnc) {
      const cleaned = currentRnc.replace(/\D/g, "");
      if (cleaned.length === 11 || cleaned.length === 9) {
        handleSearchRnc(currentRnc);
      }
    } else {
      if (previewDgii) setPreviewDgii(null);
      if (rncSearchError) setRncSearchError(null);
    }
  }, [currentRnc]);

  const handleSearchRnc = async (val: string) => {
    const data = await searchRnc(val);
    if (data) {
      setPreviewDgii(data);
      setValue("rnc", val, { shouldDirty: true });
    } else {
      setPreviewDgii(null);
    }
  };

  const handleRncKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearchRnc(currentRnc || "");
    }
  };

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    if (user) {
      reset({
        nombre: user.nombre ?? "",
        apellido: user.apellido ?? "",
        telefono: user.telefono ?? "",
        cedula: user.cedula ?? "",
        direccion: user.direccion ?? "",
        provincia: user.provincia ?? "" as any,
        nickname: user.nickname ?? "",
        changePassword: false,
      });
      setCedulaDisplay(user.cedula ? formatCedula(user.cedula) : "");
    }
  }, [user, reset]);

  const onSubmit = (data: UpdateProfileDto) => {
    // Store the pending data and show confirmation modal
    setPendingData(data);
    setShowConfirmModal(true);
  };

  const handleConfirmSave = async () => {
    if (!pendingData) return;

    const data = pendingData;
    try {
      const isRncEmpty = !data.rnc || data.rnc.trim() === "";
      await updateProfile.mutateAsync({
        nombre: data.nombre,
        apellido: data.apellido,
        telefono: data.telefono || undefined,
        cedula: data.cedula ?? "",
        rnc: data.rnc ?? "",
        razonSocial: isRncEmpty ? "" : (previewDgii?.nombreRazonSocial || user?.razonSocial || ""),
        nombreComercial: isRncEmpty ? "" : (previewDgii?.nombreComercial || user?.nombreComercial || ""),
        actividadEconomica: isRncEmpty ? "" : (previewDgii?.actividadEconomica || user?.actividadEconomica || ""),
        direccion: data.direccion,
        provincia: data.provincia,
        nickname: data.nickname,
      });
      await refreshUser();
      addToast("Perfil actualizado correctamente", "success");
      setShowConfirmModal(false);
      setPendingData(null);
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Error al actualizar perfil";
      addToast(msg, "error");
    }
  };

  const getChanges = () => {
    if (!pendingData || !user) return [];
    const changes: Array<{ field: string; current: string; new: string }> = [];

    const fieldsToCompare = [
      { key: "nombre" as const, label: "Nombre" },
      { key: "apellido" as const, label: "Apellido" },
      { key: "telefono" as const, label: "Teléfono" },
      { key: "cedula" as const, label: "Cédula" },
      { key: "rnc" as const, label: "RNC" },
      { key: "direccion" as const, label: "Dirección" },
      { key: "provincia" as const, label: "Provincia" },
      { key: "nickname" as const, label: "Apodo / Nickname" },
    ];

    fieldsToCompare.forEach(({ key, label }) => {
      const currentValue = user[key] || "";
      const newValue = pendingData[key] || "";
      if (currentValue !== newValue) {
        changes.push({ field: label, current: currentValue || "(vacío)", new: newValue || "(vacío)" });
      }
    });

    return changes;
  };

  return (
    <React.Fragment>
      <form onSubmit={handleSubmit(onSubmit)} className="w-full">
        {/* Two-column grid: left = avatar+identity, right = editable fields */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch" data-testid="settings-grid">

        {/* ═══ LEFT COLUMN: Avatar + Read-only Identity ═══ */}
        <div className="flex flex-col gap-6 h-full">
          {/* READ-ONLY identity section with Avatar */}
          <div className="bg-surface-raised/30 border border-border rounded-2xl p-5 space-y-3 flex-1 flex flex-col">
            <UserAvatarUpload />
            <div className="flex-1 space-y-5">
              <p className="text-xs font-black text-text-secondary uppercase tracking-widest mb-4 pb-2 border-b border-border/50">
                Datos de Identidad
              </p>
              <div className="flex items-center gap-4">
                <Mail className="w-6 h-6 text-text-secondary shrink-0" />
                <div>
                  <p className="text-xs text-text-secondary uppercase font-bold">Correo Electrónico</p>
                  <p className="text-base font-mono text-text-primary">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <CreditCard className="w-6 h-6 text-text-secondary shrink-0" />
                <div>
                  <p className="text-xs text-text-secondary uppercase font-bold">Cédula</p>
                  <p className="text-base font-mono text-text-primary">{user?.cedula || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Shield className="w-6 h-6 text-text-secondary shrink-0" />
                <div>
                  <p className="text-xs text-text-secondary uppercase font-bold">Rol</p>
                  <p className="text-base font-bold text-text-primary">
                    {ROLE_LABEL[user?.role ?? "user"] ?? user?.role}
                  </p>
                </div>
              </div>
              {user?.role !== "admin" && (user?.plan || user?.isGuest) && (
                <div className="flex items-center gap-4">
                  <Award className="w-6 h-6 text-text-secondary shrink-0" />
                  <div>
                    <p className="text-xs text-text-secondary uppercase font-bold">Plan de Suscripción</p>
                    <p className="text-base font-bold text-primary">
                      {user.isGuest ? `${user.inviterPlan || "N/A"} (Invitado)` : user.plan}
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-4">
                <Shield className="w-6 h-6 text-text-secondary shrink-0" />
                <div>
                  <p className="text-xs text-text-secondary uppercase font-bold">Razón Social (DGII)</p>
                  <p className="text-base font-bold text-text-primary">
                    {previewDgii?.nombreRazonSocial || user?.razonSocial || "******* ******* *******"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Building2 className="w-6 h-6 text-text-secondary shrink-0" />
                <div>
                  <p className="text-xs text-text-secondary uppercase font-bold">Nombre Comercial</p>
                  <p className="text-base font-bold text-text-primary">
                    {previewDgii?.nombreComercial || user?.nombreComercial || "******* ******* *******"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Briefcase className="w-6 h-6 text-text-secondary shrink-0" />
                <div>
                  <p className="text-xs text-text-secondary uppercase font-bold">Actividad Económica</p>
                  <p className="text-base font-bold text-text-primary">
                    {previewDgii?.actividadEconomica || user?.actividadEconomica || "******* ******* *******"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ RIGHT COLUMN: Editable fields ═══ */}
        <div className="flex flex-col gap-6 h-full">

          {/* Editable fields card */}
          <div className="bg-surface-raised/30 border border-border rounded-2xl p-5 flex flex-col gap-4 flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="mp-nombre" className="block text-xs font-bold text-text-secondary uppercase mb-1">
                  Nombre
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                  <input
                    id="mp-nombre"
                    {...register("nombre")}
                    type="text"
                    className="vf-input w-full pl-9"
                    placeholder="Tu nombre"
                  />
                </div>
                {errors.nombre && (
                  <p className="text-[10px] text-red-500 mt-1">{errors.nombre.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="mp-apellido" className="block text-xs font-bold text-text-secondary uppercase mb-1">
                  Apellido
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                  <input
                    id="mp-apellido"
                    {...register("apellido")}
                    type="text"
                    className="vf-input w-full pl-9"
                    placeholder="Tu apellido"
                  />
                </div>
                {errors.apellido && (
                  <p className="text-[10px] text-red-500 mt-1">{errors.apellido.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="mp-telefono" className="block text-xs font-bold text-text-secondary uppercase mb-1">
                Teléfono
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                <input
                  id="mp-telefono"
                  {...register("telefono")}
                  type="text"
                  maxLength={14}
                  inputMode="numeric"
                  value={phone.value}
                  onChange={phone.handleChange}
                  onKeyDown={(e) => {
                    const allowedKeys = ["Backspace", "Tab", "ArrowLeft", "ArrowRight", "Delete", "Enter"];
                    if (!allowedKeys.includes(e.key) && !/^[0-9]$/.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  className="vf-input w-full pl-9"
                  placeholder="(809) 000-0000"
                />
              </div>
              {errors.telefono && (
                <p className="text-[10px] text-red-500 mt-1">{errors.telefono.message}</p>
              )}
            </div>

            {/* Direccion Field */}
            <div>
              <label htmlFor="mp-direccion" className="block text-xs font-bold text-text-secondary uppercase mb-1">
                Dirección
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                <input
                  id="mp-direccion"
                  {...register("direccion")}
                  type="text"
                  maxLength={200}
                  className="vf-input w-full pl-9"
                  placeholder="Calle / Avenida / Sector"
                  aria-label="Dirección de residencia"
                />
              </div>
              {errors.direccion && (
                <p className="text-[10px] text-red-500 mt-1">{errors.direccion.message}</p>
              )}
            </div>

            {/* Provincia Field */}
            <div>
              <label htmlFor="mp-provincia" className="block text-xs font-bold text-text-secondary uppercase mb-1">
                Provincia
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary z-10" />
                <select
                  id="mp-provincia"
                  {...register("provincia")}
                  className="vf-input w-full pl-9 appearance-none"
                  aria-label="Provincia de residencia"
                >
                  <option value="">Seleccione una provincia</option>
                  {provincias?.map((p) => (
                    <option key={p.nombre} value={p.nombre}>{p.nombre}</option>
                  ))}
                </select>
              </div>
              {errors.provincia && (
                <p className="text-[10px] text-red-500 mt-1">{errors.provincia.message}</p>
              )}
            </div>

            {/* Nickname Field */}
            <div>
              <label htmlFor="mp-nickname" className="block text-xs font-bold text-text-secondary uppercase mb-1">
                Apodo / NickName
              </label>
              <div className="relative">
                <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                <input
                  id="mp-nickname"
                  {...register("nickname")}
                  type="text"
                  maxLength={30}
                  className="vf-input w-full pl-9"
                  placeholder="Nombre de vendedor (visible al público)"
                  aria-label="Apodo o nombre de vendedor"
                />
              </div>
              {errors.nickname && (
                <p className="text-[10px] text-red-500 mt-1">{errors.nickname.message}</p>
              )}
            </div>

            {/* RNC Field */}
            <div>
              <label htmlFor="rnc" className="block text-xs font-bold text-text-secondary uppercase mb-1">
                RNC
              </label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                <input
                  {...register("rnc")}
                  id="rnc"
                  type="text"
                  maxLength={20}
                  onKeyDown={handleRncKeyDown}
                  className={`vf-input w-full pl-9 ${rncSearchError ? "border-red-400 focus:ring-red-200 focus:border-red-500" : ""}`}
                  placeholder="Ej: 101000000"
                />
                {isSearchingRnc && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              {errors.rnc && (
                <p className="text-[10px] text-red-500 mt-1">{errors.rnc.message}</p>
              )}
              {rncSearchError && !errors.rnc && (
                <p className="text-[10px] text-red-500 mt-1">{rncSearchError}</p>
              )}
            </div>

            {/* Cédula Field */}
            <div>
              <label htmlFor="mp-cedula" className="block text-xs font-bold text-text-secondary uppercase mb-1">
                Cédula
              </label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                <input
                  id="mp-cedula"
                  {...register("cedula", { setValueAs: (v: string) => v.replace(/\D/g, '').slice(0, 11) })}
                  type="text"
                  maxLength={15}
                  value={cedulaDisplay}
                  onChange={(e) => {
                    const formatted = formatCedula(e.target.value);
                    setCedulaDisplay(formatted);
                  }}
                  className="vf-input w-full pl-9"
                  placeholder="Ej: 402-1234567-8"
                />
              </div>
              {errors.cedula && (
                <p className="text-[10px] text-red-500 mt-1">{errors.cedula.message}</p>
              )}
            </div>

            {/* Seller Badge */}
            <div className="flex items-center gap-2 px-1">
              {user?.rnc && user.rnc.length > 0 ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-800 text-xs font-bold rounded-full border border-green-200">
                  <BadgeCheck className="w-3.5 h-3.5" />
                  Vendedor Verificado DGII
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-bold rounded-full border border-gray-200">
                  Vendedor Particular
                </span>
              )}
            </div>

          {/* Save button - OUTSIDE danger zone */}
          <button
            type="submit"
            disabled={!isDirty || updateProfile.isPending}
            className="vf-btn-primary disabled:opacity-40 disabled:cursor-not-allowed shrink-0 py-3 mt-4"
          >
            {updateProfile.isPending ? "Guardando..." : "Guardar Cambios"}
          </button>
</div>
      </div>
    </div>
    </form>

      {/* Confirmation Modal */}
      {showConfirmModal && pendingData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => { setShowConfirmModal(false); setPendingData(null); }}>
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-text-primary">Confirmar cambios</h3>
              <button
                type="button"
                onClick={() => { setShowConfirmModal(false); setPendingData(null); }}
                className="text-text-secondary hover:text-text-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-text-secondary mb-4">Revisa los cambios antes de guardar:</p>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {getChanges().map((change, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs font-bold text-text-secondary uppercase">{change.field}</p>
                  <div className="flex items-center gap-2 mt-1 text-sm">
                    <span className="text-text-secondary flex-1 truncate">{change.current}</span>
                    <ArrowRight className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-primary font-medium flex-1 truncate">{change.new}</span>
                  </div>
                </div>
              ))}
              {getChanges().length === 0 && (
                <p className="text-sm text-text-secondary text-center py-4">No hay cambios para guardar</p>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => { setShowConfirmModal(false); setPendingData(null); }}
                className="flex-1 vf-btn-secondary py-2"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmSave}
                disabled={updateProfile.isPending}
                className="flex-1 vf-btn-primary py-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {updateProfile.isPending ? "Guardando..." : "Confirmar y Guardar"}
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
</React.Fragment>
  );
};