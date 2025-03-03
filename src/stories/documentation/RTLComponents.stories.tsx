import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import RTLWrapper from '@/components/RTLWrapper';
import { I18nProvider } from '@/lib/i18n/client';

const meta: Meta<typeof RTLWrapper> = {
  title: 'Documentation/RTLComponents',
  component: RTLWrapper,
  decorators: [
    (Story) => (
      <I18nProvider>
        <div className="p-4">
          <Story />
        </div>
      </I18nProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof RTLWrapper>;

export const TextContent: Story = {
  args: {
    children: <div className="text-right">This is right-to-left text content</div>,
  },
};

export const ListContent: Story = {
  args: {
    applyTextAlign: true,
    applyListStyle: true,
  },
  render: (args) => (
    <RTLWrapper {...args}>
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
    </RTLWrapper>
  ),
};

export const FlexContent: Story = {
  args: {
    applyFlexDirection: true,
  },
  render: (args) => (
    <RTLWrapper {...args} className="flex items-center gap-4">
      <div className="bg-blue-100 p-4 rounded">First Item</div>
      <div className="bg-green-100 p-4 rounded">Second Item</div>
      <div className="bg-yellow-100 p-4 rounded">Third Item</div>
    </RTLWrapper>
  ),
};

export const ComplexLayout: Story = {
  args: {},
  render: (args) => (
    <div className="space-y-8">
      <RTLWrapper applyTextAlign={true} applyTextDirection={true}>
        <h2 className="text-2xl font-bold mb-4">Complex Layout Example</h2>
        <p className="mb-4">
          This example demonstrates a more complex layout with text, lists, and flex containers.
        </p>
      </RTLWrapper>
      
      <RTLWrapper applyListStyle={true} className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Features List</h3>
        <ul className="list-disc pl-5">
          <li className="mb-2">RTL text alignment</li>
          <li className="mb-2">RTL list styling</li>
          <li className="mb-2">RTL flex direction</li>
          <li className="mb-2">RTL grid layout</li>
        </ul>
      </RTLWrapper>
      
      <RTLWrapper applyFlexDirection={true} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="bg-blue-100 p-4 rounded flex-1">Sidebar</div>
        <div className="bg-green-100 p-4 rounded flex-2">Main Content</div>
        <div className="bg-yellow-100 p-4 rounded flex-1">Additional Info</div>
      </RTLWrapper>
    </div>
  ),
};

export const ArabicExample: Story = {
  args: {},
  render: (args) => (
    <div className="space-y-8" dir="rtl">
      <RTLWrapper applyTextAlign={true} applyTextDirection={true}>
        <h2 className="text-2xl font-bold mb-4">مثال تخطيط باللغة العربية</h2>
        <p className="mb-4 rtl-text">
          هذا مثال يوضح كيفية عمل النص باللغة العربية مع دعم RTL. يجب أن يكون النص محاذيًا إلى اليمين والقوائم والعناصر الأخرى معكوسة بشكل صحيح.
        </p>
      </RTLWrapper>
      
      <RTLWrapper applyListStyle={true} className="mb-6">
        <h3 className="text-xl font-semibold mb-2">قائمة الميزات</h3>
        <ul className="list-disc pr-5">
          <li className="mb-2 rtl-text">محاذاة النص من اليمين إلى اليسار</li>
          <li className="mb-2 rtl-text">تنسيق القوائم من اليمين إلى اليسار</li>
          <li className="mb-2 rtl-text">اتجاه فلكس من اليمين إلى اليسار</li>
          <li className="mb-2 rtl-text">تخطيط الشبكة من اليمين إلى اليسار</li>
        </ul>
      </RTLWrapper>
      
      <RTLWrapper applyFlexDirection={true} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="bg-blue-100 p-4 rounded flex-1">الشريط الجانبي</div>
        <div className="bg-green-100 p-4 rounded flex-2">المحتوى الرئيسي</div>
        <div className="bg-yellow-100 p-4 rounded flex-1">معلومات إضافية</div>
      </RTLWrapper>
    </div>
  ),
}; 