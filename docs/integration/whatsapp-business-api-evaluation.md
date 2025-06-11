# WhatsApp Business API Evaluation for Costabeach

## Objectives
- Deliver HOA updates and digests via WhatsApp
- Provide interactive Q&A access to documents
- Ensure seamless, compliant messaging to Moroccan phone numbers

## Options Overview
| Provider                     | API Type         | Fee Structure          | Key Features                                  |
|------------------------------|------------------|------------------------|-----------------------------------------------|
| **WhatsApp Cloud API (Meta)**| Cloud-hosted API | Pay-per-message (free tier + volume pricing) | Direct from Meta; template messages; quick setup; global infrastructure |
| **Twilio WhatsApp API**      | WhatsApp Business API via Twilio | Per message + monthly number fee | Simplified API; unified Twilio ecosystem; good docs; callback webhooks |
| **MessageBird**              | WhatsApp Business | Tiered pricing; monthly credits | Similar to Twilio; localized support; dashboard |
| **Vonage**                   | WhatsApp Business | Message-based billing  | Part of Vonage Communications API; global reach |

## Key Considerations
1. **Phone Number Registration**: Must register a dedicated phone number in Facebook Business Manager. Requires business verification and approval of display name.
2. **Message Templates**: Any proactive template (e.g., weekly digest) must be pre-approved by WhatsApp. Updates required if template changes.
3. **Opt-In Requirements**: Users must explicitly opt in to receive messages (via web form or WhatsApp reply). Maintain consent records.
4. **Webhook Setup**: Inbound messages (for Q&A) delivered via webhooks. Need a public HTTPS endpoint (use a serverless function or Next.js API route).
5. **Localization**: Templates and interactive messages must be available in FR & AR. Define templates with placeholders to inject text dynamically.
6. **Compliance & Rate Limits**: Adhere to WhatsApp’s messaging policies; avoid high-frequency spam; monitor delivery rates.

## Setup Steps (WhatsApp Cloud API)
1. **Business Manager Setup**: Create Facebook Business Manager account; verify business.
2. **Phone Number & Display Name**: Register phone number; submit display name request.
3. **Get Access Token**: Obtain permanent API token from Business Manager settings.
4. **Webhook Configuration**: In Business Manager, configure webhook URL & verify token (point to `/api/whatsapp/webhook`).
5. **Template Approval**: Create message templates for digests (e.g., `weekly_digest_fr`, `weekly_digest_ar`) in Business Manager UI; wait for approval.
6. **Test Messages**: Use API to send test template messages to a sandbox number; verify delivery.
7. **Deploy & Monitor**: Deploy integration code (with token env var); monitor logs and delivery receipts via callback.

## Recommended Approach
- **Use Meta’s WhatsApp Cloud API** for direct integration (no intermediary) and lower per-message costs. The Cloud API supports multi-language templates out of the box.
- **Host webhook** in a Next.js API route secured by a validation token.
- **Manage templates** actively: store template definitions in code for version control and update via Business Manager when needed.
- **Implement consent flow** in the portal settings page; record opt-in in `users.whatsapp_opt_in`.

## Next Steps
1. Register business and phone in Facebook Business Manager.
2. Define initial templates (digest, Q&A response confirmation) in FR & AR.
3. Build Next.js API routes for sending and receiving messages.
4. Integrate with scheduled job (e.g., GitHub Actions cron or Supabase scheduled function) for digests.
5. Test end-to-end with real owner numbers.