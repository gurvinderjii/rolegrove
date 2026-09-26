import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getApplications } from "@/lib/applications";
import { Dashboard } from "@/components/dashboard";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  // Node's SQLite driver returns rows with a null prototype. Convert them to
  // regular objects before passing them across the Server/Client boundary.
  const initialUser = { id: user.id, name: user.name, email: user.email };
  const initialApplications = (await getApplications(user.id)).map((application) => ({ ...application, follow_up_date: application.follow_up_date || "" }));
  return <Dashboard initialUser={initialUser} initialApplications={initialApplications} />;
}
