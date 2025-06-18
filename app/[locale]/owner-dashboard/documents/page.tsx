import { AuthWrapper } from "@/components/auth/AuthWrapper";
import OwnerDashboardTemplate from "@/components/templates/OwnerDashboardTemplate";
import { DocumentsContent } from "@/components/DocumentsContent";

export default function DocumentsPage() {
  return (
    <AuthWrapper requireAuth={true}>
      <OwnerDashboardTemplate>
        <DocumentsContent />
      </OwnerDashboardTemplate>
    </AuthWrapper>
  );
}