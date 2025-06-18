import { AuthWrapper } from "@/components/auth/AuthWrapper";
import OwnerDashboardTemplate from "@/components/templates/OwnerDashboardTemplate";
import { InformationsContent } from "@/components/InformationsContent";

export default function InformationsPage() {
  return (
    <AuthWrapper requireAuth={true}>
      <OwnerDashboardTemplate>
        <InformationsContent />
      </OwnerDashboardTemplate>
    </AuthWrapper>
  );
}