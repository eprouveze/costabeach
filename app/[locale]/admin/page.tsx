import { AuthWrapper } from "@/components/auth/AuthWrapper";
import { AdminDashboardContent } from "@/components/AdminDashboardContent";
import AdminDashboardTemplate from "@/components/templates/AdminDashboardTemplate";

export default function AdminDashboardPage() {
  return (
    <AuthWrapper requireAuth={true}>
      <AdminDashboardTemplate>
        <AdminDashboardContent />
      </AdminDashboardTemplate>
    </AuthWrapper>
  );
}