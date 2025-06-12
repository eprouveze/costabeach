import { whatsappClient } from './client';

export const messageTemplates = {
  // Verification code template
  verification_code: {
    name: 'verification_code',
    getMessage: (code: string, language: string = 'en') => {
      const messages = {
        en: `Your Costabeach verification code is: ${code}. This code will expire in 10 minutes.`,
        fr: `Votre code de vérification Costabeach est: ${code}. Ce code expire dans 10 minutes.`,
        ar: `رمز التحقق الخاص بك في كوستا بيتش هو: ${code}. ينتهي صلاحية هذا الرمز خلال 10 دقائق.`,
      };
      return messages[language as keyof typeof messages] || messages.en;
    },
  },

  // Weekly digest template
  weekly_digest: {
    name: 'weekly_digest',
    getMessage: (data: {
      newDocuments: number;
      newPolls: number;
      weekRange: string;
    }, language: string = 'en') => {
      const messages = {
        en: `📋 Weekly Costabeach Update (${data.weekRange})\n\n📄 ${data.newDocuments} new documents\n🗳️ ${data.newPolls} new polls\n\nView details: {{dashboard_link}}`,
        fr: `📋 Mise à jour hebdomadaire Costabeach (${data.weekRange})\n\n📄 ${data.newDocuments} nouveaux documents\n🗳️ ${data.newPolls} nouveaux sondages\n\nVoir les détails: {{dashboard_link}}`,
        ar: `📋 تحديث كوستا بيتش الأسبوعي (${data.weekRange})\n\n📄 ${data.newDocuments} وثائق جديدة\n🗳️ ${data.newPolls} استطلاعات جديدة\n\nعرض التفاصيل: {{dashboard_link}}`,
      };
      return messages[language as keyof typeof messages] || messages.en;
    },
  },

  // Document notification template
  document_notification: {
    name: 'document_notification',
    getMessage: (data: {
      documentTitle: string;
      category: string;
    }, language: string = 'en') => {
      const messages = {
        en: `📄 New document available: "${data.documentTitle}"\nCategory: ${data.category}\n\nView document: {{document_link}}`,
        fr: `📄 Nouveau document disponible: "${data.documentTitle}"\nCatégorie: ${data.category}\n\nVoir le document: {{document_link}}`,
        ar: `📄 وثيقة جديدة متاحة: "${data.documentTitle}"\nالفئة: ${data.category}\n\nعرض الوثيقة: {{document_link}}`,
      };
      return messages[language as keyof typeof messages] || messages.en;
    },
  },

  // Poll notification template
  poll_notification: {
    name: 'poll_notification',
    getMessage: (data: {
      question: string;
      endDate?: string;
    }, language: string = 'en') => {
      const endDateText = data.endDate 
        ? (language === 'ar' ? `ينتهي في: ${data.endDate}` : 
           language === 'fr' ? `Se termine le: ${data.endDate}` : 
           `Ends: ${data.endDate}`)
        : '';
      
      const messages = {
        en: `🗳️ New poll: "${data.question}"\n${endDateText}\n\nVote now: {{poll_link}}`,
        fr: `🗳️ Nouveau sondage: "${data.question}"\n${endDateText}\n\nVotez maintenant: {{poll_link}}`,
        ar: `🗳️ استطلاع جديد: "${data.question}"\n${endDateText}\n\nصوت الآن: {{poll_link}}`,
      };
      return messages[language as keyof typeof messages] || messages.en;
    },
  },

  // Q&A assistant welcome
  qa_welcome: {
    name: 'qa_welcome',
    getMessage: (language: string = 'en') => {
      const messages = {
        en: `🤖 Welcome to Costabeach Assistant!\n\nI can help you find information about:\n• HOA documents\n• Building regulations\n• Community announcements\n• Meeting minutes\n\nJust ask me any question!`,
        fr: `🤖 Bienvenue dans l'Assistant Costabeach!\n\nJe peux vous aider à trouver des informations sur:\n• Documents de copropriété\n• Règlements du bâtiment\n• Annonces communautaires\n• Procès-verbaux de réunions\n\nPosez-moi simplement une question!`,
        ar: `🤖 مرحباً بك في مساعد كوستا بيتش!\n\nيمكنني مساعدتك في العثور على معلومات حول:\n• وثائق اتحاد الملاك\n• لوائح البناء\n• إعلانات المجتمع\n• محاضر الاجتماعات\n\nفقط اسألني أي سؤال!`,
      };
      return messages[language as keyof typeof messages] || messages.en;
    },
  },
};

// Template management functions
export async function ensureTemplatesExist() {
  try {
    const existingTemplates = await whatsappClient.getMessageTemplates();
    const existingNames = existingTemplates.map(t => t.name);
    
    for (const [templateKey, template] of Object.entries(messageTemplates)) {
      if (!existingNames.includes(template.name)) {
        console.log(`Creating WhatsApp template: ${template.name}`);
        
        // Create template for each language
        const languages = ['en', 'fr', 'ar'];
        for (const lang of languages) {
          await whatsappClient.createMessageTemplate({
            name: `${template.name}_${lang}`,
            category: 'UTILITY',
            language: lang,
            components: [
              {
                type: 'BODY',
                text: template.getMessage({}, lang),
              },
            ],
          });
        }
      }
    }
  } catch (error) {
    console.error('Failed to ensure WhatsApp templates exist:', error);
  }
}