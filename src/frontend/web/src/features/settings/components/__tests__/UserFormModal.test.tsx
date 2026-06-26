import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UserFormModal } from '../UserFormModal';
import { UserSettings, CreateUserDto } from '../../types/settings.types';
import React from 'react';

describe('UserFormModal', () => {
  const defaultProps = {
    isOpen: true,
    isProcessing: false,
    onChange: vi.fn(),
    onSubmit: vi.fn(),
    onClose: vi.fn(),
  };

  const formData: CreateUserDto = {
    name: 'Test',
    email: 'test@example.com',
    role: 'user',
    telefono: '',
    cedula: '',
  };

  const editingUser: UserSettings = {
    id: 'user-1',
    name: 'Test',
    email: 'test@example.com',
    role: 'user',
    telefono: '',
    cedula: '',
    profileId: null,
    profileName: '',
    planId: null,
    planName: '',
    planPrice: null
  };

  it('should make email and cedula readOnly when editingUser is not null', () => {
    render(
      <UserFormModal 
        {...defaultProps} 
        editingUser={editingUser} 
        formData={formData} 
      />
    );

    const emailInput = screen.getByPlaceholderText('ejemplo@empresa.com');
    const cedulaInput = screen.getByPlaceholderText('000-0000000-0');

    expect(emailInput).toHaveAttribute('readOnly');
    expect(cedulaInput).toHaveAttribute('readOnly');
  });

  it('should NOT make email and cedula readOnly when editingUser is null (create mode)', () => {
    render(
      <UserFormModal 
        {...defaultProps} 
        editingUser={null} 
        formData={formData} 
      />
    );

    const emailInput = screen.getByPlaceholderText('ejemplo@empresa.com');
    const cedulaInput = screen.getByPlaceholderText('000-0000000-0');

    expect(emailInput).not.toHaveAttribute('readOnly');
    expect(cedulaInput).not.toHaveAttribute('readOnly');
  });
});
