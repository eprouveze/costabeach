import type { Meta, StoryObj } from "@storybook/react";
import { PropertyShowcase } from "@/components/organisms/PropertyShowcase";
import { I18nProvider } from "@/lib/i18n/client";
import { Bed, Bath, Home, Users, Waves, Sun } from "lucide-react";

const meta = {
  title: "Organisms/PropertyShowcase",
  component: PropertyShowcase,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <I18nProvider>
        <Story />
      </I18nProvider>
    ),
  ],
} satisfies Meta<typeof PropertyShowcase>;

export default meta;
type Story = StoryObj<typeof PropertyShowcase>;

const defaultFeatures = [
  {
    icon: <Bed />,
    title: "Bedrooms",
    description: "3 spacious bedrooms with ocean views",
  },
  {
    icon: <Bath />,
    title: "Bathrooms",
    description: "2.5 modern bathrooms with premium fixtures",
  },
  {
    icon: <Home />,
    title: "Living Space",
    description: "2,000 sq ft of luxurious living space",
  },
  {
    icon: <Users />,
    title: "Occupancy",
    description: "Comfortably accommodates up to 8 guests",
  },
  {
    icon: <Waves />,
    title: "Beach Access",
    description: "Direct private access to pristine beaches",
  },
  {
    icon: <Sun />,
    title: "Amenities",
    description: "Pool, spa, and premium resort facilities",
  },
];

export const Default: Story = {
  args: {
    properties: [
      {
        id: "1",
        title: "Luxury Beachfront Condo",
        description: "Beautiful 3-bedroom condo with ocean views",
        price: "$750,000",
        imageUrl: "/images/property1.jpg",
        features: defaultFeatures,
      },
      {
        id: "2",
        title: "Ocean View Suite",
        description: "Spacious 2-bedroom suite with modern amenities",
        price: "$500,000",
        imageUrl: "/images/property2.jpg",
        features: defaultFeatures,
      },
    ],
  },
};

export const WithCustomClass: Story = {
  args: {
    className: "bg-white",
  },
}; 