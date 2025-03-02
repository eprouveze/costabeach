import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DocumentUpload } from '@/components/DocumentUpload';
import { useDocuments } from '@/lib/hooks/useDocuments';
import { DocumentCategory, Language } from '@/lib/types';
import { toast } from 'react-toastify';

// Mock the useDocuments hook
jest.mock('@/lib/hooks/useDocuments', () => ({
  useDocuments: jest.fn(),
}));

// Mock react-toastify
jest.mock('react-toastify', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

describe('DocumentUpload Component', () => {
  const mockUploadDocument = jest.fn();
  const mockOnSuccess = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mock implementation
    (useDocuments as jest.Mock).mockReturnValue({
      uploadDocument: mockUploadDocument,
      isUploading: false,
      uploadProgress: 0,
    });
  });
  
  it('renders the component correctly', () => {
    render(<DocumentUpload />);
    
    // Check that the component renders with the correct title
    expect(screen.getByText('Upload Document')).toBeInTheDocument();
    
    // Check that form fields are present
    expect(screen.getByLabelText(/Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Language/i)).toBeInTheDocument();
    
    // Check that the file upload area is present
    expect(screen.getByText(/Drag and drop your file here/i)).toBeInTheDocument();
  });
  
  it('validates required fields on submit', async () => {
    render(<DocumentUpload />);
    
    // Try to submit the form without filling required fields
    const submitButton = screen.getByRole('button', { name: /Upload/i });
    fireEvent.click(submitButton);
    
    // Check that validation errors are shown
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Please select a file to upload');
    });
    
    // Fill the title but still no file
    const titleInput = screen.getByLabelText(/Title/i);
    fireEvent.change(titleInput, { target: { value: 'Test Document' } });
    
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Please select a file to upload');
    });
  });
  
  it('handles file selection correctly', async () => {
    render(<DocumentUpload />);
    
    // Create a mock file
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    
    // Get the file input (it's hidden, so we need to find it by its role)
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    
    // Simulate file selection
    userEvent.upload(fileInput, file);
    
    // Check that the file is displayed
    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument();
    });
  });
  
  it('handles file removal correctly', async () => {
    render(<DocumentUpload />);
    
    // Create a mock file
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    
    // Get the file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    
    // Simulate file selection
    userEvent.upload(fileInput, file);
    
    // Check that the file is displayed
    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument();
    });
    
    // Find and click the remove button
    const removeButton = screen.getByRole('button', { name: /remove/i });
    fireEvent.click(removeButton);
    
    // Check that the file is removed
    await waitFor(() => {
      expect(screen.queryByText('test.pdf')).not.toBeInTheDocument();
    });
  });
  
  it('submits the form with valid data', async () => {
    // Mock successful upload
    mockUploadDocument.mockResolvedValue({ id: '123', title: 'Test Document' });
    
    render(<DocumentUpload onSuccess={mockOnSuccess} />);
    
    // Fill the form
    const titleInput = screen.getByLabelText(/Title/i);
    fireEvent.change(titleInput, { target: { value: 'Test Document' } });
    
    const descriptionInput = screen.getByLabelText(/Description/i);
    fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });
    
    // Select category
    const categorySelect = screen.getByLabelText(/Category/i);
    fireEvent.change(categorySelect, { target: { value: DocumentCategory.LEGAL } });
    
    // Select language
    const languageSelect = screen.getByLabelText(/Language/i);
    fireEvent.change(languageSelect, { target: { value: Language.FRENCH } });
    
    // Upload a file
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    userEvent.upload(fileInput, file);
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Upload/i });
    fireEvent.click(submitButton);
    
    // Check that uploadDocument was called with the correct arguments
    await waitFor(() => {
      expect(mockUploadDocument).toHaveBeenCalledWith(
        file,
        'Test Document',
        DocumentCategory.LEGAL,
        Language.FRENCH,
        'Test Description'
      );
    });
    
    // Check that onSuccess was called
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
    
    // Check that the form was reset
    await waitFor(() => {
      expect(titleInput).toHaveValue('');
      expect(descriptionInput).toHaveValue('');
    });
  });
  
  it('displays upload progress during file upload', async () => {
    // Mock uploading state
    (useDocuments as jest.Mock).mockReturnValue({
      uploadDocument: mockUploadDocument,
      isUploading: true,
      uploadProgress: 50,
    });
    
    render(<DocumentUpload />);
    
    // Check that the progress bar is displayed
    expect(screen.getByText('Uploading: 50%')).toBeInTheDocument();
    
    // Check that the progress bar has the correct width
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveStyle('width: 50%');
  });
  
  it('handles upload errors correctly', async () => {
    // Mock upload failure
    mockUploadDocument.mockRejectedValue(new Error('Upload failed'));
    
    render(<DocumentUpload />);
    
    // Fill the form
    const titleInput = screen.getByLabelText(/Title/i);
    fireEvent.change(titleInput, { target: { value: 'Test Document' } });
    
    // Upload a file
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    userEvent.upload(fileInput, file);
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Upload/i });
    fireEvent.click(submitButton);
    
    // Check that uploadDocument was called
    await waitFor(() => {
      expect(mockUploadDocument).toHaveBeenCalled();
    });
    
    // Check that onSuccess was not called
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });
  
  it('handles drag and drop correctly', async () => {
    render(<DocumentUpload />);
    
    // Get the drop zone
    const dropZone = screen.getByText(/Drag and drop your file here/i).closest('div');
    
    // Simulate drag enter
    fireEvent.dragEnter(dropZone!);
    
    // Check that the drop zone has the active class
    expect(dropZone).toHaveClass('border-blue-500');
    
    // Simulate drag leave
    fireEvent.dragLeave(dropZone!);
    
    // Check that the drop zone no longer has the active class
    expect(dropZone).not.toHaveClass('border-blue-500');
    
    // Simulate drop with a file
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    const dataTransfer = {
      files: [file],
    };
    
    fireEvent.drop(dropZone!, { dataTransfer });
    
    // Check that the file is displayed
    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument();
    });
  });
}); 