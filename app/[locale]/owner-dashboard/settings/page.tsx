import { AuthWrapper } from "@/components/auth/AuthWrapper";
import OwnerDashboardTemplate from "@/components/templates/OwnerDashboardTemplate";
import { SettingsContent } from "@/components/SettingsContent";

export default function SettingsPage() {
  return (
    <AuthWrapper requireAuth={true}>
      <OwnerDashboardTemplate>
        <SettingsContent />
      </OwnerDashboardTemplate>
    </AuthWrapper>
  );
}