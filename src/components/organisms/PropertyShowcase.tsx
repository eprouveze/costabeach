"use client";

import React from 'react';
import { Card } from "../molecules/Card";
import { Button } from "../atoms/Button";
import { Bed, Bath, Home, Users, Waves, Sun } from "lucide-react";

interface Property {
  id: string;
  title: string;
  description: string;
  price?: string;
  imageUrl?: string;
  features: {
    icon: React.ReactNode;
    title: string;
    description: string;
  }[];
}

interface PropertyShowcaseProps {
  className?: string;
  properties?: Property[];
}

export const PropertyShowcase = ({ className = "", properties = [] }: PropertyShowcaseProps) => {
  const defaultFeatures = [
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

  const displayFeatures = properties.length > 0 
    ? properties[0].features 
    : defaultFeatures;

  return (
    <section className={`py-16 bg-gray-50 dark:bg-gray-900 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Luxury Beachfront Living
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Experience the perfect blend of comfort and sophistication in our
            premium beachfront property at Costabeach.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {displayFeatures.map((feature, index) => (
            <Card
              key={index}
              title={feature.title}
              description={feature.description}
              className="p-6 flex flex-col items-center text-center"
            >
              <div className="mb-4 text-blue-600 dark:text-blue-400">
                {feature.icon}
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button variant="primary" className="px-8 py-3">
            Schedule a Viewing
          </Button>
        </div>
      </div>
    </section>
  );
}; 