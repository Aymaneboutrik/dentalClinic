import { assistantDashboardConfig } from "../config/dashboard.config";
import { DashboardHeader } from "../../../components/commons/dashboard/DashboardHeader";
import { StatsCards } from "../../../components/commons/dashboard/StatsCards";
import { RecentItems } from "../../../components/commons/dashboard/RecentItems";

export default function AssistantDashboardPage() {
  return (
<<<<<<< HEAD
    <div>
      <DashboardHeader
        title={assistantDashboardConfig.title}
        subtitle={assistantDashboardConfig.subtitle}
      />

      <StatsCards items={assistantDashboardConfig.stats} />

      <div className="mt-6">
        <RecentItems items={assistantDashboardConfig.recentActivities} />
      </div>
=======
    <div className="flex min-h-screen">
      <main className="flex-1 p-6">
        <DashboardHeader
          title={assistantDashboardConfig.title}
          subtitle={assistantDashboardConfig.subtitle}
        />

        <StatsCards items={assistantDashboardConfig.stats} />

        <div className="mt-6">
          <RecentItems items={assistantDashboardConfig.recentActivities} />
        </div>
      </main>
>>>>>>> origin/main
    </div>
  );
}