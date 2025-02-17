import type { Meta, StoryObj } from "@storybook/react";
import { SessionProvider } from "next-auth/react";
import { ToastContainer } from "react-toastify";
import OwnerRegistrationsPage from "@/app/admin/owner-registrations/page";
import { rest } from "msw";
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

const meta = {
  title: "Pages/Admin/OwnerRegistrations",
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
        rest.get("/api/admin/owner-registrations", (req, res, ctx) => {
          return res(ctx.json(mockRegistrations));
        }),
      ],
    },
  },
  decorators: [
    (Story) => (
      <SessionProvider session={{ 
        user: { 
          email: "admin@costabeach.com",
          name: "Admin User",
          isAdmin: true 
        }, 
        expires: "1" 
      }}>
        <Story />
        <ToastContainer />
      </SessionProvider>
    ),
  ],
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
        rest.get("/api/admin/owner-registrations", (req, res, ctx) => {
          return res(ctx.json([]));
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
        rest.get("/api/admin/owner-registrations", (req, res, ctx) => {
          return res(ctx.delay(2000), ctx.json(mockRegistrations));
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
        rest.get("/api/admin/owner-registrations", (req, res, ctx) => {
          return res(ctx.status(500));
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