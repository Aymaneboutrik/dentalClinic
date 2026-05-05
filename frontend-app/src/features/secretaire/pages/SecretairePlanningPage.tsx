import React, { useEffect, useState } from "react";
import { getPlannings, type ApiError } from "../services/planning.service";
import {
  getEmployees,
  type SecretaireEmployee,
} from "../services/personnel.service";
import type { Planning } from "../../../types/planning/planning";
import { DashboardHeader } from "@components/commons/dashboard/DashboardHeader";
import { Calendar, Clock, User, ShieldCheck, Info, Search, Filter, Layers, Coffee } from "lucide-react";
import { toast } from "sonner";

type EmployeePlanningGroup = {
  fullName: string;
  role: string;
  horaires: Planning[];
};

const SecretairePlanningPage = () => {
  const [plannings, setPlannings] = useState<Planning[]>([]);
  const [employees, setEmployees] = useState<SecretaireEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

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
      const apiError = err as ApiError;
      setError(apiError?.message || "Erreur lors du chargement du planning.");
      toast.error("Impossible de récupérer les horaires.");
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

  const employeeGroups = Object.values(groupedByEmployee).filter(emp => 
    emp.fullName.toLowerCase().includes(search.toLowerCase()) ||
    emp.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <DashboardHeader
          title="Horaires Clinique"
          subtitle="Consultez le planning hebdomadaire de toute l'équipe"
        />
        
        <div className="flex items-center space-x-3 md:mb-10">
          <div className="glass border-white/5 px-6 py-3 rounded-2xl flex items-center space-x-3 shadow-lg">
             <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                <Layers className="w-4 h-4" />
             </div>
             <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Effectif</p>
                <p className="text-sm font-bold text-foreground">{employees.length} Employés</p>
             </div>
          </div>
        </div>
      </div>

      <div className="glass border-white/5 shadow-2xl organic-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between px-8 py-6 border-b border-white/5 gap-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-lg text-white">Vue Hebdomadaire</h3>
            <span className="text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/10">Synchronisé</span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                className="bg-white/5 border border-white/5 rounded-xl pl-12 pr-4 py-2.5 text-sm outline-none focus:border-primary/50 transition-all w-64"
                placeholder="Filtrer par nom..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button onClick={fetchData} className="p-2.5 rounded-xl border border-white/5 hover:bg-white/5 text-muted-foreground transition-all">
               <Clock className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-2 md:p-4">
          {loading ? (
             <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                <p className="text-sm font-medium text-muted-foreground">Chargement des horaires...</p>
             </div>
          ) : error ? (
            <div className="p-10 text-center">
               <div className="bg-rose-500/10 border border-rose-500/20 p-6 rounded-3xl inline-block">
                  <ShieldCheck className="w-8 h-8 text-rose-500 mx-auto mb-2" />
                  <p className="text-rose-500 font-bold">{error}</p>
               </div>
            </div>
          ) : employeeGroups.length === 0 ? (
            <div className="p-20 text-center text-muted-foreground italic">
               <Info className="w-10 h-10 mx-auto mb-3 opacity-20" />
               <p>Aucun planning ne correspond à votre recherche.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-[32px]">
              <div className="min-w-[1200px]">
                <div className="grid grid-cols-8 bg-white/5 border-b border-white/5">
                  <div className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground border-r border-white/5">
                    Membre de l'équipe
                  </div>
                  {days.map((day) => (
                    <div key={day} className="px-3 py-5 text-[10px] font-black uppercase tracking-widest text-center text-muted-foreground border-r border-white/5 last:border-r-0">
                      {day}
                    </div>
                  ))}
                </div>

                {employeeGroups.map((employee, idx) => (
                  <div key={employee.fullName} className={`grid grid-cols-8 group hover:bg-white/[0.02] transition-colors ${idx !== employeeGroups.length - 1 ? "border-b border-white/5" : ""}`}>
                    <div className="px-6 py-6 border-r border-white/5 flex flex-col justify-center">
                      <span className="font-bold text-sm text-foreground mb-1">{employee.fullName || "---"}</span>
                      <span className="text-[9px] font-black uppercase tracking-widest text-primary/60 px-2 py-0.5 bg-primary/10 rounded-full border border-primary/10 w-fit">
                        {employee.role || "---"}
                      </span>
                    </div>

                    {days.map((day) => {
                      const horaires = employee.horaires.filter(x => String(x?.jour ?? "") === day);
                      const isSunday = day === "Dimanche";

                      return (
                        <div key={`${employee.fullName}-${day}`} className="px-3 py-6 border-r border-white/5 last:border-r-0 flex flex-col justify-center items-center gap-2">
                          {horaires.length > 0 ? (
                            horaires.map((h) => (
                              <div key={h.idHoraire} className="w-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-xl flex flex-col items-center group/time transition-all hover:scale-105">
                                 <Clock className="w-3 h-3 text-emerald-500/60 mb-1" />
                                 <span className="text-[11px] font-black text-emerald-500 tracking-tight">
                                    {String(h?.heureDebut ?? "").slice(0, 5)} - {String(h?.heureFin ?? "").slice(0, 5)}
                                 </span>
                              </div>
                            ))
                          ) : (
                            <div className={`w-full py-2 px-3 rounded-xl border flex flex-col items-center justify-center gap-1 ${
                              isSunday ? "bg-rose-500/10 border-rose-500/20 text-rose-500/40" : "bg-white/5 border-white/5 text-muted-foreground/30"
                            }`}>
                               <Coffee className="w-3 h-3 opacity-50" />
                               <span className="text-[9px] font-black uppercase tracking-widest">Repos</span>
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
      
      <div className="glass border-white/5 p-6 rounded-[32px] flex items-start space-x-4 bg-primary/5">
         <div className="p-2 bg-primary/20 rounded-xl text-primary mt-1">
            <Info className="w-4 h-4" />
         </div>
         <div>
            <h4 className="text-sm font-bold text-foreground">Note aux Secrétaires</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">Cette vue est synchronisée en temps réel avec le service du personnel. Toute modification des horaires effectuée par la direction sera immédiatement reflétée ici pour l'organisation des rendez-vous.</p>
         </div>
      </div>
    </div>
  );
};

export default SecretairePlanningPage;