import type { Meta, StoryObj } from "@storybook/react";
import OwnerRegistrationsPage from "../../app/admin/owner-registrations/page";
import { http } from "msw";
import { I18nProvider } from '@/lib/i18n/client';
import { SessionProvider } from 'next-auth/react';
import MockTRPCProvider from '../../../.storybook/MockTRPCProvider';
import { ToastContainer } from "react-toastify";
import { userEvent, within } from "@storybook/testing-library";
import { expect } from "@storybook/jest";

const mockRegistrations = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    buildingNumber: "A1",
    apartmentNumber: "101",
    phoneNumber: "+1 (555) 000-0001",
    status: "pending",
    createdAt: "2024-03-20T10:00:00.000Z",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    buildingNumber: "B2",
    apartmentNumber: "202",
    phoneNumber: "+1 (555) 000-0002",
    status: "approved",
    createdAt: "2024-03-19T15:30:00.000Z",
    notes: "Verified through property records",
  },
  {
    id: "3",
    name: "Bob Wilson",
    email: "bob@example.com",
    buildingNumber: "C3",
    apartmentNumber: "303",
    phoneNumber: "+1 (555) 000-0003",
    status: "rejected",
    createdAt: "2024-03-18T09:15:00.000Z",
    notes: "Unable to verify ownership",
  },
];

// Create a decorator that wraps components with all necessary providers
const withProviders = (Story: React.ComponentType) => (
  <I18nProvider>
    <SessionProvider session={{ 
      user: { 
        id: "admin-user-id",
        email: "info@costabeach.ma",
        name: "Admin User",
        isAdmin: true 
      }, 
      expires: "1" 
    }}>
      <MockTRPCProvider>
        <Story />
        <ToastContainer />
      </MockTRPCProvider>
    </SessionProvider>
  </I18nProvider>
);

const meta = {
  title: "Pages/OwnerRegistrationsPage",
  component: OwnerRegistrationsPage,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: "Admin interface for managing owner registration requests, including approval and rejection workflows.",
      },
    },
    msw: {
      handlers: [
        http.get("/api/admin/owner-registrations", () => {
          return new Response(JSON.stringify(mockRegistrations), {
            headers: { 'Content-Type': 'application/json' },
          });
        }),
      ],
    },
  },
  decorators: [withProviders],
  tags: ["autodocs"],
} satisfies Meta<typeof OwnerRegistrationsPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: "The default view showing a mix of pending, approved, and rejected registrations.",
      },
    },
  },
};

export const EmptyState: Story = {
  args: {},
  parameters: {
    msw: {
      handlers: [
        http.get("/api/admin/owner-registrations", () => {
          return new Response(JSON.stringify([]), {
            headers: { 'Content-Type': 'application/json' },
          });
        }),
      ],
    },
    docs: {
      description: {
        story: "The view when there are no registration requests to review.",
      },
    },
  },
};

export const LoadingState: Story = {
  args: {},
  parameters: {
    msw: {
      handlers: [
        http.get("/api/admin/owner-registrations", () => {
          return new Response(JSON.stringify(mockRegistrations), {
            headers: { 'Content-Type': 'application/json' },
          });
        }),
      ],
    },
    docs: {
      description: {
        story: "The loading state while fetching registration data.",
      },
    },
  },
};

export const ErrorState: Story = {
  args: {},
  parameters: {
    msw: {
      handlers: [
        http.get("/api/admin/owner-registrations", () => {
          return new Response(JSON.stringify(null), {
            status: 500,
          });
        }),
      ],
    },
    docs: {
      description: {
        story: "The error state when failing to fetch registration data.",
      },
    },
  },
};

export const ReviewingRegistration: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: "Demonstrates the review process for a pending registration.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Find and click the first "Review" button
    const reviewButton = await canvas.findByText("Review");
    await userEvent.click(reviewButton);
    
    // Verify that the review form appears
    const notesTextarea = await canvas.findByPlaceholderText("Add notes (optional)");
    await expect(notesTextarea).toBeInTheDocument();
    
    // Add some notes
    await userEvent.type(notesTextarea, "Ownership verified through property records");
    
    // Verify approve/reject buttons are present
    const approveButton = canvas.getByRole("button", { name: "" }); // Using aria-label from Check icon
    const rejectButton = canvas.getByRole("button", { name: "" }); // Using aria-label from X icon
    await expect(approveButton).toBeInTheDocument();
    await expect(rejectButton).toBeInTheDocument();
  },
};

export const DarkMode: Story = {
  args: {},
  parameters: {
    themes: {
      default: "dark",
    },
    docs: {
      description: {
        story: "The admin interface in dark mode.",
      },
    },
  },
}; 