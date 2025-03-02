import type { Meta, StoryObj } from '@storybook/react';
import { MockI18nProvider } from '../utils/MockI18nProvider';

// Mock translations for Storybook
const mockTranslations = {
  'contact.title': 'Contact Us',
  'contact.description': 'Have questions about Costa Beach 3 HOA? Get in touch with us and we\'ll get back to you as soon as possible.',
  'contact.name': 'Name',
  'contact.email': 'Email',
  'contact.subject': 'Subject',
  'contact.message': 'Message',
  'contact.submit': 'Send Message',
  'contact.messageSent': 'Your message has been sent successfully!',
  'contact.department': 'Department',
  'contact.departments.general': 'General Inquiries',
  'contact.departments.management': 'HOA Management',
  'contact.departments.maintenance': 'Maintenance',
  'contact.departments.financial': 'Financial Questions',
  'contact.departments.legal': 'Legal Matters',
  'contact.contactInfo.title': 'Contact Information',
  'contact.contactInfo.address': 'Costa Beach 3, Casablanca, Morocco',
  'contact.contactInfo.phone': '+212 522 123 456',
  'contact.contactInfo.email': 'info@costabeach3.com',
  'contact.contactInfo.hours': 'Office Hours: Monday-Friday, 9:00 AM - 5:00 PM',
  'contact.validation.nameRequired': 'Please enter your name',
  'contact.validation.emailRequired': 'Please enter your email address',
  'contact.validation.emailInvalid': 'Please enter a valid email address',
  'contact.validation.subjectRequired': 'Please enter a subject',
  'contact.validation.messageRequired': 'Please enter your message',
  'contact.validation.departmentRequired': 'Please select a department'
};

// Create a wrapper component for documentation
const ContactFormDocumentation = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Contact Form</h1>
      <p className="mb-6">
        The contact form allows users to send messages to the HOA administration. It includes fields for name, email, department selection, subject, and message.
      </p>

      <h2 className="text-2xl font-bold mt-8 mb-4">Form Layout</h2>
      <p className="mb-4">
        The contact page is divided into two sections: the contact form and contact information. On mobile devices, these sections stack vertically, while on desktop they appear side by side.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-8">
        {/* Contact Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
          <form className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            <div>
              <label htmlFor="department" className="block text-sm font-medium mb-2">
                Department
              </label>
              <select
                id="department"
                name="department"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                required
              >
                <option value="">-- General Inquiries --</option>
                <option value="management">HOA Management</option>
                <option value="maintenance">Maintenance</option>
                <option value="financial">Financial Questions</option>
                <option value="legal">Legal Matters</option>
              </select>
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium mb-2">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium mb-2">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                required
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-300"
            >
              Send Message
            </button>
          </form>
        </div>

        {/* Contact Information Preview */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
          <h2 className="text-xl font-semibold mb-6">Contact Information</h2>
          
          <div className="space-y-6">
            <div className="flex items-start">
              <div className="w-5 h-5 text-blue-600 mt-1 mr-3">📍</div>
              <div>
                <p className="font-medium">Address</p>
                <p className="text-gray-600 dark:text-gray-300">Costa Beach 3, Casablanca, Morocco</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="w-5 h-5 text-blue-600 mt-1 mr-3">📞</div>
              <div>
                <p className="font-medium">Phone</p>
                <p className="text-gray-600 dark:text-gray-300">+212 522 123 456</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="w-5 h-5 text-blue-600 mt-1 mr-3">✉️</div>
              <div>
                <p className="font-medium">Email</p>
                <p className="text-gray-600 dark:text-gray-300">info@costabeach3.com</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="w-5 h-5 text-blue-600 mt-1 mr-3">🕒</div>
              <div>
                <p className="font-medium">Hours</p>
                <p className="text-gray-600 dark:text-gray-300">Office Hours: Monday-Friday, 9:00 AM - 5:00 PM</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold mt-8 mb-4">Form Validation</h2>
      <p className="mb-4">
        The contact form includes client-side validation for all fields:
      </p>
      <ul className="list-disc pl-6 mb-6">
        <li className="mb-2"><strong>Name</strong>: Required field</li>
        <li className="mb-2"><strong>Email</strong>: Required field, must be a valid email format</li>
        <li className="mb-2"><strong>Department</strong>: Required selection from dropdown</li>
        <li className="mb-2"><strong>Subject</strong>: Required field</li>
        <li className="mb-2"><strong>Message</strong>: Required field</li>
      </ul>

      <h2 className="text-2xl font-bold mt-8 mb-4">Submission Handling</h2>
      <p className="mb-4">
        When the form is submitted:
      </p>
      <ol className="list-decimal pl-6 mb-6">
        <li className="mb-2">Client-side validation is performed</li>
        <li className="mb-2">If validation passes, the form data is submitted to the server</li>
        <li className="mb-2">A success toast notification is displayed to the user</li>
        <li className="mb-2">The form fields are reset for a new submission</li>
      </ol>

      <h2 className="text-2xl font-bold mt-8 mb-4">Accessibility Considerations</h2>
      <p className="mb-4">
        The contact form is built with accessibility in mind:
      </p>
      <ul className="list-disc pl-6 mb-6">
        <li className="mb-2">All form fields have associated labels</li>
        <li className="mb-2">Required fields are marked with the required attribute</li>
        <li className="mb-2">Error messages are associated with their respective fields using aria-describedby</li>
        <li className="mb-2">The form can be navigated and submitted using only the keyboard</li>
      </ul>
    </div>
  );
};

// Create a decorator that wraps components with MockI18nProvider
const withI18nProvider = (Story: React.ComponentType) => (
  <MockI18nProvider 
    locale="en" 
    messages={mockTranslations}
  >
    <Story />
  </MockI18nProvider>
);

const meta: Meta<typeof ContactFormDocumentation> = {
  title: 'Documentation/Contact Form',
  component: ContactFormDocumentation,
  decorators: [withI18nProvider],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Documentation for the contact form component used in the Costa Beach HOA Portal application.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ContactFormDocumentation>;

export const Default: Story = {
  args: {},
}; 