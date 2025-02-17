import React from "react";
import { OwnerPortalSidebar } from "./organisms/OwnerPortalSidebar";
import { DocumentList } from "./organisms/DocumentList";

interface OwnerDashboardTemplateProps {
  children?: React.ReactNode;
}

const OwnerDashboardTemplate: React.FC<OwnerDashboardTemplateProps> = ({ children }) => {
  return (
    <div className="flex">
      <aside className="w-1/4">
        <OwnerPortalSidebar />
      </aside>
      <main className="w-3/4 p-4">
        <DocumentList documents={[]} />
        {children}
      </main>
    </div>
  );
};

export default OwnerDashboardTemplate; 