import { NextRequest, NextResponse } from 'next/server';
import { translationWorker } from '@/lib/services/translationWorker';
import { TranslationQueueService } from '@/lib/services/translationQueueService';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/index';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get worker health status
    const health = await translationWorker.healthCheck();
    const stats = await TranslationQueueService.getTranslationStats();

    return NextResponse.json({
      worker: health,
      queue: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Translation worker status error:', error);
    return NextResponse.json(
      { error: 'Failed to get worker status' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication and admin permissions
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { action, jobId } = body;

    switch (action) {
      case 'start':
        await translationWorker.start();
        return NextResponse.json({ message: 'Translation worker started' });

      case 'stop':
        translationWorker.stop();
        return NextResponse.json({ message: 'Translation worker stopped' });

      case 'process':
        // Process pending jobs manually
        await TranslationQueueService.processPendingJobs(5);
        return NextResponse.json({ message: 'Processed pending translation jobs' });

      case 'process_job':
        if (!jobId) {
          return NextResponse.json({ error: 'Job ID required' }, { status: 400 });
        }
        await translationWorker.processJob(jobId);
        return NextResponse.json({ message: `Processed job ${jobId}` });

      case 'recover_stalled':
        const recovered = await translationWorker.recoverStalledJobs();
        return NextResponse.json({ message: `Recovered ${recovered} stalled jobs` });

      case 'retry_failed':
        await translationWorker.retryFailedJobs();
        return NextResponse.json({ message: 'Failed jobs queued for retry' });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Translation worker action error:', error);
    return NextResponse.json(
      { error: 'Failed to execute worker action' },
      { status: 500 }
    );
  }
}