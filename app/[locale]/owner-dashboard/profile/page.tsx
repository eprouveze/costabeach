import { AuthWrapper } from "@/components/auth/AuthWrapper";
import OwnerDashboardTemplate from "@/components/templates/OwnerDashboardTemplate";
import { ProfileContent } from "@/components/ProfileContent";

export default function ProfilePage() {
  return (
    <AuthWrapper requireAuth={true}>
      <OwnerDashboardTemplate>
        <ProfileContent />
      </OwnerDashboardTemplate>
    </AuthWrapper>
  );
}