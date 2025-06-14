import { uploadFile } from '@/lib/storage';
import { Language } from '@/lib/types';
// pdf-parse is quite heavy and tries to access test fixtures on import, which
// causes issues during Next.js static analysis.  We therefore import it
// lazily *inside* the function so it's only evaluated at runtime on the
// server, never during the build step.
import { PDFDocument, StandardFonts } from 'pdf-lib';

// Remote TTF font that supports a wide range of Unicode characters including Arabic.
const UNICODE_FONT_URL =
  'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-arabic@5.0.13/files/noto-sans-arabic-all-400-normal.ttf';

async function embedUnicodeFont(pdfDoc: PDFDocument) {
  const res = await fetch(UNICODE_FONT_URL);
  if (!res.ok) {
    throw new Error(`Failed to download fallback font: ${res.status}`);
  }
  const fontBytes = new Uint8Array(await res.arrayBuffer());
  return pdfDoc.embedFont(fontBytes, { subset: true });
}

/**
 * Extract raw text from a PDF file buffer. Returns one string containing the whole
 * document.  We intentionally keep formatting minimal – page breaks are marked
 * with "\n\n" so later code can split / join on them.
 */
export async function extractPdfText(buffer: Buffer): Promise<string> {
  const { default: parsePdf } = await import('pdf-parse');
  const data = await parsePdf(buffer as any);
  return data.text || '';
}

/**
 * Very small helper that writes translated text back to a PDF.  Each page of
 * `pages` becomes one page in the PDF.  We assume the text is already wrapped
 * reasonably (pdf-lib does not handle auto-wrap).  The function returns a
 * Uint8Array ready for upload.
 */
export async function generatePdfFromPages(pages: string[]): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const latinFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  let unicodeFont: any = null;

  for (const pageText of pages) {
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const fontSize = 12;
    const lineHeight = fontSize + 4;

    const lines = pageText.split(/\n+/);
    let y = height - 40;
    for (const line of lines) {
      if (y < 40) {
        // Start a new page when we've run out of space
        const newPage = pdfDoc.addPage();
        y = height - 40;
        newPage.setFont(latinFont);
        newPage.setFontSize(fontSize);
        newPage.drawText(line, { x: 40, y });
      } else {
        const needsUnicode = /[^\u0000-\u00ff]/.test(line);
        if (needsUnicode) {
          // Lazy-load the unicode font only once when needed
          if (!unicodeFont) {
            unicodeFont = await embedUnicodeFont(pdfDoc);
          }
          page.drawText(line, { x: 40, y, size: fontSize, font: unicodeFont });
        } else {
          page.drawText(line, { x: 40, y, size: fontSize, font: latinFont });
        }
      }
      y -= lineHeight;
    }
  }

  return pdfDoc.save();
}

/**
 * Upload bytes to S3 under a generated key and return the file path.
 */
export async function uploadTranslatedPdf(
  bytes: Uint8Array,
  originalFilePath: string,
  targetLanguage: Language,
): Promise<string> {
  const keyWithoutExtension = originalFilePath.replace(/\.pdf$/i, '');
  const timestamp = Date.now();
  const newKey = `${keyWithoutExtension}.${targetLanguage}.${timestamp}.pdf`;
  await uploadFile(newKey, Buffer.from(bytes));
  return newKey;
} 