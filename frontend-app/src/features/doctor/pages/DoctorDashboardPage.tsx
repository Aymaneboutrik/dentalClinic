import { useEffect, useState } from "react";
import { doctorDashboardConfig } from "../config/dashboard.config";
import { DashboardHeader } from "../../../components/commons/dashboard/DashboardHeader";
import { StatsCards } from "../../../components/commons/dashboard/StatsCards";
import { RecentItems } from "../../../components/commons/dashboard/RecentItems";
import { userService } from "../../../apis/services/user";

export default function DoctorDashboardPage() {
  const [stats, setStats] = useState(doctorDashboardConfig.stats);

  useEffect(() => {
    // Fill dynamic context (Team active members)
    const loadStats = async () => {
      try {
        const users = await userService.getUsers();
        const activeStaff = users.filter((u: any) => u.actif && u.role !== "Dentiste").length;
        
        setStats([
          {
            title: "Patients aujourd’hui",
            value: "12",
            description: "+2 depuis hier",
          },
          {
            title: "Rendez-vous confirmés",
            value: "8",
            description: "pour aujourd’hui",
          },
          {
            title: "Employés actifs",
            value: activeStaff.toString(),
            description: "Secrétaires et assistantes actives",
          },
        ]);
      } catch (error) {
        console.error("Non bloquant, l'API n'est pas encore prête.", error);
      }
    };
    loadStats();
  }, []);

  return (
    <div className="flex min-h-screen">
      <main className="flex-1 p-6">
        <DashboardHeader
          title={doctorDashboardConfig.title}
          subtitle={doctorDashboardConfig.subtitle}
        />

        <StatsCards items={stats} />

        <div className="mt-6">
          <RecentItems items={doctorDashboardConfig.recentActivities} />
        </div>
      </main>
    </div>
  );
}