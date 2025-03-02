import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import RTLWrapper from '../components/RTLWrapper';

// Mock I18nProvider for Storybook
const MockI18nProvider = ({ children, locale }: { children: React.ReactNode; locale: string }) => {
  // Create a mock implementation of useI18n
  const mockContext = {
    locale: locale,
    setLocale: () => {},
    t: (key: string) => key,
    isLoading: false,
  };

  // @ts-ignore - Mocking the context for Storybook
  React.useContext = jest.fn().mockReturnValue(mockContext);

  return <>{children}</>;
};

// Create a wrapper component that includes the locale prop
const RTLWrapperWithLocale = ({
  children,
  className = "",
  applyTextAlign = true,
  applyFlexDirection = false,
  applyTextDirection = true,
  applyListStyle = false,
  locale = "en"
}: {
  children: React.ReactNode;
  className?: string;
  applyTextAlign?: boolean;
  applyFlexDirection?: boolean;
  applyTextDirection?: boolean;
  applyListStyle?: boolean;
  locale?: string;
}) => {
  return (
    <MockI18nProvider locale={locale}>
      <RTLWrapper
        className={className}
        applyTextAlign={applyTextAlign}
        applyFlexDirection={applyFlexDirection}
        applyTextDirection={applyTextDirection}
        applyListStyle={applyListStyle}
      >
        {children}
      </RTLWrapper>
    </MockI18nProvider>
  );
};

const meta: Meta<typeof RTLWrapperWithLocale> = {
  title: 'Components/RTL/RTLWrapper',
  component: RTLWrapperWithLocale,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    locale: {
      control: 'select',
      options: ['en', 'fr', 'ar'],
      defaultValue: 'en',
    },
    applyTextAlign: {
      control: 'boolean',
      defaultValue: true,
    },
    applyFlexDirection: {
      control: 'boolean',
      defaultValue: false,
    },
    applyTextDirection: {
      control: 'boolean',
      defaultValue: true,
    },
    applyListStyle: {
      control: 'boolean',
      defaultValue: false,
    },
  },
};

export default meta;
type Story = StoryObj<typeof RTLWrapperWithLocale>;

export const TextContent: Story = {
  args: {
    locale: 'en',
    applyTextAlign: true,
    applyTextDirection: true,
  },
  render: (args) => (
    <RTLWrapperWithLocale {...args}>
      <h2 className="text-2xl font-bold mb-4">Sample Text Content</h2>
      <p className="mb-4">
        This is a paragraph of text that demonstrates how RTL text alignment works.
        The text should be aligned to the left in LTR languages and to the right in RTL languages.
      </p>
      <p className="mb-4">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget
        aliquam ultricies, nunc nisl aliquet nunc, quis aliquam nisl nunc quis nisl.
      </p>
    </RTLWrapperWithLocale>
  ),
};

export const ListContent: Story = {
  args: {
    locale: 'en',
    applyTextAlign: true,
    applyListStyle: true,
  },
  render: (args) => (
    <RTLWrapperWithLocale {...args}>
      <h2 className="text-2xl font-bold mb-4">Sample List Content</h2>
      <ul className="list-disc mb-4 pl-5">
        <li className="mb-2">First item in the list</li>
        <li className="mb-2">Second item in the list</li>
        <li className="mb-2">Third item in the list</li>
        <li className="mb-2">Fourth item in the list</li>
      </ul>
      <ol className="list-decimal mb-4 pl-5">
        <li className="mb-2">First numbered item</li>
        <li className="mb-2">Second numbered item</li>
        <li className="mb-2">Third numbered item</li>
      </ol>
    </RTLWrapperWithLocale>
  ),
};

export const FlexContent: Story = {
  args: {
    locale: 'en',
    applyFlexDirection: true,
  },
  render: (args) => (
    <RTLWrapperWithLocale {...args} className="flex items-center gap-4">
      <div className="bg-blue-100 p-4 rounded">First Item</div>
      <div className="bg-green-100 p-4 rounded">Second Item</div>
      <div className="bg-yellow-100 p-4 rounded">Third Item</div>
    </RTLWrapperWithLocale>
  ),
};

export const ComplexLayout: Story = {
  args: {
    locale: 'en',
  },
  render: (args) => (
    <div className="space-y-8">
      <RTLWrapperWithLocale locale={args.locale} applyTextAlign={true} applyTextDirection={true}>
        <h2 className="text-2xl font-bold mb-4">Complex Layout Example</h2>
        <p className="mb-4">
          This example demonstrates a more complex layout with text, lists, and flex containers.
        </p>
      </RTLWrapperWithLocale>
      
      <RTLWrapperWithLocale locale={args.locale} applyListStyle={true} className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Features List</h3>
        <ul className="list-disc pl-5">
          <li className="mb-2">RTL text alignment</li>
          <li className="mb-2">RTL list styling</li>
          <li className="mb-2">RTL flex direction</li>
          <li className="mb-2">RTL grid layout</li>
        </ul>
      </RTLWrapperWithLocale>
      
      <RTLWrapperWithLocale locale={args.locale} applyFlexDirection={true} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="bg-blue-100 p-4 rounded flex-1">Sidebar</div>
        <div className="bg-green-100 p-4 rounded flex-2">Main Content</div>
        <div className="bg-yellow-100 p-4 rounded flex-1">Additional Info</div>
      </RTLWrapperWithLocale>
    </div>
  ),
};

export const ArabicExample: Story = {
  args: {
    locale: 'ar',
  },
  render: (args) => (
    <div className="space-y-8" dir="rtl">
      <RTLWrapperWithLocale locale={args.locale} applyTextAlign={true} applyTextDirection={true}>
        <h2 className="text-2xl font-bold mb-4">مثال تخطيط باللغة العربية</h2>
        <p className="mb-4 rtl-text">
          هذا مثال يوضح كيفية عمل النص باللغة العربية مع دعم RTL. يجب أن يكون النص محاذيًا إلى اليمين والقوائم والعناصر الأخرى معكوسة بشكل صحيح.
        </p>
      </RTLWrapperWithLocale>
      
      <RTLWrapperWithLocale locale={args.locale} applyListStyle={true} className="mb-6">
        <h3 className="text-xl font-semibold mb-2">قائمة الميزات</h3>
        <ul className="list-disc pr-5">
          <li className="mb-2 rtl-text">محاذاة النص من اليمين إلى اليسار</li>
          <li className="mb-2 rtl-text">تنسيق القوائم من اليمين إلى اليسار</li>
          <li className="mb-2 rtl-text">اتجاه فلكس من اليمين إلى اليسار</li>
          <li className="mb-2 rtl-text">تخطيط الشبكة من اليمين إلى اليسار</li>
        </ul>
      </RTLWrapperWithLocale>
      
      <RTLWrapperWithLocale locale={args.locale} applyFlexDirection={true} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="bg-blue-100 p-4 rounded flex-1">الشريط الجانبي</div>
        <div className="bg-green-100 p-4 rounded flex-2">المحتوى الرئيسي</div>
        <div className="bg-yellow-100 p-4 rounded flex-1">معلومات إضافية</div>
      </RTLWrapperWithLocale>
    </div>
  ),
}; 