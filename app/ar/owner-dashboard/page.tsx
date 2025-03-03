import { AuthWrapper } from "@/components/auth/AuthWrapper";
import { DashboardContent } from "@/components/DashboardContent";
import OwnerDashboardTemplate from "@/components/templates/OwnerDashboardTemplate";

export default function OwnerDashboardPageAr() {
  return (
    <AuthWrapper requireAuth={true}>
      <OwnerDashboardTemplate>
        <DashboardContent />
      </OwnerDashboardTemplate>
    </AuthWrapper>
  );
} 