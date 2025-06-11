// Translation Request Component Tests - TDD for UI
// Testing the translation request form component

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TranslationRequest } from '../TranslationRequest';

// Mock fetch for API calls
global.fetch = jest.fn();

const mockDocument = {
  id: 'doc-123',
  title: 'HOA Regulations',
  category: 'legal',
  language: 'fr',
};

describe('TranslationRequest Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
  });

  it('should render translation request form', () => {
    render(<TranslationRequest document={mockDocument} />);

    expect(screen.getByText('Request Translation')).toBeInTheDocument();
    expect(screen.getByText('Document: HOA Regulations')).toBeInTheDocument();
    expect(screen.getByLabelText(/target language/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /request translation/i })).toBeInTheDocument();
  });

  it('should show language options excluding source language', () => {
    render(<TranslationRequest document={mockDocument} />);

    const select = screen.getByLabelText(/target language/i);
    fireEvent.click(select);

    // Should show available target languages (not source language 'fr')
    expect(screen.getByText('Arabic')).toBeInTheDocument();
    expect(screen.queryByText('French')).not.toBeInTheDocument(); // Source language excluded
  });

  it('should submit translation request successfully', async () => {
    const mockResponse = {
      translation: {
        id: 'translation-456',
        status: 'pending',
        estimated_cost_cents: 25,
      },
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const onSuccess = jest.fn();
    render(<TranslationRequest document={mockDocument} onSuccess={onSuccess} />);

    // Select target language
    const select = screen.getByLabelText(/target language/i);
    fireEvent.change(select, { target: { value: 'arabic' } });

    // Submit form
    const submitButton = screen.getByRole('button', { name: /request translation/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/translations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document_id: 'doc-123',
          source_language: 'fr',
          target_language: 'arabic',
        }),
      });
    });

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(mockResponse.translation);
    });
  });

  it('should handle API errors gracefully', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Document not found' }),
    });

    render(<TranslationRequest document={mockDocument} />);

    const select = screen.getByLabelText(/target language/i);
    fireEvent.change(select, { target: { value: 'arabic' } });

    const submitButton = screen.getByRole('button', { name: /request translation/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/document not found/i)).toBeInTheDocument();
    });
  });

  it('should show loading state during submission', async () => {
    (fetch as jest.Mock).mockImplementationOnce(
      () => new Promise(resolve => setTimeout(() => resolve({ ok: true, json: () => ({}) }), 100))
    );

    render(<TranslationRequest document={mockDocument} />);

    const select = screen.getByLabelText(/target language/i);
    fireEvent.change(select, { target: { value: 'arabic' } });

    const submitButton = screen.getByRole('button', { name: /request translation/i });
    fireEvent.click(submitButton);

    expect(screen.getByText(/requesting translation/i)).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  it('should prevent submission without target language', () => {
    render(<TranslationRequest document={mockDocument} />);

    const submitButton = screen.getByRole('button', { name: /request translation/i });
    fireEvent.click(submitButton);

    expect(fetch).not.toHaveBeenCalled();
    expect(screen.getByText(/please select a target language/i)).toBeInTheDocument();
  });

  it('should show estimated cost when available', async () => {
    const mockResponse = {
      translation: {
        id: 'translation-456',
        status: 'pending',
        estimated_cost_cents: 250, // $2.50
      },
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const onSuccess = jest.fn();
    render(<TranslationRequest document={mockDocument} onSuccess={onSuccess} />);

    const select = screen.getByLabelText(/target language/i);
    fireEvent.change(select, { target: { value: 'arabic' } });

    const submitButton = screen.getByRole('button', { name: /request translation/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/estimated cost.*\$2\.50/i)).toBeInTheDocument();
    });
  });
});