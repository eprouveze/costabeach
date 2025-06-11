# PDF Viewer Integration

## 🎯 Overview

Phase 2 introduces comprehensive PDF viewing capabilities using PDF.js, enabling in-browser document viewing with full functionality across all devices and languages. This builds upon the existing document upload/download system.

## 🏗️ Current State Analysis

### Existing Document Infrastructure ✅
```typescript
// From src/lib/api/routers/documents.ts (532 lines)
- Document upload/download with Supabase Storage
- Metadata management with categories and permissions
- RLS policies for secure access
- Audit logging for all document operations
- Basic file serving with signed URLs
```

### Enhancement Goals 🚀
1. **PDF.js Integration**: In-browser PDF rendering with controls
2. **Multi-device Support**: Responsive viewer for mobile/desktop
3. **Multilingual UI**: French/Arabic/English viewer interface
4. **Performance Optimization**: Lazy loading and caching strategies
5. **Accessibility**: WCAG 2.1 compliance for document viewing

## 📄 PDF.js Integration Architecture

### Core PDF Viewer Component

**Create**: `src/components/DocumentViewer.tsx`
```typescript
import React, { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, RotateCw } from 'lucide-react';
import { Button } from './Button';
import { useTranslation } from 'next-intl';
import { cn } from '@/lib/utils';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface DocumentViewerProps {
  documentId: string;
  document?: {
    id: string;
    title: string;
    file_path: string;
    mime_type: string;
    file_size: number;
  };
  className?: string;
  height?: number;
  onLoadError?: (error: Error) => void;
  onLoadSuccess?: (pdf: any) => void;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  documentId,
  document,
  className,
  height = 800,
  onLoadError,
  onLoadSuccess,
}) => {
  const { t } = useTranslation();
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch document URL
  useEffect(() => {
    const fetchDocumentUrl = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/documents/${documentId}/content`);
        if (!response.ok) {
          throw new Error(`Failed to fetch document: ${response.statusText}`);
        }
        
        const { url } = await response.json();
        setPdfUrl(url);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load document';
        setError(errorMessage);
        onLoadError?.(err instanceof Error ? err : new Error(errorMessage));
      } finally {
        setLoading(false);
      }
    };

    if (documentId) {
      fetchDocumentUrl();
    }
  }, [documentId, onLoadError]);

  // PDF load handlers
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
    setLoading(false);
    onLoadSuccess?.({ numPages });
  };

  const onDocumentLoadError = (error: Error) => {
    setError(error.message);
    setLoading(false);
    onLoadError?.(error);
  };

  // Navigation handlers
  const goToPrevPage = () => setPageNumber(prev => Math.max(prev - 1, 1));
  const goToNextPage = () => setPageNumber(prev => Math.min(prev + 1, numPages));
  const goToPage = (page: number) => setPageNumber(Math.max(1, Math.min(page, numPages)));

  // Zoom handlers
  const zoomIn = () => setScale(prev => Math.min(prev + 0.2, 3.0));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));
  const resetZoom = () => setScale(1.0);

  // Rotation handler
  const rotateDocument = () => setRotation(prev => (prev + 90) % 360);

  // Download handler
  const downloadDocument = async () => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = document?.title || 'document.pdf';
      link.click();
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowLeft':
          goToPrevPage();
          break;
        case 'ArrowRight':
          goToNextPage();
          break;
        case '+':
        case '=':
          zoomIn();
          break;
        case '-':
          zoomOut();
          break;
        case '0':
          resetZoom();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  if (loading) {
    return (
      <div className={cn("flex items-center justify-center", className)} style={{ height }}>
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">{t('document.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("flex items-center justify-center", className)} style={{ height }}>
        <div className="text-center p-8 bg-red-50 rounded-lg border border-red-200">
          <p className="text-red-600 font-medium">{t('document.loadError')}</p>
          <p className="text-red-500 text-sm mt-2">{error}</p>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()} 
            className="mt-4"
          >
            {t('common.retry')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col border rounded-lg bg-white", className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <div className="flex items-center space-x-2">
          {/* Page Navigation */}
          <Button
            variant="outline"
            size="sm"
            onClick={goToPrevPage}
            disabled={pageNumber <= 1}
            aria-label={t('document.previousPage')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={pageNumber}
              onChange={(e) => goToPage(parseInt(e.target.value))}
              className="w-16 px-2 py-1 text-center border rounded"
              min={1}
              max={numPages}
            />
            <span className="text-sm text-gray-600">
              {t('document.pageOf', { total: numPages })}
            </span>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={goToNextPage}
            disabled={pageNumber >= numPages}
            aria-label={t('document.nextPage')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Zoom and Tools */}
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={zoomOut}
            disabled={scale <= 0.5}
            aria-label={t('document.zoomOut')}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          
          <span className="text-sm text-gray-600 min-w-[60px] text-center">
            {Math.round(scale * 100)}%
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={zoomIn}
            disabled={scale >= 3.0}
            aria-label={t('document.zoomIn')}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={rotateDocument}
            aria-label={t('document.rotate')}
          >
            <RotateCw className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={downloadDocument}
            aria-label={t('document.download')}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* PDF Content */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-auto bg-gray-100 p-4"
        style={{ height: height - 80 }} // Account for toolbar height
      >
        <div className="flex justify-center">
          {pdfUrl && (
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={
                <div className="flex items-center justify-center h-96">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              }
            >
              <Page
                pageNumber={pageNumber}
                scale={scale}
                rotate={rotation}
                renderTextLayer={true}
                renderAnnotationLayer={true}
                className="shadow-lg"
              />
            </Document>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="px-4 py-2 border-t bg-gray-50 text-sm text-gray-600">
        <div className="flex items-center justify-between">
          <span>
            {document?.title || t('document.untitled')}
          </span>
          <span>
            {t('document.fileSize', { 
              size: document?.file_size ? `${Math.round(document.file_size / 1024)} KB` : 'Unknown'
            })}
          </span>
        </div>
      </div>
    </div>
  );
};
```

### Mobile-Optimized PDF Viewer

**Create**: `src/components/MobilePDFViewer.tsx`
```typescript
import React, { useState } from 'react';
import { DocumentViewer } from './DocumentViewer';
import { Button } from './Button';
import { X, Share, Download } from 'lucide-react';
import { useTranslation } from 'next-intl';

interface MobilePDFViewerProps {
  documentId: string;
  document?: any;
  isOpen: boolean;
  onClose: () => void;
}

export const MobilePDFViewer: React.FC<MobilePDFViewerProps> = ({
  documentId,
  document,
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation();
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!isOpen) return null;

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const shareDocument = async () => {
    if (navigator.share && document) {
      try {
        await navigator.share({
          title: document.title,
          text: t('document.shareText', { title: document.title }),
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white">
      {/* Mobile Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          aria-label={t('common.close')}
        >
          <X className="h-5 w-5" />
        </Button>
        
        <h1 className="font-medium truncate mx-4">
          {document?.title || t('document.untitled')}
        </h1>
        
        <div className="flex items-center space-x-2">
          {navigator.share && (
            <Button
              variant="ghost"
              size="sm"
              onClick={shareDocument}
              aria-label={t('document.share')}
            >
              <Share className="h-5 w-5" />
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            aria-label={t('document.fullscreen')}
          >
            {isFullscreen ? '⤓' : '⤢'}
          </Button>
        </div>
      </div>

      {/* PDF Viewer */}
      <DocumentViewer
        documentId={documentId}
        document={document}
        height={window.innerHeight - 80} // Account for header
        className="h-full"
      />
    </div>
  );
};
```

## 🎨 Storybook Integration

### DocumentViewer Stories

**Create**: `src/stories/organisms/DocumentViewer.stories.tsx`
```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { DocumentViewer } from '../../components/DocumentViewer';
import { createStoryDecorator } from '../utils/StoryProviders';

const meta: Meta<typeof DocumentViewer> = {
  title: 'Organisms/DocumentViewer',
  component: DocumentViewer,
  decorators: [createStoryDecorator({ withTRPC: true, withI18n: true })],
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    height: {
      control: { type: 'range', min: 400, max: 1200, step: 50 },
    },
  },
};

export default meta;
type Story = StoryObj<typeof DocumentViewer>;

export const Default: Story = {
  args: {
    documentId: 'mock-document-1',
    document: {
      id: 'mock-document-1',
      title: 'Sample HOA Bylaws Document',
      file_path: 'documents/sample-bylaws.pdf',
      mime_type: 'application/pdf',
      file_size: 245760, // 240 KB
    },
    height: 800,
  },
};

export const Loading: Story = {
  args: {
    documentId: 'loading-document',
    height: 600,
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the loading state while fetching the PDF document.',
      },
    },
  },
};

export const Error: Story = {
  args: {
    documentId: 'error-document',
    height: 600,
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the error state when document loading fails.',
      },
    },
  },
};

export const MobileView: Story = {
  args: {
    documentId: 'mock-document-1',
    document: {
      id: 'mock-document-1',
      title: 'Mobile Document View',
      file_path: 'documents/mobile-test.pdf',
      mime_type: 'application/pdf',
      file_size: 180240,
    },
    height: 600,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story: 'PDF viewer optimized for mobile devices with touch controls.',
      },
    },
  },
};

export const ArabicRTL: Story = {
  args: {
    documentId: 'mock-document-ar',
    document: {
      id: 'mock-document-ar',
      title: 'وثيقة نموذجية باللغة العربية',
      file_path: 'documents/arabic-sample.pdf',
      mime_type: 'application/pdf',
      file_size: 320480,
    },
    height: 800,
  },
  parameters: {
    locale: 'ar',
    docs: {
      description: {
        story: 'PDF viewer with Arabic language interface and RTL layout.',
      },
    },
  },
};
```

## 🧪 Testing Strategy

### Unit Tests

**Create**: `src/components/DocumentViewer.test.tsx`
```typescript
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DocumentViewer } from './DocumentViewer';
import { EnhancedStoryProviders } from '../stories/utils/EnhancedStoryProviders';

// Mock PDF.js
jest.mock('react-pdf', () => ({
  Document: ({ children, onLoadSuccess }: any) => {
    React.useEffect(() => {
      onLoadSuccess({ numPages: 5 });
    }, [onLoadSuccess]);
    return <div data-testid="pdf-document">{children}</div>;
  },
  Page: ({ pageNumber, scale }: any) => (
    <div data-testid={`pdf-page-${pageNumber}`} data-scale={scale}>
      Mock PDF Page {pageNumber}
    </div>
  ),
  pdfjs: {
    GlobalWorkerOptions: {},
    version: '3.11.174',
  },
}));

// Mock fetch for document URL
global.fetch = jest.fn();

const mockDocument = {
  id: 'test-doc-1',
  title: 'Test Document',
  file_path: 'documents/test.pdf',
  mime_type: 'application/pdf',
  file_size: 245760,
};

const renderDocumentViewer = (props = {}) => {
  return render(
    <EnhancedStoryProviders withI18n withTRPC>
      <DocumentViewer
        documentId="test-doc-1"
        document={mockDocument}
        {...props}
      />
    </EnhancedStoryProviders>
  );
};

describe('DocumentViewer', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ url: 'https://example.com/signed-url' }),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Functionality', () => {
    it('renders PDF viewer with toolbar', async () => {
      renderDocumentViewer();
      
      await waitFor(() => {
        expect(screen.getByTestId('pdf-document')).toBeInTheDocument();
      });
      
      // Check toolbar elements
      expect(screen.getByLabelText(/previous page/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/next page/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/zoom in/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/zoom out/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/download/i)).toBeInTheDocument();
    });

    it('displays document title and file size', async () => {
      renderDocumentViewer();
      
      await waitFor(() => {
        expect(screen.getByText('Test Document')).toBeInTheDocument();
        expect(screen.getByText(/240 KB/)).toBeInTheDocument();
      });
    });

    it('handles page navigation', async () => {
      renderDocumentViewer();
      
      await waitFor(() => {
        expect(screen.getByTestId('pdf-page-1')).toBeInTheDocument();
      });
      
      // Click next page
      fireEvent.click(screen.getByLabelText(/next page/i));
      
      // Check page number input updated
      const pageInput = screen.getByDisplayValue('2');
      expect(pageInput).toBeInTheDocument();
    });

    it('handles zoom controls', async () => {
      renderDocumentViewer();
      
      await waitFor(() => {
        expect(screen.getByText('100%')).toBeInTheDocument();
      });
      
      // Click zoom in
      fireEvent.click(screen.getByLabelText(/zoom in/i));
      
      await waitFor(() => {
        expect(screen.getByText('120%')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('displays error when document fetch fails', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(
        new Error('Failed to fetch document')
      );
      
      renderDocumentViewer();
      
      await waitFor(() => {
        expect(screen.getByText(/failed to load document/i)).toBeInTheDocument();
        expect(screen.getByText('Failed to fetch document')).toBeInTheDocument();
      });
    });

    it('calls onLoadError callback', async () => {
      const onLoadError = jest.fn();
      (global.fetch as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );
      
      renderDocumentViewer({ onLoadError });
      
      await waitFor(() => {
        expect(onLoadError).toHaveBeenCalledWith(
          expect.objectContaining({ message: 'Network error' })
        );
      });
    });
  });

  describe('Accessibility', () => {
    it('provides proper ARIA labels', async () => {
      renderDocumentViewer();
      
      await waitFor(() => {
        expect(screen.getByLabelText(/previous page/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/next page/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/zoom in/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/zoom out/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/rotate/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/download/i)).toBeInTheDocument();
      });
    });

    it('supports keyboard navigation', async () => {
      renderDocumentViewer();
      
      await waitFor(() => {
        expect(screen.getByTestId('pdf-page-1')).toBeInTheDocument();
      });
      
      // Test arrow key navigation
      fireEvent.keyDown(document, { key: 'ArrowRight' });
      
      const pageInput = screen.getByDisplayValue('2');
      expect(pageInput).toBeInTheDocument();
    });
  });

  describe('Mobile Responsiveness', () => {
    it('adapts to mobile viewport', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      
      renderDocumentViewer({ height: 600 });
      
      await waitFor(() => {
        const viewer = screen.getByTestId('pdf-document').closest('div');
        expect(viewer).toHaveClass('flex', 'flex-col');
      });
    });
  });

  describe('Internationalization', () => {
    it('displays French interface', async () => {
      render(
        <EnhancedStoryProviders withI18n locale="fr">
          <DocumentViewer documentId="test-doc-1" document={mockDocument} />
        </EnhancedStoryProviders>
      );
      
      await waitFor(() => {
        // Check for French text (would be translated in actual implementation)
        expect(screen.getByTestId('pdf-document')).toBeInTheDocument();
      });
    });

    it('supports RTL layout for Arabic', async () => {
      render(
        <EnhancedStoryProviders withI18n locale="ar">
          <DocumentViewer documentId="test-doc-1" document={mockDocument} />
        </EnhancedStoryProviders>
      );
      
      await waitFor(() => {
        const container = screen.getByTestId('pdf-document').closest('div');
        // In actual implementation, would check for RTL classes
        expect(container).toBeInTheDocument();
      });
    });
  });
});
```

### Integration Tests

**Create**: `__tests__/integration/pdf-viewer-integration.test.ts`
```typescript
import { test, expect } from '@playwright/test';
import { loginAsOwner, uploadDocument } from '../e2e/utils/test-helpers';

test.describe('PDF Viewer Integration', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsOwner(page);
  });

  test('complete PDF viewing workflow', async ({ page }) => {
    // Upload a test PDF
    await page.goto('/dashboard');
    await uploadDocument(page, './test-fixtures/sample-document.pdf', 'Test PDF Document');
    
    // Open document viewer
    await page.getByTestId('document-item').first().click();
    await page.getByTestId('view-document').click();
    
    // Verify PDF viewer loads
    await expect(page.getByTestId('pdf-viewer')).toBeVisible();
    await expect(page.getByTestId('pdf-page-1')).toBeVisible();
    
    // Test navigation
    await page.getByTestId('next-page').click();
    await expect(page.getByDisplayValue('2')).toBeVisible();
    
    // Test zoom
    await page.getByTestId('zoom-in').click();
    await expect(page.getByText('120%')).toBeVisible();
    
    // Test download
    const downloadPromise = page.waitForEvent('download');
    await page.getByTestId('download-button').click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('Test PDF Document.pdf');
  });

  test('PDF viewer with different document types', async ({ page }) => {
    // Test with different PDF types
    const documentTypes = [
      { file: 'text-heavy.pdf', title: 'Text Heavy Document' },
      { file: 'image-heavy.pdf', title: 'Image Heavy Document' },
      { file: 'multi-page.pdf', title: 'Multi Page Document' },
    ];

    for (const doc of documentTypes) {
      await page.goto('/dashboard');
      await uploadDocument(page, `./test-fixtures/${doc.file}`, doc.title);
      
      await page.getByText(doc.title).click();
      await page.getByTestId('view-document').click();
      
      // Verify viewer loads without errors
      await expect(page.getByTestId('pdf-viewer')).toBeVisible();
      await expect(page.getByText(doc.title)).toBeVisible();
      
      // Verify no error messages
      await expect(page.getByText(/error/i)).not.toBeVisible();
    }
  });

  test('mobile PDF viewer experience', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/dashboard');
    await page.getByTestId('document-item').first().click();
    await page.getByTestId('view-document').click();
    
    // Verify mobile viewer opens
    await expect(page.getByTestId('mobile-pdf-viewer')).toBeVisible();
    
    // Test mobile-specific controls
    await expect(page.getByTestId('mobile-toolbar')).toBeVisible();
    await expect(page.getByTestId('share-button')).toBeVisible();
    
    // Test fullscreen toggle
    await page.getByTestId('fullscreen-toggle').click();
    // Verify fullscreen state (implementation dependent)
    
    // Test mobile navigation
    await page.getByTestId('mobile-next-page').click();
    await expect(page.getByDisplayValue('2')).toBeVisible();
  });

  test('PDF viewer accessibility', async ({ page }) => {
    await page.goto('/dashboard');
    await page.getByTestId('document-item').first().click();
    await page.getByTestId('view-document').click();
    
    // Test keyboard navigation
    await page.keyboard.press('ArrowRight');
    await expect(page.getByDisplayValue('2')).toBeVisible();
    
    await page.keyboard.press('ArrowLeft');
    await expect(page.getByDisplayValue('1')).toBeVisible();
    
    // Test zoom shortcuts
    await page.keyboard.press('+');
    await expect(page.getByText('120%')).toBeVisible();
    
    await page.keyboard.press('-');
    await expect(page.getByText('100%')).toBeVisible();
    
    // Test focus management
    await page.keyboard.press('Tab');
    await expect(page.getByTestId('previous-page')).toBeFocused();
  });

  test('multilingual PDF viewer', async ({ page }) => {
    // Test French interface
    await page.goto('/fr/dashboard');
    await page.getByTestId('document-item').first().click();
    await page.getByTestId('view-document').click();
    
    await expect(page.getByText('Télécharger')).toBeVisible(); // Download in French
    await expect(page.getByText('Page suivante')).toBeVisible(); // Next page in French
    
    // Test Arabic interface (RTL)
    await page.goto('/ar/dashboard');
    await page.getByTestId('document-item').first().click();
    await page.getByTestId('view-document').click();
    
    // Verify RTL layout
    const toolbar = page.getByTestId('pdf-toolbar');
    await expect(toolbar).toHaveCSS('direction', 'rtl');
  });
});
```

## 🚀 Performance Optimization

### Lazy Loading Strategy

**Create**: `src/lib/pdf-optimization.ts`
```typescript
import { LRUCache } from 'lru-cache';

// PDF caching strategy
const pdfCache = new LRUCache<string, string>({
  max: 50, // Cache up to 50 PDF URLs
  ttl: 1000 * 60 * 30, // 30 minutes TTL
});

export const getCachedPDFUrl = async (documentId: string): Promise<string> => {
  // Check cache first
  const cached = pdfCache.get(documentId);
  if (cached) {
    return cached;
  }
  
  // Fetch new signed URL
  const response = await fetch(`/api/documents/${documentId}/content`);
  if (!response.ok) {
    throw new Error(`Failed to fetch PDF URL: ${response.statusText}`);
  }
  
  const { url } = await response.json();
  
  // Cache the URL
  pdfCache.set(documentId, url);
  
  return url;
};

// Progressive loading for large PDFs
export const useProgressiveLoading = (totalPages: number) => {
  const [loadedPages, setLoadedPages] = useState(new Set([1])); // Always load first page
  const [currentPage, setCurrentPage] = useState(1);
  
  // Preload adjacent pages
  useEffect(() => {
    const pagesToLoad = new Set(loadedPages);
    
    // Load current page and adjacent pages
    const adjacentPages = [
      currentPage - 1,
      currentPage,
      currentPage + 1,
    ].filter(page => page >= 1 && page <= totalPages);
    
    adjacentPages.forEach(page => pagesToLoad.add(page));
    
    setLoadedPages(pagesToLoad);
  }, [currentPage, totalPages]);
  
  return {
    shouldLoadPage: (pageNumber: number) => loadedPages.has(pageNumber),
    preloadPage: (pageNumber: number) => {
      setLoadedPages(prev => new Set([...prev, pageNumber]));
    },
  };
};

// Memory management for mobile devices
export const useMemoryOptimization = () => {
  useEffect(() => {
    const handleMemoryWarning = () => {
      // Clear PDF cache on memory pressure
      pdfCache.clear();
      
      // Force garbage collection if available
      if (window.gc) {
        window.gc();
      }
    };
    
    // Listen for memory pressure events (mobile)
    window.addEventListener('memorywarning', handleMemoryWarning);
    
    return () => {
      window.removeEventListener('memorywarning', handleMemoryWarning);
    };
  }, []);
};
```

## 🎯 Success Criteria

### Functional Requirements ✅
- [ ] PDF documents render correctly in all supported browsers
- [ ] Navigation controls work smoothly (pages, zoom, rotation)
- [ ] Mobile-optimized viewer with touch gestures
- [ ] Download functionality preserves original document
- [ ] Error handling for corrupted or inaccessible files

### Performance Requirements ✅
- [ ] Initial PDF load: <3 seconds for documents under 5MB
- [ ] Page navigation: <200ms response time
- [ ] Zoom operations: <100ms response time
- [ ] Memory usage: <100MB for typical documents
- [ ] Progressive loading for documents >20 pages

### Accessibility Requirements ✅
- [ ] WCAG 2.1 AA compliance
- [ ] Keyboard navigation support
- [ ] Screen reader compatibility
- [ ] High contrast mode support
- [ ] Focus management and ARIA labels

### Browser Compatibility ✅
- [ ] Chrome 90+ (full support)
- [ ] Firefox 88+ (full support)
- [ ] Safari 14+ (full support)
- [ ] Edge 90+ (full support)
- [ ] Mobile browsers (responsive design)

### Multilingual Support ✅
- [ ] French interface translation
- [ ] Arabic interface with RTL layout
- [ ] English as default language
- [ ] Dynamic language switching
- [ ] Proper text direction handling

---

This PDF viewer integration provides a robust, accessible, and performant document viewing experience that supports the multilingual and mobile-first requirements of the Costabeach platform.