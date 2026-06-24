import apiClient from './client';
import { UpdateProfileDto } from '../../features/auth/schemas';

export const updateMyProfile = (data: UpdateProfileDto) =>
  apiClient.patch('/auth/profile', data);
