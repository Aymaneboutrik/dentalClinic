import { secretaireDashboardConfig } from "../config/dashboard.config";
import { DashboardHeader } from "../../../components/commons/dashboard/DashboardHeader";
import { StatsCards } from "../../../components/commons/dashboard/StatsCards";
import { RecentItems } from "../../../components/commons/dashboard/RecentItems";

export default function SecretaireDashboardPage() {
  return (
<<<<<<< HEAD
    <div>
      <DashboardHeader
        title={secretaireDashboardConfig.title}
        subtitle={secretaireDashboardConfig.subtitle}
      />

      <StatsCards items={secretaireDashboardConfig.stats} />

      <div className="mt-6">
        <RecentItems items={secretaireDashboardConfig.recentActivities} />
      </div>
=======
    <div className="flex min-h-screen">
      <main className="flex-1 p-6">
        <DashboardHeader
          title={secretaireDashboardConfig.title}
          subtitle={secretaireDashboardConfig.subtitle}
        />

        <StatsCards items={secretaireDashboardConfig.stats} />

        <div className="mt-6">
          <RecentItems items={secretaireDashboardConfig.recentActivities} />
        </div>
      </main>
>>>>>>> origin/main
    </div>
  );
}