"use client";

import React from "react";

interface PublicLandingTemplateProps {
  children?: React.ReactNode;
}

export default function PublicLandingTemplate({ children }: PublicLandingTemplateProps) {
  return <div className="min-h-screen bg-gray-50">{children}</div>;
} 