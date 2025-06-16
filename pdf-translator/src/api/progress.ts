import { NextApiRequest, NextApiResponse } from 'next';

// In-memory storage for progress tracking
// In production, use Redis or similar
const progressStore = new Map<string, any>();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    const { sessionId } = req.query;
    
    if (!sessionId || typeof sessionId !== 'string') {
      return res.status(400).json({ error: 'Session ID required' });
    }

    const progress = progressStore.get(sessionId);
    
    if (!progress) {
      return res.status(404).json({ error: 'Session not found' });
    }

    return res.status(200).json(progress);
  }

  if (req.method === 'POST') {
    const { sessionId, progress } = req.body;
    
    if (!sessionId || !progress) {
      return res.status(400).json({ error: 'Session ID and progress required' });
    }

    progressStore.set(sessionId, {
      ...progress,
      timestamp: Date.now(),
    });

    // Clean up old sessions (older than 1 hour)
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    for (const [id, data] of progressStore.entries()) {
      if (data.timestamp < oneHourAgo) {
        progressStore.delete(id);
      }
    }

    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

// Export for use in other API routes
export function updateProgress(sessionId: string, progress: any) {
  progressStore.set(sessionId, {
    ...progress,
    timestamp: Date.now(),
  });
}

export function getProgress(sessionId: string) {
  return progressStore.get(sessionId);
}