// Redirect to locale-specific admin emergency alerts page
import { redirect } from 'next/navigation';

export default function AdminEmergencyAlertsPage() {
  redirect('/fr/admin/emergency-alerts');
}