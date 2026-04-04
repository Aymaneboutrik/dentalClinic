
import { doctorDashboardConfig } from "../config/dashboard.config";

// adapte les imports selon tes vrais fichiers

import { DashboardHeader } from "../../../components/commons/dashboard/DashboardHeader";
import { StatsCards } from "../../../components/commons/dashboard/StatsCards";
import { RecentItems } from "../../../components/commons/dashboard/RecentItems";

export default function DoctorDashboardPage() {
  return (
    <div className="flex min-h-screen">
      

      <main className="flex-1 p-6">
        <DashboardHeader
          title={doctorDashboardConfig.title}
          subtitle={doctorDashboardConfig.subtitle}
        />

        <StatsCards items={doctorDashboardConfig.stats} />

        <div className="mt-6">
          <RecentItems items={doctorDashboardConfig.recentActivities} />
        </div>
      </main>
    </div>
  );
}