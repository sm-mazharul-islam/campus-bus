import { getCurrentUser } from "@/actions/auth";
import { getBuses } from "@/actions/buses";
import { getRoutes } from "@/actions/routes";
import { redirect } from "next/navigation";
import LandingPage from "@/components/landing-page";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getCurrentUser();
  const buses = await getBuses();
  const routes = await getRoutes();

  if (user) {
    redirect("/dashboard");
  }

  return <LandingPage buses={buses} routes={routes} />;
}
