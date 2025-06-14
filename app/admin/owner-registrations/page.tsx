// Redirect to locale-specific admin owner registrations page
import { redirect } from 'next/navigation';

export default function AdminOwnerRegistrationsPage() {
  redirect('/fr/admin/owner-registrations');
} 