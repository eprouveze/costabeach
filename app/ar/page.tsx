import PublicLandingTemplate from '@/components/templates/PublicLandingTemplate';

// Force this page to be dynamically rendered
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function HomePage() {
  console.log('[ArabicPage] Rendering Arabic homepage');
  return <PublicLandingTemplate />;
} 