// Redirect to locale-specific admin users page
import { redirect } from 'next/navigation';

export default function AdminUsersPage() {
  redirect('/fr/admin/users');
}