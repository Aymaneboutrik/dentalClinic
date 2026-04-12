import React, { useEffect, useState } from "react";
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
    <div className="w-full space-y-8">
      <div className="p-6 border shadow-sm rounded-2xl border-white/10 bg-card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-primary">Planning</p>
            <h1 className="text-3xl font-bold tracking-tight">
              Consultation des horaires
            </h1>
            <p className="text-sm text-muted-foreground">
              Consultez le planning hebdomadaire des employés de la clinique.
            </p>
          </div>

          <div className="px-4 py-3 text-sm text-blue-400 border rounded-2xl border-blue-500/20 bg-blue-500/10">
            <span className="font-semibold">{plannings.length}</span> créneau
            {plannings.length > 1 ? "x" : ""} affiché
            {plannings.length > 1 ? "s" : ""}
          </div>
        </div>
      </div>

      <div className="overflow-hidden border shadow-sm rounded-2xl border-white/10 bg-card">
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Planning hebdomadaire des employés
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Vue globale organisée par employé et par jour.
            </p>
          </div>
        </div>

        <div className="p-4 md:p-6">
          {loading ? (
            <div className="px-4 py-10 text-sm text-center border rounded-2xl border-white/10 bg-white/5 text-muted-foreground">
              Chargement du planning...
            </div>
          ) : error ? (
            <div className="px-4 py-10 text-sm text-center text-red-400 border rounded-2xl border-red-500/20 bg-red-500/10">
              {error}
            </div>
          ) : employeeGroups.length === 0 ? (
            <div className="px-4 py-10 text-sm text-center border rounded-2xl border-white/10 bg-white/5 text-muted-foreground">
              Aucun planning à afficher pour le moment.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-[1160px] rounded-2xl border border-white/10 bg-[#081028]">
                <div className="grid grid-cols-8 border-b border-white/10 bg-white/5">
                  <div className="flex items-center px-4 py-4 text-sm font-semibold border-r border-white/10 text-slate-300">
                    Employé
                  </div>

                  {days.map((day) => (
                    <div
                      key={day}
                      className="flex items-center justify-center px-3 py-4 text-sm font-semibold text-center border-r border-white/10 text-slate-200 last:border-r-0"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {employeeGroups.map((employee, index) => (
                  <React.Fragment key={employee.fullName}>
                    <div
                      className={`grid grid-cols-8 ${
                        index !== employeeGroups.length - 1
                          ? "border-b border-white/10"
                          : ""
                      }`}
                    >
                      <div className="flex min-h-[92px] flex-col justify-center border-r border-white/10 px-4 py-4">
                        <span className="text-sm font-semibold text-white">
                          {employee.fullName || "-"}
                        </span>
                        <span className="inline-flex items-center px-3 py-1 mt-2 text-xs font-medium text-blue-400 border rounded-full w-fit border-blue-500/20 bg-blue-500/10">
                          {employee.role || "-"}
                        </span>
                      </div>

                      {days.map((day) => {
                        const horairesDuJour = employee.horaires.filter(
                          (x) => String(x?.jour ?? "") === day
                        );

                        const isSunday = day === "Dimanche";

                        return (
                          <div
                            key={`${employee.fullName}-${day}`}
                            className="flex min-h-[110px] flex-col justify-center gap-2 border-r border-white/10 px-3 py-3 last:border-r-0"
                          >
                            {horairesDuJour.length > 0 ? (
                              horairesDuJour.map((horaire) => {
                                const horaireId = Number(
                                  horaire?.idHoraire ?? 0
                                );

                                return (
                                  <div key={horaireId}>
                                    <div className="w-full px-3 py-2 text-center border shadow-sm rounded-xl border-emerald-500/20 bg-emerald-500/10">
                                      <span className="block text-xs font-medium text-emerald-300">
                                        {String(horaire?.heureDebut ?? "").slice(
                                          0,
                                          5
                                        )}{" "}
                                        -{" "}
                                        {String(horaire?.heureFin ?? "").slice(
                                          0,
                                          5
                                        )}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })
                            ) : (
                              <div
                                className={`rounded-lg px-2 py-1 text-center text-sm font-medium ${
                                  isSunday
                                    ? "border border-red-500/30 bg-red-500/20 text-red-400"
                                    : "border border-red-500/20 bg-red-500/10 text-red-300"
                                }`}
                              >
                                OFF
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </React.Fragment>
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