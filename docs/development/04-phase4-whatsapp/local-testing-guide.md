# WhatsApp Groups Local Testing Guide

## 🎯 Overview

This guide will help you set up and test WhatsApp Groups integration locally using `whatsapp-web.js`. No public server required!

## 📋 Prerequisites

1. **WhatsApp Account**: You need a WhatsApp account on your phone
2. **Test Groups**: Create 1-4 test groups in WhatsApp
3. **Node.js**: Make sure you have Node.js 18+ installed

## 🚀 Quick Start

### Step 1: Create Test Groups

Create these WhatsApp groups on your phone:

```
📄 Costa Beach Test - Documents
🗳️ Costa Beach Test - Polls  
🚨 Costa Beach Test - Emergency
💬 Costa Beach Test - General
```

**Important**: You'll be the only member initially. You can add 1-2 trusted people later for testing.

### Step 2: Run the Test Script

```bash
# Navigate to project directory
cd /Users/emmanuel/Documents/Dev/costabeach

# Install dependencies (if not already done)
npm install

# Start the WhatsApp test client
npm run whatsapp:test
```

### Step 3: Scan QR Code

1. The script will display a QR code in your terminal
2. Open WhatsApp on your phone
3. Go to **Settings > Linked Devices**
4. Tap **"Link a Device"**
5. Scan the QR code from your terminal

### Step 4: Observe Test Results

The script will automatically:
- ✅ Connect to WhatsApp Web
- 🔍 Discover your groups
- 📝 Show group IDs
- 🎨 Test message formatting
- 📤 Send test messages (if groups found)

## 📊 Expected Output

```bash
🔄 Initializing WhatsApp client...
📦 This may take a moment on first run

🔗 WhatsApp QR Code:
[QR CODE DISPLAY]

✅ WhatsApp client is ready!
🚀 Starting test sequence...

📋 Running WhatsApp Groups Test Suite

🔍 Discovering WhatsApp groups...
📱 Found 4 groups:
  1. Costa Beach Test - Documents
     ID: 120363025246125016@g.us
     Participants: 1

  2. Costa Beach Test - Polls
     ID: 120363025246125017@g.us
     Participants: 1

✅ Mapped "Costa Beach Test - Documents" to documents category

🎨 Testing message formatting...
📄 Document notification (French):
---
📄 *Nouveau document disponible*

*Test Document - Pool Rules*
Catégorie: general

🔗 Accéder au document: https://costabeach.com/documents/pool-rules.pdf

_Costa Beach HOA_
---

💬 Testing group messaging...
📤 Sending test message to: Costa Beach Test - Documents
✅ Test message sent successfully!
📬 Message ID: false_120363025246125016@g.us_3EB0123456789ABCDEF

✅ All tests completed!
```

## 🔧 Configuration

### Group ID Mapping

After running the test, copy the group IDs and add them to your environment:

```bash
# .env.local
WHATSAPP_DOCUMENTS_GROUP_ID="120363025246125016@g.us"
WHATSAPP_POLLS_GROUP_ID="120363025246125017@g.us"
WHATSAPP_EMERGENCY_GROUP_ID="120363025246125018@g.us"
WHATSAPP_GENERAL_GROUP_ID="120363025246125019@g.us"
```

### Database Setup

Add groups to your database:

```sql
INSERT INTO whatsapp_groups (name, whatsapp_group_id, category, language, is_active) VALUES
('Costa Beach Test - Documents', '120363025246125016@g.us', 'documents', 'french', true),
('Costa Beach Test - Polls', '120363025246125017@g.us', 'polls', 'french', true),
('Costa Beach Test - Emergency', '120363025246125018@g.us', 'emergency', 'french', true),
('Costa Beach Test - General', '120363025246125019@g.us', 'general', 'french', true);
```

## 🧪 Testing Scenarios

### Test 1: Document Notification

```typescript
// Test sending document notification
const result = await whatsappGroupsService.sendDocumentNotification({
  title: 'Monthly Meeting Minutes - November 2024',
  category: 'meeting_minutes',
  language: 'french',
  url: 'https://costabeach.com/documents/meeting-nov-2024.pdf'
});
```

### Test 2: Poll Notification

```typescript
// Test sending poll notification
const result = await whatsappGroupsService.sendPollNotification({
  question: 'Should we extend pool hours during summer?',
  endDate: '2024-07-31',
  language: 'french',
  pollUrl: 'https://costabeach.com/polls/summer-hours'
});
```

### Test 3: Emergency Alert

```typescript
// Test emergency notification
const result = await whatsappGroupsService.sendEmergencyNotification(
  'Water outage in Building A. Expected restoration: 6 PM today.',
  'french'
);
```

### Test 4: Multilingual Messages

```typescript
// Test Arabic message
const result = await whatsappGroupsService.sendDocumentNotification({
  title: 'قوانين المسبح الجديدة',
  category: 'general',
  language: 'arabic',
  url: 'https://costabeach.com/documents/pool-rules-ar.pdf'
});
```

## 🔍 Troubleshooting

### Issue: QR Code Won't Scan
**Solution**: 
- Make sure QR code is fully displayed
- Try making terminal window larger
- Ensure good lighting when scanning

### Issue: "No groups found"
**Solution**:
- Create groups on the same phone used for scanning
- Add the connected number to the groups
- Wait a few seconds and re-run the test

### Issue: "Client not ready"
**Solution**:
- Make sure QR code was scanned successfully
- Check for "WhatsApp client is ready!" message
- Restart the script if needed

### Issue: Messages not sending
**Solution**:
- Verify group IDs are correct
- Check that the connected account is in the groups
- Ensure groups allow messages from participants

## 📱 Next Steps

### Phase 1: Basic Testing (This Guide)
- ✅ Set up local client
- ✅ Test message formatting
- ✅ Validate group discovery
- ✅ Send test messages

### Phase 2: Integration Testing
- 🔄 Integrate with document upload system
- 🔄 Integrate with polls system
- 🔄 Test notification triggers
- 🔄 Add admin interface

### Phase 3: Production Ready
- 🔄 Add error handling
- 🔄 Implement retry logic
- 🔄 Add analytics
- 🔄 Deploy to production

## 🛡️ Security Notes

- **Session Data**: Stored locally in `.wwebjs_auth/`
- **Access Control**: Only the connected phone can send messages
- **Privacy**: Group members see messages from your number
- **Backup**: Session data persists between runs

## 💡 Tips

1. **Keep Terminal Open**: Don't close the terminal while testing
2. **Group Names**: Use descriptive names to identify test vs production groups
3. **Member Management**: Start with small groups, expand gradually
4. **Message Frequency**: Don't spam groups during testing
5. **Error Logging**: Check console for detailed error messages

---

Ready to test? Run `npm run whatsapp:test` and follow the steps above! 🚀