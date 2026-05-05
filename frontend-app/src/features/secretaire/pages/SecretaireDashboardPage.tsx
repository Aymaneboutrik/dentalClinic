import { useEffect, useState } from "react";
import { secretaireDashboardConfig } from "../config/dashboard.config";
import { DashboardHeader } from "../../../components/commons/dashboard/DashboardHeader";
import { StatsCards } from "../../../components/commons/dashboard/StatsCards";
import { RecentItems } from "../../../components/commons/dashboard/RecentItems";
import { DashboardCharts } from "../../doctor/components/DashboardCharts";
import { patientService } from "../../../apis/services/patient";
import { getRendezVous } from "../../../apis/services/rendezvous";
import { isToday, startOfWeek, addDays, isSameDay, format } from "date-fns";
import { useTranslation } from "react-i18next";
import { Users, CalendarCheck, FileText, Activity } from "lucide-react";

export default function SecretaireDashboardPage() {
  const { t } = useTranslation();
  const [stats, setStats] = useState(secretaireDashboardConfig.stats);
  const [weeklyData, setWeeklyData] = useState(secretaireDashboardConfig.weeklyActivity);
  const [statusData, setStatusData] = useState(secretaireDashboardConfig.appointmentStatus);
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [patients, appointments] = await Promise.all([
          patientService.getAllPatients(),
          getRendezVous(),
        ]);

        const todayAppointments = appointments.filter((a: any) =>
          isToday(new Date(a.date))
        );
        const confirmedToday = todayAppointments.filter(
          (a: any) => a.statut === "CONFIRME"
        ).length;

        const occupancy =
          appointments.length > 0 ? Math.round((confirmedToday / 10) * 100) : 0;

        setStats([
          {
            title: t("dashboard.stats.todayPatients"),
            value: todayAppointments.length.toString(),
            description: t("dashboard.stats.todayPatientsDesc"),
            icon: <Users className="w-5 h-5" />,
          },
          {
            title: t("dashboard.stats.confirmedRDV"),
            value: confirmedToday.toString(),
            description: t("dashboard.stats.confirmedRDVDesc"),
            icon: <CalendarCheck className="w-5 h-5" />,
          },
          {
            title: t("dashboard.stats.totalPatients"),
            value: patients.length.toString(),
            description: t("dashboard.stats.totalPatientsDesc"),
            icon: <FileText className="w-5 h-5" />,
          },
          {
            title: t("dashboard.stats.occupancy"),
            value: `${occupancy}%`,
            description: t("dashboard.stats.occupancyDesc"),
            icon: <Activity className="w-5 h-5" />,
          },
        ]);

        const days = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
        const last7Days = Array.from({ length: 7 }).map((_, i) => {
          const date = addDays(startOfWeek(new Date()), i);
          const count = appointments.filter((a: any) =>
            isSameDay(new Date(a.date), date)
          ).length;
          return { day: days[date.getDay()], appointments: count };
        });
        setWeeklyData(last7Days);

        const statuses = appointments.reduce((acc: any, curr: any) => {
          acc[curr.statut] = (acc[curr.statut] || 0) + 1;
          return acc;
        }, {});

        const total = appointments.length || 1;
        setStatusData([
          {
            name: t("dashboard.status.confirmed"),
            value: Math.round(((statuses["CONFIRME"] || 0) / total) * 100),
            fill: "hsl(var(--primary))",
          },
          {
            name: t("dashboard.status.pending"),
            value: Math.round(((statuses["EN_ATTENTE"] || 0) / total) * 100),
            fill: "hsl(180 80% 45%)",
          },
          {
            name: t("dashboard.status.cancelled"),
            value: Math.round(((statuses["ANNULE"] || 0) / total) * 100),
            fill: "hsl(0 84% 60%)",
          },
        ]);

        const recent = [...appointments]
          .sort(
            (a: any, b: any) =>
              new Date(b.date).getTime() - new Date(a.date).getTime()
          )
          .slice(0, 5)
          .map((a: any) => {
            const patient = patients.find((p: any) => p.id === a.patientId);
            return {
              title:
                a.statut === "CONFIRME"
                  ? t("dashboard.status.confirmed")
                  : a.statut === "ANNULE"
                  ? t("dashboard.status.cancelled")
                  : t("dashboard.status.pending"),
              name: patient ? `${patient.prenom} ${patient.nom}` : "Patient inconnu",
              time: format(new Date(a.date), "HH:mm"),
            };
          });

        setActivities(recent);
      } catch (error) {
        console.error("Erreur lors du chargement des données concrètes:", error);
      }
    };

    loadDashboardData();
  }, [t]);

  return (
    <div className="space-y-8 pb-10">
      <DashboardHeader
        title={t("sidebar.dashboard")}
        subtitle={secretaireDashboardConfig.subtitle}
      />

      <StatsCards items={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <DashboardCharts weeklyData={weeklyData} statusData={statusData} />
        <RecentItems items={activities} />
      </div>
    </div>
  );
}