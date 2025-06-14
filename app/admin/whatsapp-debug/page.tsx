// Redirect to locale-specific admin WhatsApp debug page
import { redirect } from 'next/navigation';

export default function WhatsAppDebugPage() {
  redirect('/fr/admin/whatsapp-debug');
}