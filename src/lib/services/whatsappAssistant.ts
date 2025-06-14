import { getWhatsAppClient } from '../whatsapp/client';
import { db } from '@/lib/db';
import { aiClient } from '@/lib/aiClient';

interface IncomingMessage {
  from: string;
  messageId: string;
  text: string;
  timestamp: Date;
}

interface QAKnowledgeBase {
  question: string;
  answer: string;
  keywords: string[];
  category: 'general' | 'documents' | 'polls' | 'maintenance' | 'emergency' | 'contact';
  language: 'en' | 'fr' | 'ar';
}

class WhatsAppAssistant {
  private whatsappClient = getWhatsAppClient();
  
  // Knowledge base for common questions
  private knowledgeBase: QAKnowledgeBase[] = [
    // General Questions
    {
      question: "What is Costa Beach?",
      answer: "🏖️ Costa Beach is a premium residential community offering modern living with excellent amenities and professional management services.",
      keywords: ["costa beach", "what is", "about", "community"],
      category: "general",
      language: "en"
    },
    {
      question: "How can I contact building management?",
      answer: "📞 You can contact building management:\n• Through this WhatsApp assistant\n• Visit the management office during business hours\n• Submit requests through the Costa Beach app\n• Email: management@costabeach.com",
      keywords: ["contact", "management", "office", "help", "support"],
      category: "contact",
      language: "en"
    },
    
    // Documents
    {
      question: "How do I access community documents?",
      answer: "📄 To access community documents:\n1. Log into the Costa Beach portal\n2. Go to the Documents section\n3. Browse by category: Comité de Suivi, Société de Gestion, or Legal\n4. You'll receive WhatsApp notifications when new documents are uploaded",
      keywords: ["documents", "access", "portal", "papers", "files"],
      category: "documents",
      language: "en"
    },
    {
      question: "What types of documents are available?",
      answer: "📋 Available document categories:\n• **Comité de Suivi**: Community committee documents\n• **Société de Gestion**: Management company documents\n• **Legal**: Legal documents and regulations\n\nDocuments are available in French, English, and Arabic.",
      keywords: ["document types", "categories", "comité", "société", "legal"],
      category: "documents",
      language: "en"
    },
    
    // Polls and Voting
    {
      question: "How do I participate in community polls?",
      answer: "🗳️ To participate in polls:\n1. Check for poll notifications on WhatsApp\n2. Visit the Costa Beach portal\n3. Go to the Polls section\n4. Vote on active polls\n5. View results after voting closes\n\nYour participation helps shape our community decisions!",
      keywords: ["polls", "voting", "vote", "participate", "survey"],
      category: "polls",
      language: "en"
    },
    
    // Maintenance
    {
      question: "How do I report a maintenance issue?",
      answer: "🔧 To report maintenance issues:\n1. Contact building management immediately for urgent issues\n2. Submit non-urgent requests through the portal\n3. Provide detailed description and location\n4. Include photos if helpful\n\nFor emergencies, call the emergency hotline immediately!",
      keywords: ["maintenance", "repair", "broken", "fix", "issue", "problem"],
      category: "maintenance",
      language: "en"
    },
    {
      question: "What are the building hours?",
      answer: "🕐 Building Hours:\n• **Management Office**: Monday-Friday 9:00 AM - 6:00 PM\n• **Building Access**: 24/7 with key card\n• **Emergency Contact**: Available 24/7\n• **Maintenance**: Monday-Saturday 8:00 AM - 5:00 PM",
      keywords: ["hours", "time", "open", "office", "when"],
      category: "general",
      language: "en"
    },
    
    // French translations
    {
      question: "Comment puis-je contacter la gestion de l'immeuble?",
      answer: "📞 Vous pouvez contacter la gestion de l'immeuble:\n• Via cet assistant WhatsApp\n• Visitez le bureau de gestion pendant les heures d'ouverture\n• Soumettez des demandes via l'application Costa Beach\n• Email: management@costabeach.com",
      keywords: ["contact", "gestion", "bureau", "aide", "support"],
      category: "contact",
      language: "fr"
    },
    {
      question: "Comment accéder aux documents communautaires?",
      answer: "📄 Pour accéder aux documents communautaires:\n1. Connectez-vous au portail Costa Beach\n2. Allez à la section Documents\n3. Parcourez par catégorie: Comité de Suivi, Société de Gestion, ou Légal\n4. Vous recevrez des notifications WhatsApp lors de nouveaux téléchargements",
      keywords: ["documents", "accès", "portail", "papiers", "fichiers"],
      category: "documents",
      language: "fr"
    },
    
    // Emergency
    {
      question: "What should I do in an emergency?",
      answer: "🚨 **EMERGENCY PROCEDURES**:\n\n**Fire**: Pull alarm, evacuate immediately, call 911\n**Medical**: Call 911, notify management\n**Security**: Call 911, contact building security\n**Utilities**: Contact management immediately\n\n**Emergency Contacts**:\n• 911 (Police/Fire/Medical)\n• Building Management: [EMERGENCY NUMBER]\n• Security: [SECURITY NUMBER]",
      keywords: ["emergency", "fire", "medical", "security", "help", "urgent", "911"],
      category: "emergency",
      language: "en"
    }
  ];

  // Handle incoming message and provide AI-powered response
  async handleIncomingMessage(message: IncomingMessage): Promise<void> {
    try {
      console.log(`🤖 Processing message from ${message.from}: "${message.text}"`);
      
      // First, try to find a direct match in knowledge base
      const knowledgeResponse = this.searchKnowledgeBase(message.text);
      
      if (knowledgeResponse) {
        console.log('📚 Found knowledge base response');
        await this.sendResponse(message.from, knowledgeResponse);
        return;
      }
      
      // If no direct match, use AI to generate response
      const aiResponse = await this.generateAIResponse(message.text);
      await this.sendResponse(message.from, aiResponse);
      
    } catch (error) {
      console.error('Error handling incoming message:', error);
      await this.sendErrorResponse(message.from);
    }
  }

  // Search knowledge base for matching responses
  private searchKnowledgeBase(query: string): string | null {
    const normalizedQuery = query.toLowerCase().trim();
    
    // Find best matching entry
    let bestMatch: QAKnowledgeBase | null = null;
    let maxScore = 0;
    
    for (const entry of this.knowledgeBase) {
      let score = 0;
      
      // Check for keyword matches
      for (const keyword of entry.keywords) {
        if (normalizedQuery.includes(keyword.toLowerCase())) {
          score += keyword.length; // Longer keywords get higher scores
        }
      }
      
      // Check for question similarity
      if (normalizedQuery.includes(entry.question.toLowerCase().slice(0, 10))) {
        score += 10;
      }
      
      if (score > maxScore && score > 3) { // Minimum threshold
        maxScore = score;
        bestMatch = entry;
      }
    }
    
    return bestMatch ? bestMatch.answer : null;
  }

  // Generate AI response for complex queries
  private async generateAIResponse(query: string): Promise<string> {
    try {
      const systemPrompt = `You are a helpful WhatsApp assistant for Costa Beach, a premium residential community. 

CONTEXT:
- Costa Beach is a modern residential community with professional management
- Residents can access documents, participate in polls, and get support through the platform
- You should be helpful, professional, and concise
- Always include the Costa Beach emoji 🏖️ in your responses
- Keep responses under 200 words for WhatsApp
- Use bullet points and clear formatting when helpful

AVAILABLE SERVICES:
- Document access (Comité de Suivi, Société de Gestion, Legal documents)
- Community polls and voting
- Maintenance requests
- Emergency assistance
- General community information

LANGUAGES: Respond in the same language as the query (English, French, or Arabic)

If you don't know something specific about Costa Beach, direct them to contact management.

Query: ${query}`;

      const response = await aiClient.generateChatCompletion([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query }
      ], 'GPT_4O_MINI', {
        max_tokens: 150,
        temperature: 0.7
      });

      return response || this.getDefaultResponse();
    } catch (error) {
      console.error('AI response generation failed:', error);
      return this.getDefaultResponse();
    }
  }

  // Send response via WhatsApp
  private async sendResponse(phoneNumber: string, message: string): Promise<void> {
    try {
      const fullResponse = `🏖️ *Costa Beach Community*\n\n${message}\n\n_Need more help? Contact management or visit the Costa Beach portal._`;
      
      await this.whatsappClient.sendTextMessage(phoneNumber, fullResponse);
      console.log(`✅ Response sent to ${phoneNumber}`);
    } catch (error) {
      console.error('Failed to send response:', error);
      throw error;
    }
  }

  // Send error response
  async sendErrorResponse(phoneNumber: string): Promise<void> {
    const errorMessage = `🏖️ *Costa Beach Community*

I'm sorry, I encountered an error while processing your message. 

Please try again or contact building management directly for immediate assistance.

📞 **Emergency**: 911
📧 **Management**: management@costabeach.com`;

    try {
      await this.whatsappClient.sendTextMessage(phoneNumber, errorMessage);
    } catch (error) {
      console.error('Failed to send error response:', error);
    }
  }

  // Default response when AI fails
  private getDefaultResponse(): string {
    return `I'm here to help with information about Costa Beach community services, documents, polls, and general questions.

🔧 **Services Available:**
• Community documents access
• Poll participation
• Maintenance requests
• General community information

💬 **Try asking:**
• "How do I access documents?"
• "How do I vote in polls?"
• "How do I report maintenance issues?"
• "What are the building hours?"

For specific questions or immediate assistance, please contact building management.`;
  }

  // Add new knowledge to the knowledge base (for future learning)
  async addKnowledge(question: string, answer: string, keywords: string[], category: QAKnowledgeBase['category']): Promise<void> {
    // In a real implementation, this would save to a database
    this.knowledgeBase.push({
      question,
      answer,
      keywords,
      category,
      language: 'en' // Could be detected automatically
    });
    
    console.log(`Added new knowledge: ${question}`);
  }

  // Get conversation history for a phone number
  async getConversationHistory(phoneNumber: string, limit: number = 10): Promise<any[]> {
    try {
      // This would typically query a database
      // For now, return empty array
      return [];
    } catch (error) {
      console.error('Failed to get conversation history:', error);
      return [];
    }
  }

  // Send proactive community updates
  async sendCommunityUpdate(message: string, phoneNumbers?: string[]): Promise<void> {
    try {
      const targets = phoneNumbers || await this.getAllActiveContacts();
      
      const fullMessage = `🏖️ *Costa Beach Community Update*\n\n${message}\n\n_This is an automated message from Costa Beach Community Platform._`;
      
      for (const phoneNumber of targets) {
        try {
          await this.whatsappClient.sendTextMessage(phoneNumber, fullMessage);
          await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limiting
        } catch (error) {
          console.error(`Failed to send update to ${phoneNumber}:`, error);
        }
      }
    } catch (error) {
      console.error('Failed to send community update:', error);
    }
  }

  // Get all active WhatsApp contacts
  private async getAllActiveContacts(): Promise<string[]> {
    // This would query the database for active WhatsApp contacts
    // For now, return test numbers
    return ['+15551234567', '+818041122101'];
  }

  // Send welcome message to new users
  async sendWelcomeMessage(phoneNumber: string, userName?: string): Promise<void> {
    const name = userName ? ` ${userName}` : '';
    const welcomeMessage = `🏖️ *Welcome to Costa Beach Community${name}!*

I'm your WhatsApp assistant, here to help with:

📄 **Documents**: Access community documents and get notifications
🗳️ **Polls**: Participate in community voting
🔧 **Maintenance**: Report issues and get updates
ℹ️ **Information**: General community information

💬 **Try saying:**
• "Show me recent documents"
• "Are there any active polls?"
• "Building hours"
• "Help"

For emergencies, always call 911 first, then notify building management.

How can I help you today?`;

    await this.sendResponse(phoneNumber, welcomeMessage);
  }
}

// Export singleton instance
export const whatsappAssistant = new WhatsAppAssistant();