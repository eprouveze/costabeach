import type { Meta, StoryObj } from "@storybook/react";
import { PropertyShowcase } from "@/components/organisms/PropertyShowcase";

const meta: Meta<typeof PropertyShowcase> = {
  title: "Organisms/PropertyShowcase",
  component: PropertyShowcase,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof PropertyShowcase>;

export const Default: Story = {
  args: {
    properties: [
      {
        id: "1",
        title: "Luxury Beachfront Condo",
        description: "Beautiful 3-bedroom condo with ocean views",
        price: "$750,000",
        imageUrl: "/images/property1.jpg",
      },
      {
        id: "2",
        title: "Ocean View Suite",
        description: "Spacious 2-bedroom suite with modern amenities",
        price: "$500,000",
        imageUrl: "/images/property2.jpg",
      },
    ],
  },
};

export const WithCustomClass: Story = {
  args: {
    className: "bg-white",
  },
}; 