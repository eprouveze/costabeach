// Redirect to locale-specific admin WhatsApp page
import { redirect } from 'next/navigation';

export default function AdminWhatsAppPage() {
  redirect('/fr/admin/whatsapp');
}