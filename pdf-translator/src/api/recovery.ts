import { NextApiRequest, NextApiResponse } from 'next';
import { RecoveryManager } from '../utils/recovery';
import { TranslationService } from '../core/translation-service';
import { createTranslationModel } from '../providers';

const recoveryManager = new RecoveryManager('./translation_recovery');

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    // List recovery sessions
    try {
      const sessions = await recoveryManager.listRecoverySessions();
      return res.status(200).json({ sessions });
    } catch (error) {
      return res.status(500).json({
        error: 'Failed to list recovery sessions',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  if (req.method === 'POST') {
    // Resume a recovery session
    const { recoveryId, provider, apiKey, model } = req.body;

    if (!recoveryId || !provider || !apiKey) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['recoveryId', 'provider', 'apiKey'],
      });
    }

    try {
      // Load recovery state
      const state = await recoveryManager.loadState(recoveryId);
      
      if (!state) {
        return res.status(404).json({ error: 'Recovery session not found' });
      }

      // Create translation model
      const translationModel = createTranslationModel(provider, {
        apiKey,
        model,
      });

      // Create translation service
      const translationService = new TranslationService(translationModel);

      // Resume translation
      const result = await translationService.resumeTranslation(recoveryId);

      if (!result) {
        return res.status(500).json({ error: 'Failed to resume translation' });
      }

      return res.status(200).json({
        success: true,
        result,
      });
    } catch (error) {
      return res.status(500).json({
        error: 'Failed to resume translation',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  if (req.method === 'DELETE') {
    // Delete a recovery session
    const { recoveryId } = req.query;

    if (!recoveryId || typeof recoveryId !== 'string') {
      return res.status(400).json({ error: 'Recovery ID required' });
    }

    try {
      await recoveryManager.deleteRecoverySession(recoveryId);
      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({
        error: 'Failed to delete recovery session',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}