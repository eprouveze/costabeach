import React, { ReactNode } from 'react';
import { MockI18nProvider } from './MockI18nProvider';
import { SessionProvider } from 'next-auth/react';
import MockTRPCProvider from '../../../.storybook/MockTRPCProvider';

interface StoryProvidersProps {
  children: ReactNode;
  withI18n?: boolean;
  withTRPC?: boolean;
  withSession?: boolean;
  i18nMessages?: Record<string, string>;
  locale?: string;
}

/**
 * A utility component that combines all necessary providers for stories
 * This helps ensure consistent context across all stories
 */
export const StoryProviders: React.FC<StoryProvidersProps> = ({
  children,
  withI18n = true,
  withTRPC = true,
  withSession = false,
  i18nMessages = {},
  locale = 'en',
}) => {
  // Default translations that are commonly used across components
  const defaultMessages = {
    'common.loading': 'Loading...',
    'common.error': 'An error occurred',
    'common.success': 'Success!',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.view': 'View',
    'common.download': 'Download',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.submit': 'Submit',
    ...i18nMessages,
  };

  // Combine providers based on props
  let content = children;

  if (withSession) {
    content = <SessionProvider session={null}>{content}</SessionProvider>;
  }

  if (withTRPC) {
    content = <MockTRPCProvider>{content}</MockTRPCProvider>;
  }

  if (withI18n) {
    content = (
      <MockI18nProvider locale={locale} messages={defaultMessages}>
        {content}
      </MockI18nProvider>
    );
  }

  return content;
};

/**
 * A decorator factory that can be used in Storybook stories
 */
export const createStoryDecorator = (options: Omit<StoryProvidersProps, 'children'>) => {
  return (Story: React.ComponentType) => (
    <StoryProviders {...options}>
      <Story />
    </StoryProviders>
  );
}; 