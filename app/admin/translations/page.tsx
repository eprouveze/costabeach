// Redirect to locale-specific admin translations page
import { redirect } from 'next/navigation';

export default function AdminTranslationsPage() {
  redirect('/fr/admin/translations');
}