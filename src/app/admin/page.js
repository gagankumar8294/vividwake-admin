import AdminAnalyticsDashboard from "../page";

export const metadata = {
  title: "VividWake Admin | Mission Control",
  description: "Administrative telemetry, catalog management, and device locks for VividWake",
};

export default function AdminPage() {
  return <AdminAnalyticsDashboard forceAdmin={true} />;
}
