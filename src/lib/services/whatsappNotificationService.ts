import { getWhatsAppClient } from "../whatsapp/client";
import { DocumentCategory, Language } from "@/lib/types";

interface DocumentNotificationData {
  title: string;
  category: DocumentCategory;
  language: Language;
  uploadedBy: string;
  fileSize: number;
  documentUrl?: string;
}

interface PollNotificationData {
  title: string;
  description: string;
  createdBy: string;
  endDate?: Date;
  pollUrl?: string;
}

interface EmergencyAlertData {
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  alertType: 'maintenance' | 'security' | 'weather' | 'utilities' | 'other';
}

class WhatsAppNotificationService {
  private whatsappClient = getWhatsAppClient();

  // Get the list of resident phone numbers
  // This would typically come from a database query
  private async getResidentPhoneNumbers(): Promise<string[]> {
    // TODO: Replace with actual database query
    // For now, return test numbers
    return [
      '+15551234567', // US test number
      '+818041122101' // JP test number
    ];
  }

  // Filter phone numbers based on user preferences
  private async filterPhoneNumbersByPreferences(
    phoneNumbers: string[],
    notificationType: 'documents' | 'polls' | 'emergency' | 'community'
  ): Promise<string[]> {
    // TODO: Implement user preference filtering
    // For now, return all numbers (assuming users want notifications)
    return phoneNumbers;
  }

  // Send document upload notification
  async sendDocumentNotification(data: DocumentNotificationData): Promise<boolean> {
    try {
      console.log('📄 Sending document notification via WhatsApp...');
      
      const phoneNumbers = await this.getResidentPhoneNumbers();
      const filteredNumbers = await this.filterPhoneNumbersByPreferences(phoneNumbers, 'documents');
      
      if (filteredNumbers.length === 0) {
        console.log('No phone numbers configured for document notifications');
        return true;
      }

      const categoryName = this.getCategoryDisplayName(data.category);
      const fileSize = this.formatFileSize(data.fileSize);
      
      const message = `🏖️ *Costa Beach Community*

📄 *New Document Available*

📋 **Title:** ${data.title}
📂 **Category:** ${categoryName}
🌐 **Language:** ${data.language}
👤 **Uploaded by:** ${data.uploadedBy}
📊 **Size:** ${fileSize}

${data.documentUrl ? `🔗 **View Document:** ${data.documentUrl}` : ''}

Visit the Costa Beach portal to access all community documents.

_Sent automatically by Costa Beach Community Platform_`;

      const results = await this.whatsappClient.broadcastToNumbers(filteredNumbers, message);
      
      const successCount = results.filter(r => !r.includes('FAILED')).length;
      const failedCount = results.length - successCount;
      
      console.log(`📄 Document notification sent: ${successCount} successful, ${failedCount} failed`);
      
      return successCount > 0;
    } catch (error) {
      console.error('Failed to send document notification:', error);
      return false;
    }
  }

  // Send poll creation notification
  async sendPollNotification(data: PollNotificationData): Promise<boolean> {
    try {
      console.log('🗳️ Sending poll notification via WhatsApp...');
      
      const phoneNumbers = await this.getResidentPhoneNumbers();
      const filteredNumbers = await this.filterPhoneNumbersByPreferences(phoneNumbers, 'polls');
      
      if (filteredNumbers.length === 0) {
        console.log('No phone numbers configured for poll notifications');
        return true;
      }

      const endDateText = data.endDate ? 
        `\n⏰ **Voting ends:** ${data.endDate.toLocaleDateString()}` : '';
      
      const message = `🏖️ *Costa Beach Community*

🗳️ *New Community Poll*

📋 **Title:** ${data.title}
📝 **Description:** ${data.description}
👤 **Created by:** ${data.createdBy}${endDateText}

${data.pollUrl ? `🔗 **Vote Now:** ${data.pollUrl}` : ''}

Your voice matters! Please participate in this community poll.

_Sent automatically by Costa Beach Community Platform_`;

      const results = await this.whatsappClient.broadcastToNumbers(filteredNumbers, message);
      
      const successCount = results.filter(r => !r.includes('FAILED')).length;
      const failedCount = results.length - successCount;
      
      console.log(`🗳️ Poll notification sent: ${successCount} successful, ${failedCount} failed`);
      
      return successCount > 0;
    } catch (error) {
      console.error('Failed to send poll notification:', error);
      return false;
    }
  }

  // Send emergency alert
  async sendEmergencyAlert(data: EmergencyAlertData): Promise<boolean> {
    try {
      console.log('🚨 Sending emergency alert via WhatsApp...');
      
      const phoneNumbers = await this.getResidentPhoneNumbers();
      const filteredNumbers = await this.filterPhoneNumbersByPreferences(phoneNumbers, 'emergency');
      
      if (filteredNumbers.length === 0) {
        console.log('No phone numbers configured for emergency alerts');
        return false; // Emergency alerts should reach someone
      }

      const severityEmoji = this.getSeverityEmoji(data.severity);
      const typeEmoji = this.getAlertTypeEmoji(data.alertType);
      
      const message = `🏖️ *Costa Beach Community*

${severityEmoji} *${data.severity.toUpperCase()} ALERT* ${severityEmoji}

${typeEmoji} **${data.title}**

📢 ${data.message}

⚠️ Please take appropriate action and stay safe.

For immediate assistance, contact building management.

_Emergency alert sent by Costa Beach Community Platform_`;

      const results = await this.whatsappClient.broadcastToNumbers(filteredNumbers, message);
      
      const successCount = results.filter(r => !r.includes('FAILED')).length;
      const failedCount = results.length - successCount;
      
      console.log(`🚨 Emergency alert sent: ${successCount} successful, ${failedCount} failed`);
      
      return successCount > 0;
    } catch (error) {
      console.error('Failed to send emergency alert:', error);
      return false;
    }
  }

  // Send community update
  async sendCommunityUpdate(title: string, message: string): Promise<boolean> {
    try {
      console.log('📢 Sending community update via WhatsApp...');
      
      const phoneNumbers = await this.getResidentPhoneNumbers();
      const filteredNumbers = await this.filterPhoneNumbersByPreferences(phoneNumbers, 'community');
      
      if (filteredNumbers.length === 0) {
        console.log('No phone numbers configured for community updates');
        return true;
      }

      const formattedMessage = `🏖️ *Costa Beach Community*

📢 *Community Update*

**${title}**

${message}

_Sent by Costa Beach Community Platform_`;

      const results = await this.whatsappClient.broadcastToNumbers(filteredNumbers, formattedMessage);
      
      const successCount = results.filter(r => !r.includes('FAILED')).length;
      const failedCount = results.length - successCount;
      
      console.log(`📢 Community update sent: ${successCount} successful, ${failedCount} failed`);
      
      return successCount > 0;
    } catch (error) {
      console.error('Failed to send community update:', error);
      return false;
    }
  }

  // Helper methods
  private getCategoryDisplayName(category: DocumentCategory): string {
    switch (category) {
      case DocumentCategory.COMITE_DE_SUIVI:
        return 'Comité de Suivi';
      case DocumentCategory.SOCIETE_DE_GESTION:
        return 'Société de Gestion';
      case DocumentCategory.LEGAL:
        return 'Legal Documents';
      default:
        return category;
    }
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  private getSeverityEmoji(severity: EmergencyAlertData['severity']): string {
    switch (severity) {
      case 'low': return '💡';
      case 'medium': return '⚠️';
      case 'high': return '🚨';
      case 'critical': return '🔴';
    }
  }

  private getAlertTypeEmoji(alertType: EmergencyAlertData['alertType']): string {
    switch (alertType) {
      case 'maintenance': return '🔧';
      case 'security': return '🔒';
      case 'weather': return '🌩️';
      case 'utilities': return '⚡';
      case 'other': return '📢';
    }
  }

  // Test connection and send a test message
  async sendTestMessage(phoneNumber: string, messageType: 'document' | 'poll' | 'emergency' | 'community' = 'community'): Promise<boolean> {
    try {
      let message: string;
      
      switch (messageType) {
        case 'document':
          message = `🏖️ *Costa Beach Community*

📄 *Test Document Notification*

This is a test of the document notification system. 

✅ WhatsApp integration is working correctly!

_Test message from Costa Beach Community Platform_`;
          break;
          
        case 'poll':
          message = `🏖️ *Costa Beach Community*

🗳️ *Test Poll Notification*

This is a test of the poll notification system.

✅ WhatsApp integration is working correctly!

_Test message from Costa Beach Community Platform_`;
          break;
          
        case 'emergency':
          message = `🏖️ *Costa Beach Community*

🚨 *TEST ALERT* 🚨

This is a test of the emergency alert system.

✅ WhatsApp integration is working correctly!

_Test alert from Costa Beach Community Platform_`;
          break;
          
        default:
          message = `🏖️ *Costa Beach Community*

📢 *Test Message*

Hello! This is a test message from the Costa Beach Community Platform.

✅ WhatsApp integration is working correctly!

Time: ${new Date().toLocaleString()}

_Test message from Costa Beach Community Platform_`;
      }

      const messageId = await this.whatsappClient.sendTextMessage(phoneNumber, message);
      console.log(`✅ Test message sent successfully. Message ID: ${messageId}`);
      return true;
    } catch (error) {
      console.error('Failed to send test message:', error);
      return false;
    }
  }
}

// Export singleton instance
export const whatsappNotificationService = new WhatsAppNotificationService();