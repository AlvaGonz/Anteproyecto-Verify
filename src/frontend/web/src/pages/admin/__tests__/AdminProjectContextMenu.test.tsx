import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AdminProjectContextMenu } from '../AdminProjectContextMenu';
import { ProjectStatus } from '../../../features/projects/types';
import React from 'react';

describe('AdminProjectContextMenu - destructive delete confirmation', () => {
  const project = {
    id: 'project-1',
    nombre: 'Mi Proyecto Test',
    estadoProyecto: ProjectStatus.Draft,
  };

  const defaultProps = {
    project,
    isOpen: true,
    onToggle: vi.fn(),
    onClose: vi.fn(),
    updateStatus: vi.fn(),
    deleteProject: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders a Hallazgos link pointing to the validations route', () => {
    render(
      <MemoryRouter>
        <AdminProjectContextMenu {...defaultProps} />
      </MemoryRouter>
    );
    
    const hallazgosLink = screen.getByRole('link', { name: /hallazgos/i });
    expect(hallazgosLink).toBeInTheDocument();
    expect(hallazgosLink).toHaveAttribute('href', '/admin/projects/project-1/validations');
  });

  it('does not use the native window.confirm dialog when delete is triggered', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(
      <MemoryRouter>
        <AdminProjectContextMenu {...defaultProps} />
      </MemoryRouter>,
    );

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /Eliminar/i }));

    expect(confirmSpy).not.toHaveBeenCalled();
    confirmSpy.mockRestore();
  });

  it('opens a destructive confirmation modal naming the project and the irreversible action', async () => {
    render(
      <MemoryRouter>
        <AdminProjectContextMenu {...defaultProps} />
     </MemoryRouter>,
    );

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /Eliminar/i }));

    // Modal dialog with role="dialog" (or alertdialog) must appear.
    const dialog = screen.getByRole('alertdialog');
    expect(dialog).toBeInTheDocument();

    // Destructive title.
    expect(dialog.textContent).toMatch(/eliminar proyecto/i);

    // Body must name the project so the user knows what they are about to destroy.
    expect(dialog.textContent).toContain('Mi Proyecto Test');

    // Body must warn that the action cannot be undone (destructive affordance).
    expect(dialog.textContent).toMatch(/no se puede deshacer|irreversible|permanent/i);
  });

  it('does NOT call deleteProject when the user cancels the confirmation', async () => {
    const deleteProject = vi.fn();

    render(
      <MemoryRouter>
        <AdminProjectContextMenu {...defaultProps} deleteProject={deleteProject} />
    </MemoryRouter>,
    );

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /Eliminar/i }));

    const dialog = screen.getByRole('alertdialog');
    await user.click(within(dialog).getByRole('button', { name: /cancelar/i }));

    expect(deleteProject).not.toHaveBeenCalled();
  });

  it('calls deleteProject exactly once when the user confirms the destructive action', async () => {
    const deleteProject = vi.fn();

    render(
      <MemoryRouter>
        <AdminProjectContextMenu {...defaultProps} deleteProject={deleteProject} />
    </MemoryRouter>,
    );

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /Eliminar/i }));

    const dialog = screen.getByRole('alertdialog');
    await user.click(within(dialog).getByRole('button', { name: /eliminar/i }));

    expect(deleteProject).toHaveBeenCalledTimes(1);
    expect(deleteProject).toHaveBeenCalledWith('project-1');
  });

  describe('role-based visibility for Cambiar Estado options', () => {
    it('does NOT render Cambiar Estado section or status action buttons when isAdmin is false', () => {
      render(
        <MemoryRouter>
          <AdminProjectContextMenu {...defaultProps} isAdmin={false} />
        </MemoryRouter>
      );

      expect(screen.queryByText(/cambiar estado/i)).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /publicar \(aprobado\)/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /pasar a en revisión/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /marcar observado/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /revertir a borrador/i })).not.toBeInTheDocument();

      // Navigation links should still be accessible
      expect(screen.getByRole('link', { name: /validaciones/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /documentos/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /hallazgos/i })).toBeInTheDocument();
    });

    it('renders Cambiar Estado section and status action buttons when isAdmin is true', () => {
      render(
        <MemoryRouter>
          <AdminProjectContextMenu {...defaultProps} isAdmin={true} />
        </MemoryRouter>
      );

      expect(screen.getByText(/cambiar estado/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /publicar \(aprobado\)/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /pasar a en revisión/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /marcar observado/i })).toBeInTheDocument();
    });
  });
});

