import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Sidebar } from '../shared/components/layout/Sidebar'
import { useAuth } from '../shared/context/AuthContext'
import { BrowserRouter } from 'react-router-dom'
import '@testing-library/jest-dom'

// Mock dependencies
vi.mock('../shared/context/AuthContext')
vi.mock('../features/notifications/components/NotificationBell', () => ({
  NotificationBell: () => <div data-testid="mock-notification-bell" />
}))
vi.mock('../features/projects/api/useProjects', () => ({
  useProjects: () => ({ data: [], isLoading: false })
}))


describe('Avatar Consumers - Sidebar', () => {
  it('should render the avatar image in the sidebar when user.avatarUrl is provided', () => {
    // Arrange
    vi.mocked(useAuth).mockReturnValue({
      user: { id: '1', nombre: 'Pedro', apellido: 'Perez', avatarUrl: '/avatar.jpg' },
      isAuthenticated: true,
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      updateUser: vi.fn(),
      error: null
    } as any)

    // Act
    render(
      <BrowserRouter>
        <Sidebar mobileOpen={true} setMobileOpen={vi.fn()} />
      </BrowserRouter>
    )

    // Assert
    const img = screen.getByTestId('sidebar-avatar-img')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', 'http://localhost:5000/avatar.jpg')
    
    // Initials should not be in the document (within the avatar block, we can just check there's no PP)
    // There might be a PP somewhere else but we test specifically the image
  })
})
