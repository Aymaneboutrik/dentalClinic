import { useEffect, useState } from "react";
import { doctorDashboardConfig } from "../config/dashboard.config";
import { DashboardHeader } from "../../../components/commons/dashboard/DashboardHeader";
import { StatsCards } from "../../../components/commons/dashboard/StatsCards";
import { DashboardCharts } from "../components/DashboardCharts";
import { userService } from "../../../apis/services/user";
import { patientService } from "../../../apis/services/patient";
import { getRendezVous } from "../../../apis/services/rendezvous";
import { format, isToday, startOfWeek, addDays, isSameDay } from "date-fns";
import { useTranslation } from "react-i18next";
import { Users, CalendarCheck, FileText, Activity } from "lucide-react";
import secureApi from "@apis/instances/secure-api";

export default function DoctorDashboardPage() {
  const { t } = useTranslation();
  const [stats, setStats] = useState(doctorDashboardConfig.stats);
  const [weeklyData, setWeeklyData] = useState(doctorDashboardConfig.weeklyActivity);
  const [statusData, setStatusData] = useState(doctorDashboardConfig.appointmentStatus);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        let employeesResponse: any[] = [];
        let patientsResponse: any[] = [];
        let commandesResponse: any[] = [];

        try {
          const res = await secureApi.get("/personnel/api/Employees");
          employeesResponse = res.data;
        } catch (e) {
        }

        try {
          patientsResponse = await patientService.getAllPatients();
        } catch (e) {
        }

        try {
          const res = await secureApi.get("/stock/Commande");
          commandesResponse = res.data;
        } catch (e) {
        }

        const appointmentsResponse = await getRendezVous();
        const extractArray = (res: any): any[] => {
          if (!res) return [];
          if (Array.isArray(res)) return res;
          if (res.content && Array.isArray(res.content)) return res.content;
          if (res.data && Array.isArray(res.data)) return res.data;
          if (res.$values && Array.isArray(res.$values)) return res.$values;
          if (res._embedded) {
            const keys = Object.keys(res._embedded);
            if (keys.length > 0 && Array.isArray(res._embedded[keys[0]])) {
              return res._embedded[keys[0]];
            }
          }
          return [];
        };

        const employees = extractArray(employeesResponse);
        const patients = extractArray(patientsResponse);
        const appointments = extractArray(appointmentsResponse);
        const commandes = extractArray(commandesResponse);

        const todayAppointments = appointments.filter((a: any) =>
          isToday(new Date(a.date))
        );
        const confirmedToday = todayAppointments.filter(
          (a: any) => a.statutId === 6
        ).length;

        const occupancy =
          appointments.length > 0 ? Math.round((confirmedToday / 10) * 100) : 0;

        setStats([
          {
            title: "Total Patients",
            value: patients.length.toString(),
            description: "Patients dans la base",
            icon: <Users className="w-5 h-5" />,
          },
          {
            title: "Total Rendez-vous",
            value: appointments.length.toString(),
            description: "Tous statuts confondus",
            icon: <CalendarCheck className="w-5 h-5" />,
          },
          {
            title: "Commandes Stock",
            value: commandes.length.toString(),
            description: "Ordres d'achat",
            icon: <FileText className="w-5 h-5" />,
          },
          {
            title: "Total Employés",
            value: employees.length.toString(),
            description: "Membres du personnel",
            icon: <Activity className="w-5 h-5" />,
          },
        ]);

        const weekly = [
          { day: "Lun", appointments: 12 },
          { day: "Mar", appointments: 18 },
          { day: "Mer", appointments: 15 },
          { day: "Jeu", appointments: 22 },
          { day: "Ven", appointments: 19 },
          { day: "Sam", appointments: 8 },
          { day: "Dim", appointments: 0 },
        ];

        setWeeklyData(weekly);

        const statuses = appointments.reduce((acc: any, curr: any) => {
          const id = curr.statutId || 0;
          acc[id] = (acc[id] || 0) + 1;
          return acc;
        }, {});

        const total = appointments.length || 1;
        setStatusData([
          {
            name: t("dashboard.status.confirmed"),
            value: Math.round(((statuses[6] || 0) / total) * 100),
            fill: "hsl(var(--primary))",
          },
          {
            name: t("dashboard.status.pending"),
            value: Math.round(((statuses[1] || 0) / total) * 100),
            fill: "hsl(180 80% 45%)",
          },
          {
            name: t("dashboard.status.cancelled"),
            value: Math.round(((statuses[3] || 0) / total) * 100),
            fill: "hsl(0 84% 60%)",
          },
        ]);

      } catch (error) {
        console.error("Erreur lors du chargement des données concrètes:", error);
      }
    };

    loadDashboardData();
  }, []);

  return (
    <>
      <div className="space-y-8 pb-10">
        <DashboardHeader
          title={t("dashboard.title")}
          subtitle={t("dashboard.subtitle")}
        />

        <StatsCards items={stats} />

        <div className="space-y-8">
          <DashboardCharts weeklyData={weeklyData} statusData={statusData} />
        </div>
      </div>
    </>
  );
}