import { AuthWrapper } from "@/components/auth/AuthWrapper";
import { DashboardContent } from "@/components/DashboardContent";
import OwnerDashboardTemplate from "@/components/templates/OwnerDashboardTemplate";

export default function OwnerDashboardPageFr() {
  return (
    <AuthWrapper requireAuth={true} allowedRoles={["owner"]}>
      <OwnerDashboardTemplate>
        <DashboardContent />
      </OwnerDashboardTemplate>
    </AuthWrapper>
  );
} 