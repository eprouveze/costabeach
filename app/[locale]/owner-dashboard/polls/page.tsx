import { AuthWrapper } from "@/components/auth/AuthWrapper";
import OwnerDashboardTemplate from "@/components/templates/OwnerDashboardTemplate";
import { PollsContent } from "@/components/PollsContent";

export default function PollsPage() {
  return (
    <AuthWrapper requireAuth={true}>
      <OwnerDashboardTemplate>
        <PollsContent />
      </OwnerDashboardTemplate>
    </AuthWrapper>
  );
}