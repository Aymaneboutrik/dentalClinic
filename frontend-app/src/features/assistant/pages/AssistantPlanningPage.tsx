import React, { useEffect, useState } from "react";
import { DashboardHeader } from "../../../components/commons/dashboard/DashboardHeader";
import { Calendar, Clock, User, ShieldCheck, AlertCircle } from "lucide-react";
import { getPlannings, type ApiError } from "../services/planning.service";
import {
  getEmployees,
  type AssistantEmployee,
} from "../services/personnel.service";
import type { Planning } from "../../../types/planning/planning";

type EmployeePlanningGroup = {
  fullName: string;
  role: string;
  horaires: Planning[];
};

const AssistantPlanningPage = () => {
  const [plannings, setPlannings] = useState<Planning[]>([]);
  const [employees, setEmployees] = useState<AssistantEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const days = [
    "Lundi",
    "Mardi",
    "Mercredi",
    "Jeudi",
    "Vendredi",
    "Samedi",
    "Dimanche",
  ];

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [planningData, employeesData] = await Promise.all([
        getPlannings(),
        getEmployees(),
      ]);

      setPlannings(Array.isArray(planningData) ? planningData : []);
      setEmployees(Array.isArray(employeesData) ? employeesData : []);
    } catch (err) {
      console.error("Erreur fetch planning assistant:", err);
      const apiError = err as ApiError;
      setError(apiError?.message || "Erreur lors du chargement du planning.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const groupedByEmployee: Record<string, EmployeePlanningGroup> = {};

  employees.forEach((emp) => {
    const fullName = `${String(emp?.nom ?? "")} ${String(
      emp?.prenom ?? ""
    )}`.trim();

    groupedByEmployee[fullName] = {
      fullName,
      role: String(emp?.nomRole ?? ""),
      horaires: [],
    };
  });

  plannings.forEach((planning) => {
    const fullName = `${String(planning?.nom ?? "")} ${String(
      planning?.prenom ?? ""
    )}`.trim();

    if (!groupedByEmployee[fullName]) {
      groupedByEmployee[fullName] = {
        fullName,
        role: String(planning?.role ?? ""),
        horaires: [],
      };
    }

    groupedByEmployee[fullName].horaires.push(planning);
  });

  const employeeGroups = Object.values(groupedByEmployee);

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <DashboardHeader
          title="Planning Hebdomadaire"
          subtitle="Consultez les horaires de travail de toute l'équipe"
        />
        
        <div className="flex items-center space-x-3 md:mb-10">
          <div className="glass border-white/5 px-6 py-3 rounded-2xl flex items-center space-x-3 shadow-lg">
             <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                <Clock className="w-4 h-4" />
             </div>
             <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Vue d'ensemble</p>
                <p className="text-sm font-bold text-foreground">Planning Clinique</p>
             </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="glass border-red-500/20 bg-red-500/10 p-4 rounded-2xl flex items-center space-x-3 animate-in fade-in slide-in-from-top-2 duration-300">
           <AlertCircle className="w-5 h-5 text-red-500" />
           <p className="text-sm text-red-500 font-medium">{error}</p>
        </div>
      )}

      <div className="glass border-white/5 shadow-2xl organic-card overflow-hidden">
        <div className="flex items-center justify-between px-8 py-6 border-b border-white/5">
          <h3 className="text-lg font-bold flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-primary" />
            <span>Calendrier de l'Équipe</span>
          </h3>
        </div>

        <div className="p-0 overflow-x-auto">
          {loading ? (
            <div className="py-20 text-center flex flex-col items-center justify-center space-y-4">
               <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
               <p className="text-muted-foreground font-medium animate-pulse">Synchronisation du planning...</p>
            </div>
          ) : employeeGroups.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground/30">
                <Calendar className="w-8 h-8" />
              </div>
              <p className="text-muted-foreground font-medium">Aucun planning disponible</p>
            </div>
          ) : (
            <div className="min-w-[1200px]">
              {/* Header */}
              <div className="grid grid-cols-8 border-b border-white/5 bg-white/5">
                <div className="px-8 py-5 text-xs font-black uppercase tracking-widest text-muted-foreground">Employé</div>
                {days.map((day) => (
                  <div key={day} className="px-4 py-5 text-xs font-black uppercase tracking-widest text-center text-muted-foreground">
                    {day}
                  </div>
                ))}
              </div>

              {/* Rows */}
              <div className="divide-y divide-white/5">
                {employeeGroups.map((employee) => (
                  <div key={employee.fullName} className="grid grid-cols-8 hover:bg-white/[0.02] transition-colors group">
                    {/* Employee Info */}
                    <div className="px-8 py-6 border-r border-white/5 flex flex-col justify-center space-y-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                          {employee.fullName?.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-foreground text-sm truncate" title={employee.fullName}>
                          {employee.fullName}
                        </span>
                      </div>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-500/10 text-blue-500 w-fit border border-blue-500/10">
                        {employee.role || "Membre"}
                      </span>
                    </div>

                    {/* Days */}
                    {days.map((day) => {
                      const horairesDuJour = employee.horaires.filter(
                        (x) => String(x?.jour ?? "") === day
                      );
                      const isSunday = day === "Dimanche";

                      return (
                        <div key={`${employee.fullName}-${day}`} className="px-3 py-6 border-r border-white/5 last:border-r-0 flex flex-col justify-center items-center space-y-2">
                          {horairesDuJour.length > 0 ? (
                            horairesDuJour.map((horaire) => (
                              <div key={horaire.idHoraire} className="w-full">
                                <div className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-xl text-center shadow-lg shadow-emerald-500/5 group-hover:scale-105 transition-transform">
                                  <span className="block text-[10px] font-black text-emerald-500 uppercase tracking-tighter">
                                    {String(horaire?.heureDebut ?? "").slice(0, 5)} - {String(horaire?.heureFin ?? "").slice(0, 5)}
                                  </span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${
                              isSunday 
                                ? "bg-red-500/10 border-red-500/20 text-red-500 opacity-80" 
                                : "bg-white/5 border-white/5 text-muted-foreground/40"
                            }`}>
                              Repos
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssistantPlanningPage;