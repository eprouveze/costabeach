"use client";

import { Card } from "../molecules/Card";
import { Button } from "../atoms/Button";
import { Bed, Bath, Home, Users, Waves, Sun } from "lucide-react";

interface PropertyShowcaseProps {
  className?: string;
}

export const PropertyShowcase = ({ className = "" }: PropertyShowcaseProps) => {
  const features = [
    {
      icon: <Bed className="w-6 h-6" />,
      title: "Bedrooms",
      description: "3 spacious bedrooms with ocean views",
    },
    {
      icon: <Bath className="w-6 h-6" />,
      title: "Bathrooms",
      description: "2.5 modern bathrooms with premium fixtures",
    },
    {
      icon: <Home className="w-6 h-6" />,
      title: "Living Space",
      description: "2,000 sq ft of luxurious living space",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Occupancy",
      description: "Comfortably accommodates up to 8 guests",
    },
    {
      icon: <Waves className="w-6 h-6" />,
      title: "Beach Access",
      description: "Direct private access to pristine beaches",
    },
    {
      icon: <Sun className="w-6 h-6" />,
      title: "Amenities",
      description: "Pool, spa, and premium resort facilities",
    },
  ];

  return (
    <section className={`py-16 bg-gray-50 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Luxury Beachfront Living
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience the perfect blend of comfort and sophistication in our
            premium beachfront property at Costabeach.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {features.map((feature, index) => (
            <Card key={index} className="p-6 flex flex-col items-center text-center">
              <div className="mb-4 text-blue-600">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button className="px-8 py-3">
            Schedule a Viewing
          </Button>
        </div>
      </div>
    </section>
  );
}; 