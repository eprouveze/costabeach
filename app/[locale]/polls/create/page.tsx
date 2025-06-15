import { AuthWrapper } from "@/components/auth/AuthWrapper";
import OwnerDashboardTemplate from "@/components/templates/OwnerDashboardTemplate";
import { PollCreateContent } from "@/components/PollCreateContent";

export default function CreatePollPage() {
  return (
    <AuthWrapper requireAuth={true}>
      <OwnerDashboardTemplate>
        <PollCreateContent />
      </OwnerDashboardTemplate>
    </AuthWrapper>
  );
}