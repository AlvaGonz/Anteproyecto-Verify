import { useCallback } from 'react';
import { useUploadAvatar } from '../api/useSettings';
import { useToast } from '../../../shared/components/ui/Toast/ToastContext';
import { z } from 'zod';
import { useAuth } from '../../../shared/context/AuthContext';

const AvatarSchema = z
  .instanceof(File)
  .refine((file) => file.size <= 5 * 1024 * 1024, {
    message: "La imagen no debe exceder los 5MB",
  })
  .refine(
    (file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type),
    {
      message: "Solo se permiten formatos JPG, PNG o WEBP",
    }
  );

export const useAvatarUpload = () => {
  const uploadAvatar = useUploadAvatar();
  const { addToast } = useToast();
  const { updateUser } = useAuth();

  const handleAvatarChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // OWASP validation with Zod
    const validationResult = AvatarSchema.safeParse(file);
    if (!validationResult.success) {
      addToast(validationResult.error.issues[0].message, "error");
      return;
    }

    // Optimistic UI update
    const objectUrl = URL.createObjectURL(file);
    updateUser({ avatarUrl: objectUrl });

    try {
      const result = await uploadAvatar.mutateAsync(file);
      addToast("Avatar actualizado correctamente", "success");
      // Update with the actual backend URL if returned
      if (result?.url) {
        updateUser({ avatarUrl: result.url });
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Error al actualizar avatar";
      addToast(msg, "error");
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  }, [uploadAvatar, addToast, updateUser]);

  return {
    handleAvatarChange,
    isPending: uploadAvatar.isPending,
  };
};
