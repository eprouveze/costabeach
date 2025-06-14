// Redirect to locale-specific admin settings page
import { redirect } from 'next/navigation';

export default function AdminSettingsPage() {
  redirect('/fr/admin/settings');
}