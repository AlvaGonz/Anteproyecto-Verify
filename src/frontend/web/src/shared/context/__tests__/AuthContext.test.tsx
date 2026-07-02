import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import { AuthService } from '../../../features/auth/services/AuthService';
import { queryClient } from '../../../infrastructure/api/queryClient';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { success } from '../../utils/functional';

// Mock dependencies
vi.mock('../../../features/auth/services/AuthService', () => ({
  AuthService: {
    login: vi.fn(),
    logout: vi.fn(),
    getCurrentUser: vi.fn().mockResolvedValue({ _tag: 'None' }),
  }
}));

vi.mock('../../../infrastructure/api/queryClient', () => ({
  queryClient: {
    clear: vi.fn()
  }
}));

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should clear queryClient cache on login to prevent session crossover', async () => {
    vi.mocked(AuthService.login).mockResolvedValue(success({
      user: { id: '1', email: 'test@test.com', nombre: 'Test', apellido: 'User', role: 'User' },
      token: 'fake-token'
    }));

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider
    });

    // Wait for the initial effect to complete (getCurrentUser)
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    await act(async () => {
      await result.current.login('test@test.com', 'password');
    });

    expect(queryClient.clear).toHaveBeenCalledTimes(1);
  });

  it('should clear queryClient cache on logout', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider
    });

    // Wait for the initial effect to complete (getCurrentUser)
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    act(() => {
      result.current.logout();
    });

    expect(queryClient.clear).toHaveBeenCalledTimes(1);
  });
});
