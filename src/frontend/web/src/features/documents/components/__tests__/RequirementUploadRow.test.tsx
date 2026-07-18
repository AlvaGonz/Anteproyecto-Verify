import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { RequirementUploadRow } from '../RequirementUploadRow';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/shared/components/ui/Toast/ToastContext';

// Mock the API hook
vi.mock('../../api/useDocuments', () => ({
  useUploadRequirementDocument: vi.fn().mockReturnValue({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));

import { useUploadRequirementDocument } from '../../api/useDocuments';

const createWrapper = () => {
  const queryClient = new QueryClient();
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        {children}
      </ToastProvider>
    </QueryClientProvider>
  );
};

describe('RequirementUploadRow', () => {
  const defaultProps = {
    projectId: 'test-project',
    requirementCode: 'TITULO',
    label: 'Título de Propiedad',
    description: 'Documento notarial',
    isUploaded: false,
    categoryLabel: 'TITULO',
  };

  it('renders correctly and shows upload button when not uploaded', () => {
    render(<RequirementUploadRow {...defaultProps} />, { wrapper: createWrapper() });
    
    expect(screen.getByText('Título de Propiedad')).toBeInTheDocument();
    expect(screen.getByText('Documento notarial')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /subir/i })).toBeInTheDocument();
  });

  it('shows success status when uploaded but not verified', () => {
    render(<RequirementUploadRow {...defaultProps} isUploaded={true} documentStatus={0} />, { wrapper: createWrapper() });
    
    expect(screen.getByText('Cargado')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /subir/i })).not.toBeInTheDocument();
  });

  it('shows Verificado status and file name when verified', () => {
    render(
      <RequirementUploadRow 
        {...defaultProps} 
        isUploaded={true} 
        documentStatus={6} 
        fileName="mi_titulo.pdf" 
      />, 
      { wrapper: createWrapper() }
    );
    
    expect(screen.getByText('Verificado')).toBeInTheDocument();
    expect(screen.getByText('mi_titulo.pdf')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /subir/i })).not.toBeInTheDocument();
  });

  it('handles upload failure gracefully and displays error', async () => {
    const mockMutateAsync = vi.fn().mockRejectedValue(new Error('Network error'));
    (useUploadRequirementDocument as any).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    });

    render(<RequirementUploadRow {...defaultProps} />, { wrapper: createWrapper() });
    
    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    const input = screen.getByTestId('inline-file-upload') as HTMLInputElement;
    
    fireEvent.change(input, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        requirementCode: 'TITULO',
        file: file
      });
    });

    // Check if error is displayed inline
    expect(await screen.findByText('Error al subir el documento')).toBeInTheDocument();
  });
});
