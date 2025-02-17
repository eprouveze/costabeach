import React from 'react';
import { Header } from './organisms/Header';
import { Footer } from './organisms/Footer';
import { PropertyShowcase } from './organisms/PropertyShowcase';

const PublicLandingTemplate: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <PropertyShowcase />
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default PublicLandingTemplate; 