import { AuthWrapper } from "@/components/auth/AuthWrapper";
import { AdminInformationPage } from "@/components/admin/AdminInformationPage";

export default function AdminInformationPageRoute() {
  return (
    <AuthWrapper requireAuth={true} requiredPermissions={['viewInformation']}>
      <AdminInformationPage />
    </AuthWrapper>
  );
}