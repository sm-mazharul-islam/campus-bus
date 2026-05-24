import { getCurrentUser } from "@/actions/auth";
import { redirect } from "next/navigation";
import StudentDashboard from "@/components/dashboard/student-dashboard";
import DriverDashboard from "@/components/dashboard/driver-dashboard";
import AdminDashboard from "@/components/dashboard/admin-dashboard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role === "STUDENT") {
    return <StudentDashboard user={user} />;
  } else if (user.role === "DRIVER") {
    return <DriverDashboard user={user} />;
  } else if (user.role === "ADMIN") {
    return <AdminDashboard user={user} />;
  }

  redirect("/login");
}
