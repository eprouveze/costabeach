import type { Meta, StoryObj } from "@storybook/react";
import { DocumentList } from "../../components/organisms/DocumentList";

const meta: Meta<typeof DocumentList> = {
  title: "Organisms/DocumentList",
  component: DocumentList,
  parameters: {
    layout: "padded",
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

const sampleDocuments = [
  {
    id: "1",
    title: "Annual Report 2023",
    description: "Financial report for the year 2023",
    type: "PDF",
    dateUploaded: "2024-01-15",
    fileSize: "2.5 MB",
  },
  {
    id: "2",
    title: "Meeting Minutes",
    description: "Board meeting minutes from December",
    type: "DOC",
    dateUploaded: "2023-12-20",
    fileSize: "500 KB",
  },
  {
    id: "3",
    title: "Maintenance Schedule",
    description: "Upcoming maintenance activities",
    type: "XLSX",
    dateUploaded: "2024-02-01",
    fileSize: "750 KB",
  },
];

export const Default: Story = {
  args: {
    documents: sampleDocuments,
    onView: (id) => console.log(`Viewing document: ${id}`),
    onDownload: (id) => console.log(`Downloading document: ${id}`),
  },
};

export const ViewOnly: Story = {
  args: {
    documents: sampleDocuments,
    onView: (id) => console.log(`Viewing document: ${id}`),
  },
};

export const DownloadOnly: Story = {
  args: {
    documents: sampleDocuments,
    onDownload: (id) => console.log(`Downloading document: ${id}`),
  },
};

export const NoActions: Story = {
  args: {
    documents: sampleDocuments,
  },
};

export const SingleDocument: Story = {
  args: {
    documents: [sampleDocuments[0]],
    onView: (id) => console.log(`Viewing document: ${id}`),
    onDownload: (id) => console.log(`Downloading document: ${id}`),
  },
}; 