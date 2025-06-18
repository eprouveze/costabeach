import { AuthWrapper } from "@/components/auth/AuthWrapper";
import { AdminInformationPage } from "@/components/admin/AdminInformationPage";
import AdminDashboardTemplate from "@/components/templates/AdminDashboardTemplate";

export default function AdminInformationPageRoute() {
  return (
    <AuthWrapper requireAuth={true}>
      <AdminDashboardTemplate>
        <AdminInformationPage />
      </AdminDashboardTemplate>
    </AuthWrapper>
  );
}