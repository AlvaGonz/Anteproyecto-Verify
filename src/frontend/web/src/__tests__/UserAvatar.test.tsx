import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { UserAvatarUpload } from '../shared/components/ui/UserAvatarUpload'
import { useAuth } from '../shared/context/AuthContext'
import { useUploadAvatar } from '../features/settings/api/useSettings'
import { useToast } from '../shared/components/ui/Toast/ToastContext'
import '@testing-library/jest-dom'

// Mock dependencies
vi.mock('../shared/context/AuthContext')
vi.mock('../features/settings/api/useSettings')
vi.mock('../shared/components/ui/Toast/ToastContext')

describe('UserAvatarUpload - Reactive Upload', () => {
  it('should use Object.createObjectURL for instant preview before API response', async () => {
    // Arrange
    let mockUser = { id: '1', avatarUrl: '/old-avatar.jpg', nombre: 'Pedro' }
    const mockUpdateUser = vi.fn().mockImplementation((data) => {
      mockUser = { ...mockUser, ...data }
      vi.mocked(useAuth).mockReturnValue({
        user: mockUser,
        updateUser: mockUpdateUser,
        isAuthenticated: true,
        loading: false,
        login: vi.fn(),
        logout: vi.fn(),
        refreshUser: vi.fn(),
        error: null
      } as any)
    })
    
    vi.mocked(useAuth).mockReturnValue({ 
      user: mockUser, 
      updateUser: mockUpdateUser,
      isAuthenticated: true,
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      error: null
    } as any)

    const mockMutateAsync = vi.fn().mockResolvedValue({ url: '/new-avatar.jpg' })
    vi.mocked(useUploadAvatar).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false
    } as any)

    vi.mocked(useToast).mockReturnValue({
      addToast: vi.fn(),
      removeToast: vi.fn()
    })

    global.URL.createObjectURL = vi.fn(() => 'blob:http://localhost/new-preview-url')
    global.URL.revokeObjectURL = vi.fn()

    render(<UserAvatarUpload />)
    const fileInput = screen.getByTestId('avatar-file-input')
    const newFile = new File(['avatar'], 'avatar.png', { type: 'image/png' })

    // Act
    fireEvent.change(fileInput, { target: { files: [newFile] } })

    // Since we mocked `useAuth` statically, the component won't re-render with the new user object
    // unless we re-render it. Let's just verify `updateUser` was called with the optimistic URL.
    expect(global.URL.createObjectURL).toHaveBeenCalledWith(newFile)
    expect(mockUpdateUser).toHaveBeenCalledWith({ avatarUrl: 'blob:http://localhost/new-preview-url' })
    
    // Assert eventual consistent update
    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith(newFile)
      // It should update user again if backend returns a new URL
      expect(mockUpdateUser).toHaveBeenCalledWith({ avatarUrl: '/new-avatar.jpg' })
      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:http://localhost/new-preview-url')
    })
  })
})
