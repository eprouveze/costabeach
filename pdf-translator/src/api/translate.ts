import { NextApiRequest, NextApiResponse } from 'next';
import { TranslationService } from '../core/translation-service';
import { createTranslationModel } from '../providers';
import { PDFAdapter } from '../adapters/pdf';
import {
  TranslationProvider,
  TranslationRequest,
  TranslationProviderConfig,
} from '../types';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb', // Allow large PDF files
    },
  },
};

interface TranslateRequest {
  file: string; // Base64 encoded PDF
  filename: string;
  sourceLang: string;
  targetLang: string;
  provider: TranslationProvider;
  apiKey: string;
  model?: string;
  quality?: 'draft' | 'standard' | 'professional';
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      file,
      filename,
      sourceLang,
      targetLang,
      provider,
      apiKey,
      model,
      quality = 'standard',
    } = req.body as TranslateRequest;

    // Validate required fields
    if (!file || !sourceLang || !targetLang || !provider || !apiKey) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['file', 'sourceLang', 'targetLang', 'provider', 'apiKey'],
      });
    }

    // Decode PDF from base64
    const pdfBuffer = Buffer.from(file, 'base64');

    // Initialize PDF adapter
    const pdfAdapter = new PDFAdapter();

    // Validate PDF
    const isValid = await pdfAdapter.validate(pdfBuffer);
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid PDF file' });
    }

    // Extract text from PDF
    const elements = await pdfAdapter.extractText(pdfBuffer);

    if (Object.keys(elements).length === 0) {
      return res.status(400).json({ error: 'No text found in PDF' });
    }

    // Create translation model
    const config: TranslationProviderConfig = {
      apiKey,
      model,
    };
    const translationModel = createTranslationModel(provider, config);

    // Create translation service
    const translationService = new TranslationService(translationModel);

    // Create translation request
    const translationRequest: TranslationRequest = {
      elements,
      sourceLang,
      targetLang,
      provider,
      options: {
        quality,
        preserveFormatting: true,
        batchSize: 10,
        onProgress: (progress) => {
          // In a real implementation, you might send SSE updates here
          console.log(`Translation progress: ${progress.percentage.toFixed(1)}%`);
        },
      },
    };

    // Perform translation
    const result = await translationService.translate(translationRequest);

    // Apply translations back to PDF
    const translatedPdfBuffer = await pdfAdapter.applyTranslations(
      pdfBuffer,
      result.translatedElements
    );

    // Return translated PDF
    res.status(200).json({
      success: true,
      file: translatedPdfBuffer.toString('base64'),
      filename: filename.replace('.pdf', `_${targetLang}.pdf`),
      metadata: result.metadata,
    });
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({
      error: 'Translation failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}