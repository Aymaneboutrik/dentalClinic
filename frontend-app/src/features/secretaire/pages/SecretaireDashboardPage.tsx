import { useEffect, useState } from "react";
import { secretaireDashboardConfig } from "../config/dashboard.config";
import { DashboardHeader } from "../../../components/commons/dashboard/DashboardHeader";
import { StatsCards } from "../../../components/commons/dashboard/StatsCards";
import { DashboardCharts } from "../../doctor/components/DashboardCharts";
import { patientService } from "../../../apis/services/patient";
import { getRendezVous, getAllHistory } from "../../../apis/services/rendezvous";
import { isToday, startOfWeek, addDays, isSameDay, format } from "date-fns";
import { useTranslation } from "react-i18next";
import { Users, CalendarCheck, FileText, Activity } from "lucide-react";
import secureApi from "@apis/instances/secure-api";

export default function SecretaireDashboardPage() {
  const { t } = useTranslation();
  const [stats, setStats] = useState(secretaireDashboardConfig.stats);
  const [weeklyData, setWeeklyData] = useState(secretaireDashboardConfig.weeklyActivity);
  const [statusData, setStatusData] = useState(secretaireDashboardConfig.appointmentStatus);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        let patientsResponse: any[] = [];

        try {
          patientsResponse = await patientService.secretaryListPatients();
        } catch (e) {
        }

        let employeesResponse: any[] = [];
        let commandesResponse: any[] = [];

        try {
          const res = await secureApi.get("/personnel/api/Employees");
          employeesResponse = res.data;
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

        let mouvementsResponse: any[] = [];
        try {
          const res = await secureApi.get("/stock/MouvementStock");
          mouvementsResponse = extractArray(res.data);
        } catch (e) {
        }

        const monthCounts: Record<string, number> = {};
        const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

        monthNames.forEach(m => monthCounts[m] = 0);
        mouvementsResponse.forEach((m: any) => {
          if (m.dateMouvement) {
            const date = new Date(m.dateMouvement);
            const monthStr = monthNames[date.getMonth()];
            monthCounts[monthStr] += 1;
          }
        });

        const stockWeekly = monthNames.map(month => ({
          day: month,
          appointments: monthCounts[month]
        }));

        setWeeklyData(stockWeekly);

        // NOUVELLE LOGIQUE: Calculer les statuts à partir de l'historique (traçabilité réelle)
        let historyData: any[] = [];
        try {
          const historyResponse = await getAllHistory();
          historyData = extractArray(historyResponse);
        } catch (e) {
          console.error("Erreur récupération historique:", e);
        }

        // Grouper l'historique par rendez-vous pour obtenir le statut final réel
        const latestStatusMap = new Map<string, any>();
        
        // Trier du plus ancien au plus récent, ainsi le dernier inséré écrase les précédents
        const sortedHistory = [...historyData].sort(
          (a, b) => new Date(a.dateModification).getTime() - new Date(b.dateModification).getTime()
        );

        sortedHistory.forEach((item) => {
          // Si rendezVousId est null (rendez-vous supprimé), on génère une clé composite unique
          const key = item.rendezVousId 
            ? `rdv-${item.rendezVousId}` 
            : `deleted-${item.patientId}-${item.dentisteId}-${item.date}-${item.heureDebut}`;
          latestStatusMap.set(key, item);
        });

        let countEffectue = 0;
        let countAnnule = 0;
        let countReporte = 0;
        let countAbsent = 0;

        Array.from(latestStatusMap.values()).forEach((item) => {
          const status = item.nouveauStatut?.toString().toLowerCase() || "";
          
          if (status.includes("effectu") || status === "3" || (status === "4" && !status.includes("absent"))) {
             countEffectue++;
          } else if (status.includes("annul") || status === "2") {
             countAnnule++;
          } else if (status.includes("report") || status === "5" || status === "6") {
             countReporte++;
          } else if (status.includes("absent") || status === "4") {
             countAbsent++;
          }
        });

        const sumStatuts = countEffectue + countAnnule + countReporte + countAbsent;
        const divisor = sumStatuts > 0 ? sumStatuts : 1;

        const newStatusData = [
          {
            name: "Effectué",
            value: Math.round((countEffectue / divisor) * 100),
            fill: "green",
          },
          {
            name: "Annulé",
            value: Math.round((countAnnule / divisor) * 100),
            fill: "red",
          },
          {
            name: "Reporté",
            value: Math.round((countReporte / divisor) * 100),
            fill: "blue",
          },
          {
            name: "Absent",
            value: Math.round((countAbsent / divisor) * 100),
            fill: "black",
          },
        ];

        setStatusData(newStatusData);

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
          title={t("sidebar.dashboard")}
          subtitle={secretaireDashboardConfig.subtitle}
        />

        <StatsCards items={stats} />

        <div className="space-y-8">
          <DashboardCharts weeklyData={weeklyData} statusData={statusData} />
        </div>
      </div>
    </>
  );
}