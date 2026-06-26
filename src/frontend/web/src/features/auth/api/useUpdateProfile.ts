import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateMyProfile } from '../../../infrastructure/api/profile.api';
import { UpdateProfileDto } from '../schemas';

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateProfileDto) => updateMyProfile(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
  });
};
