import { getCurrentUser } from "@/actions/auth";
import { getBuses } from "@/actions/buses";
import { getRoutes } from "@/actions/routes";
import StudentDashboard from "@/components/dashboard/student-dashboard";
import DriverDashboard from "@/components/dashboard/driver-dashboard";
import AdminDashboard from "@/components/dashboard/admin-dashboard";
import LandingPage from "@/components/landing-page";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getCurrentUser();
  const buses = await getBuses();
  const routes = await getRoutes();

  if (user) {
    if (user.role === "STUDENT") {
      return <StudentDashboard user={user} />;
    } else if (user.role === "DRIVER") {
      return <DriverDashboard user={user} />;
    } else if (user.role === "ADMIN") {
      return <AdminDashboard user={user} />;
    }
  }

  return <LandingPage buses={buses} routes={routes} />;
}
