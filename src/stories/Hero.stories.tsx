import type { Meta, StoryObj } from '@storybook/react';
import Hero from '@/components/Hero';
import { I18nProvider } from '@/lib/i18n/client';

// Mock translations for Storybook
const mockTranslations = {
  'landing.heroTitle': 'Costa Beach 3 Homeowners Association Portal',
  'landing.heroSubtitle': 'Access important documents, community information, and association resources in one secure place.',
  'landing.registerCTA': 'Register as Owner',
  'landing.contactCTA': 'Contact Us',
};

const meta: Meta<typeof Hero> = {
  title: 'Components/Hero',
  component: Hero,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <I18nProvider 
        locale="en" 
        translations={mockTranslations} 
        namespaces={['common']}
      >
        <Story />
      </I18nProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Hero>;

export const Default: Story = {
  args: {},
};

export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

export const Tablet: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
  },
};

export const Desktop: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'desktop',
    },
  },
};

export const French: Story = {
  decorators: [
    (Story) => (
      <I18nProvider 
        locale="fr" 
        translations={{
          'landing.heroTitle': 'Portail de l\'Association des Propriétaires de Costa Beach 3',
          'landing.heroSubtitle': 'Accédez aux documents importants, aux informations communautaires et aux ressources de l\'association dans un espace sécurisé.',
          'landing.registerCTA': 'S\'inscrire en tant que Propriétaire',
          'landing.contactCTA': 'Nous Contacter',
        }} 
        namespaces={['common']}
      >
        <Story />
      </I18nProvider>
    ),
  ],
};

export const Arabic: Story = {
  decorators: [
    (Story) => (
      <I18nProvider 
        locale="ar" 
        translations={{
          'landing.heroTitle': 'بوابة جمعية ملاك كوستا بيتش 3',
          'landing.heroSubtitle': 'الوصول إلى المستندات المهمة ومعلومات المجتمع وموارد الجمعية في مكان آمن واحد.',
          'landing.registerCTA': 'التسجيل كمالك',
          'landing.contactCTA': 'اتصل بنا',
        }} 
        namespaces={['common']}
      >
        <div dir="rtl">
          <Story />
        </div>
      </I18nProvider>
    ),
  ],
}; 