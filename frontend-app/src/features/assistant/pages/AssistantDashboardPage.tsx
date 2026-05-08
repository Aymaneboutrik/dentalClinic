import { useEffect, useState } from "react";
import { assistantDashboardConfig } from "../config/dashboard.config";
import { DashboardHeader } from "../../../components/commons/dashboard/DashboardHeader";
import { StatsCards } from "../../../components/commons/dashboard/StatsCards";
import { DashboardCharts } from "../../doctor/components/DashboardCharts";
import { patientService } from "../../../apis/services/patient";
import { getRendezVous } from "../../../apis/services/rendezvous";
import { isToday, startOfWeek, addDays, isSameDay, format } from "date-fns";
import { useTranslation } from "react-i18next";
import { Users, CalendarCheck, FileText, Activity } from "lucide-react";
import secureApi from "@apis/instances/secure-api";
import { getEmployees } from "../services/personnel.service";

export default function AssistantDashboardPage() {
  const { t } = useTranslation();
  const [stats, setStats] = useState(assistantDashboardConfig.stats);
  const [weeklyData, setWeeklyData] = useState(assistantDashboardConfig.weeklyActivity);
  const [statusData, setStatusData] = useState(assistantDashboardConfig.appointmentStatus);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        let patientsResponse: any[] = [];

        try {
          patientsResponse = await patientService.assistantListPatients();
        } catch (e) {
        }

        let employeesResponse: any[] = [];
        let commandesResponse: any[] = [];

        try {
          employeesResponse = await getEmployees();
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

        const patients = extractArray(patientsResponse);
        const appointments = extractArray(appointmentsResponse);
        const employees = extractArray(employeesResponse);
        const commandes = extractArray(commandesResponse);



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
          acc[curr.statutId] = (acc[curr.statutId] || 0) + 1;
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


      <div className="pb-10 space-y-8">
        <DashboardHeader
          title={t("sidebar.dashboard")}
          subtitle={assistantDashboardConfig.subtitle}
        />

        <StatsCards items={stats} />

        <div className="space-y-8">
          <DashboardCharts
            weeklyData={weeklyData}
            statusData={statusData}
          />
        </div>
      </div>
    </>
  );
}