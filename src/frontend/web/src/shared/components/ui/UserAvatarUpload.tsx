import React, { useRef } from "react";
import { Camera, Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useAvatarUpload } from "../../../features/settings/hooks/useAvatarUpload";

export const UserAvatarUpload: React.FC = () => {
  const { user } = useAuth();
  const { handleAvatarChange, isPending } = useAvatarUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <button type="button" className="relative group cursor-pointer" aria-label="Cambiar foto de perfil" onClick={() => fileInputRef.current?.click()}>
        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-surface-raised/30 shadow-md">
          {user?.avatarUrl ? (
            <img 
              data-testid="user-avatar-img"
              src={user.avatarUrl.startsWith('data:') || user.avatarUrl.startsWith('blob:') ? user.avatarUrl : `http://localhost:5000${user.avatarUrl}`} 
              alt="Avatar" 
              className="w-full h-full object-cover" 
            />
          ) : (
            <div className="w-full h-full bg-primary/10 text-primary flex items-center justify-center text-3xl font-bold uppercase">
              {user?.nombre?.[0] || user?.email?.[0] || "?"}
            </div>
          )}
        </div>
        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
          {isPending ? (
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          ) : (
            <Camera className="w-6 h-6 text-white" />
          )}
        </div>
      </button>
      <input 
        type="file" 
        data-testid="avatar-file-input"
        ref={fileInputRef} 
        className="hidden" 
        accept="image/png, image/jpeg, image/webp" 
        onChange={handleAvatarChange} 
      />
      <div className="text-center">
        <p className="text-sm font-bold text-text-primary">Foto de perfil</p>
        <p className="text-xs text-text-secondary">JPG, PNG o WEBP, máx 5MB</p>
      </div>
    </div>
  );
};
