// Redirect to locale-specific admin documents page
import { redirect } from 'next/navigation';

export default function AdminDocumentsPage() {
  redirect('/fr/admin/documents');
} 