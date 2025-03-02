import type { Meta, StoryObj } from '@storybook/react';
import Hero from '@/components/Hero';
import { MockI18nProvider } from './utils/MockI18nProvider';

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
      <MockI18nProvider 
        locale="en" 
        messages={mockTranslations}
      >
        <Story />
      </MockI18nProvider>
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
      <MockI18nProvider 
        locale="fr" 
        messages={{
          'landing.heroTitle': 'Portail de l\'Association des Propriétaires de Costa Beach 3',
          'landing.heroSubtitle': 'Accédez aux documents importants, aux informations communautaires et aux ressources de l\'association dans un espace sécurisé.',
          'landing.registerCTA': 'S\'inscrire en tant que Propriétaire',
          'landing.contactCTA': 'Nous Contacter',
        }}
      >
        <Story />
      </MockI18nProvider>
    ),
  ],
};

export const Arabic: Story = {
  decorators: [
    (Story) => (
      <MockI18nProvider 
        locale="ar" 
        messages={{
          'landing.heroTitle': 'بوابة جمعية ملاك كوستا بيتش 3',
          'landing.heroSubtitle': 'الوصول إلى المستندات المهمة ومعلومات المجتمع وموارد الجمعية في مكان آمن واحد.',
          'landing.registerCTA': 'التسجيل كمالك',
          'landing.contactCTA': 'اتصل بنا',
        }}
      >
        <div dir="rtl">
          <Story />
        </div>
      </MockI18nProvider>
    ),
  ],
}; 