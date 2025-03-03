import type { Meta, StoryObj } from "@storybook/react";
import { DocumentList } from "@/components/DocumentList";
import { DocumentCategory, Language } from "@/lib/types";

const meta: Meta<typeof DocumentList> = {
  title: "Organisms/DocumentList",
  component: DocumentList,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="max-w-7xl mx-auto">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof DocumentList>;

const mockDocuments = [
  {
    id: "1",
    title: "HOA Meeting Minutes",
    description: "Minutes from the January 2023 HOA meeting",
    filePath: "/documents/meeting-minutes-jan-2023.pdf",
    fileSize: 1024 * 1024 * 2, // 2MB
    fileType: "application/pdf",
    category: DocumentCategory.GENERAL,
    language: Language.ENGLISH,
    authorId: "user-1",
    isTranslated: false,
    isPublished: true,
    viewCount: 45,
    downloadCount: 12,
    createdAt: new Date("2023-01-15"),
    updatedAt: new Date("2023-01-15"),
  },
  {
    id: "2",
    title: "Annual Budget",
    description: "Annual budget for the 2023 fiscal year",
    filePath: "/documents/annual-budget-2023.xlsx",
    fileSize: 1024 * 1024 * 1.5, // 1.5MB
    fileType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    category: DocumentCategory.FINANCE,
    language: Language.ENGLISH,
    authorId: "user-2",
    isTranslated: false,
    isPublished: true,
    viewCount: 32,
    downloadCount: 18,
    createdAt: new Date("2023-02-01"),
    updatedAt: new Date("2023-02-01"),
  },
  {
    id: "3",
    title: "Community Guidelines",
    description: "Updated community guidelines for 2023",
    filePath: "/documents/community-guidelines-2023.docx",
    fileSize: 1024 * 1024 * 1, // 1MB
    fileType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    category: DocumentCategory.LEGAL,
    language: Language.ENGLISH,
    authorId: "user-1",
    isTranslated: false,
    isPublished: true,
    viewCount: 67,
    downloadCount: 23,
    createdAt: new Date("2023-01-20"),
    updatedAt: new Date("2023-01-25"),
  },
];

export const Default: Story = {
  args: {
    initialDocuments: mockDocuments,
    showActions: true,
  },
};

export const WithoutSearch: Story = {
  args: {
    initialDocuments: mockDocuments,
    showSearch: false,
  },
};

export const WithoutFilters: Story = {
  args: {
    initialDocuments: mockDocuments,
    showFilters: false,
  },
};

export const WithoutActions: Story = {
  args: {
    initialDocuments: mockDocuments,
    showActions: false,
  },
};

export const SingleDocument: Story = {
  args: {
    initialDocuments: [mockDocuments[0]],
    showActions: true,
  },
}; 