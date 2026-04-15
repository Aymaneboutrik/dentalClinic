import React, { useEffect, useState } from "react";
import {
  getPlannings,
  createPlanning,
  updatePlanning,
  deletePlanning,
  type CreatePlanningRequest,
  type UpdatePlanningRequest,
  type ApiError,
} from "../services/planning.service";
import { getEmployees } from "../services/personnel.service";
import type { Planning } from "../../../types/planning/planning";
import type { Employee } from "../../../types/employee/employee";

type EmployeePlanningGroup = {
  fullName: string;
  role: string;
  horaires: Planning[];
};

type FormDataType = {
  idEmploye: number;
  jour: string;
  heureDebut: string;
  heureFin: string;
};

type FormFieldErrors = {
  idEmploye?: string;
  jour?: string;
  heureDebut?: string;
  heureFin?: string;
};

const PlanningPage = () => {
  const [plannings, setPlannings] = useState<Planning[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showAddForm, setShowAddForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingPlanningId, setEditingPlanningId] = useState<number | null>(
    null
  );

  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FormFieldErrors>({});
  const [openedActionId, setOpenedActionId] = useState<number | null>(null);

  const initialFormData: FormDataType = {
    idEmploye: 0,
    jour: "",
    heureDebut: "",
    heureFin: "",
  };

  const [formData, setFormData] = useState<FormDataType>(initialFormData);

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
      console.error("Erreur fetch planning:", err);
      const apiError = err as ApiError;
      setError(apiError?.message || "Erreur lors du chargement.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetFormState = () => {
    setFormData(initialFormData);
    setFormError(null);
    setFieldErrors({});
    setIsEditMode(false);
    setEditingPlanningId(null);
  };

  const handleOpenAddForm = () => {
    resetFormState();
    setSuccessMessage(null);
    setOpenedActionId(null);
    setShowAddForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleCancel = () => {
    setShowAddForm(false);
    resetFormState();
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "idEmploye" ? Number(value) : value,
    }));

    setFieldErrors((prev) => ({
      ...prev,
      [name]: undefined,
    }));
  };

  const validateForm = (): FormFieldErrors => {
    const errors: FormFieldErrors = {};

    if (formData.idEmploye === 0) {
      errors.idEmploye = "L'employé est obligatoire.";
    }

    if (!formData.jour.trim()) {
      errors.jour = "Le jour est obligatoire.";
    }

    if (!formData.heureDebut.trim()) {
      errors.heureDebut = "L'heure de début est obligatoire.";
    }

    if (!formData.heureFin.trim()) {
      errors.heureFin = "L'heure de fin est obligatoire.";
    }

    if (
      formData.heureDebut.trim() &&
      formData.heureFin.trim() &&
      formData.heureDebut >= formData.heureFin
    ) {
      errors.heureDebut =
        "L'heure de début doit être inférieure à l'heure de fin.";
      errors.heureFin =
        "L'heure de fin doit être supérieure à l'heure de début.";
    }

    return errors;
  };

  const mapBackendErrorsToFields = (
    errors?: Record<string, string[]>
  ): FormFieldErrors => {
    if (!errors) return {};

    return {
      idEmploye: errors.IdEmploye?.[0] || errors.idEmploye?.[0],
      jour: errors.Jour?.[0] || errors.jour?.[0],
      heureDebut: errors.HeureDebut?.[0] || errors.heureDebut?.[0],
      heureFin: errors.HeureFin?.[0] || errors.heureFin?.[0],
    };
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setActionLoading(true);
      setFormError(null);
      setSuccessMessage(null);
      setFieldErrors({});

      const frontendErrors = validateForm();

      if (Object.keys(frontendErrors).length > 0) {
        setFieldErrors(frontendErrors);
        setFormError("Veuillez corriger les champs du formulaire.");
        return;
      }

      if (isEditMode && editingPlanningId !== null) {
        const updatePayload: UpdatePlanningRequest = {
          jour: formData.jour,
          heureDebut: formData.heureDebut,
          heureFin: formData.heureFin,
        };

        await updatePlanning(editingPlanningId, updatePayload);
        await fetchData();

        setSuccessMessage("Horaire modifié avec succès.");
      } else {
        const createPayload: CreatePlanningRequest = {
          idEmploye: formData.idEmploye,
          jour: formData.jour,
          heureDebut: formData.heureDebut,
          heureFin: formData.heureFin,
        };

        await createPlanning(createPayload);
        await fetchData();

        setSuccessMessage("Horaire ajouté avec succès.");
      }

      setShowAddForm(false);
      resetFormState();
      setOpenedActionId(null);
    } catch (err) {
      console.error("Erreur submit planning:", err);

      const apiError = err as ApiError;
      const mappedErrors = mapBackendErrorsToFields(apiError?.errors);

      setFieldErrors(mappedErrors);

      const hasFieldErrors = Object.values(mappedErrors).some(Boolean);

      if (hasFieldErrors) {
        setFormError("Veuillez corriger les champs du formulaire.");
      } else {
        setFormError(
          apiError?.message ||
            (isEditMode
              ? "Impossible de modifier l'horaire."
              : "Impossible d'ajouter l'horaire.")
        );
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = (horaire: Planning) => {
    setFormError(null);
    setSuccessMessage(null);
    setFieldErrors({});
    setOpenedActionId(null);

    setFormData({
      idEmploye: Number(horaire?.idEmploye ?? 0),
      jour: String(horaire?.jour ?? ""),
      heureDebut: String(horaire?.heureDebut ?? "").slice(0, 5),
      heureFin: String(horaire?.heureFin ?? "").slice(0, 5),
    });

    setEditingPlanningId(Number(horaire?.idHoraire ?? 0));
    setIsEditMode(true);
    setShowAddForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      "Voulez-vous vraiment supprimer cet horaire ?"
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);
      setSuccessMessage(null);
      setError(null);
      setOpenedActionId(null);

      await deletePlanning(id);
      await fetchData();

      if (editingPlanningId === id) {
        setShowAddForm(false);
        resetFormState();
      }

      setSuccessMessage("Horaire supprimé avec succès.");
    } catch (err) {
      console.error("Erreur delete planning:", err);
      const apiError = err as ApiError;
      setError(apiError?.message || "Impossible de supprimer l'horaire.");
    } finally {
      setActionLoading(false);
    }
  };

  const groupedByEmployee: Record<string, EmployeePlanningGroup> = {};

  employees.forEach((emp) => {
    const fullName = `${String(emp?.nom ?? "")} ${String(emp?.prenom ?? "")}`;

    groupedByEmployee[fullName] = {
      fullName,
      role: String(emp?.nomRole ?? ""),
      horaires: [],
    };
  });

  plannings.forEach((planning) => {
    const fullName = `${String(planning?.nom ?? "")} ${String(
      planning?.prenom ?? ""
    )}`;

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
              Gestion des horaires
            </h1>
            <p className="text-sm text-muted-foreground">
              Consultez le planning hebdomadaire des employés de la clinique.
            </p>
          </div>

          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <div className="px-4 py-3 text-sm text-blue-400 border rounded-2xl border-blue-500/20 bg-blue-500/10">
              <span className="font-semibold">{plannings.length}</span>{" "}
              créneau{plannings.length > 1 ? "x" : ""} affiché
              {plannings.length > 1 ? "s" : ""}
            </div>

            <button
              type="button"
              onClick={handleOpenAddForm}
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500"
            >
              Ajouter un horaire
            </button>
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="px-4 py-3 text-sm border rounded-2xl border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
          {successMessage}
        </div>
      )}

      {showAddForm && (
        <div className="rounded-2xl border border-white/10 bg-[#081028] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white">
              {isEditMode ? "Modifier un horaire" : "Ajouter un horaire"}
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              {isEditMode
                ? "Modifiez les informations de l’horaire."
                : "Définissez un nouvel horaire pour un employé."}
            </p>
          </div>

          {formError && (
            <p className="mb-4 text-sm text-red-500">{formError}</p>
          )}

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 gap-5 md:grid-cols-2"
          >
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">
                Employé
              </label>
              <select
                name="idEmploye"
                value={formData.idEmploye}
                onChange={handleChange}
                disabled={isEditMode}
                className={`w-full rounded-xl border bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:bg-blue-500/5 disabled:cursor-not-allowed disabled:opacity-70 ${
                  fieldErrors.idEmploye
                    ? "border-red-500/50 focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]"
                    : "border-blue-500/20 focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)]"
                }`}
              >
                <option value={0} className="bg-[#0B1739] text-white">
                  Sélectionner un employé
                </option>
                {employees.map((employee) => (
                  <option
                    key={employee.idEmploye}
                    value={employee.idEmploye}
                    className="bg-[#0B1739] text-white"
                  >
                    {employee.nom} {employee.prenom} - {employee.nomRole}
                  </option>
                ))}
              </select>
              {fieldErrors.idEmploye && (
                <p className="text-sm text-red-500">{fieldErrors.idEmploye}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">Jour</label>
              <select
                name="jour"
                value={formData.jour}
                onChange={handleChange}
                className={`w-full rounded-xl border bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:bg-blue-500/5 ${
                  fieldErrors.jour
                    ? "border-red-500/50 focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]"
                    : "border-blue-500/20 focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)]"
                }`}
              >
                <option value="" className="bg-[#0B1739] text-white">
                  Sélectionner un jour
                </option>
                {days.map((day) => (
                  <option
                    key={day}
                    value={day}
                    className="bg-[#0B1739] text-white"
                  >
                    {day}
                  </option>
                ))}
              </select>
              {fieldErrors.jour && (
                <p className="text-sm text-red-500">{fieldErrors.jour}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">
                Heure de début
              </label>
              <input
                type="time"
                name="heureDebut"
                value={formData.heureDebut}
                onChange={handleChange}
                className={`w-full rounded-xl border bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:bg-blue-500/5 ${
                  fieldErrors.heureDebut
                    ? "border-red-500/50 focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]"
                    : "border-blue-500/20 focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)]"
                }`}
              />
              {fieldErrors.heureDebut && (
                <p className="text-sm text-red-500">{fieldErrors.heureDebut}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">
                Heure de fin
              </label>
              <input
                type="time"
                name="heureFin"
                value={formData.heureFin}
                onChange={handleChange}
                className={`w-full rounded-xl border bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:bg-blue-500/5 ${
                  fieldErrors.heureFin
                    ? "border-red-500/50 focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]"
                    : "border-blue-500/20 focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)]"
                }`}
              />
              {fieldErrors.heureFin && (
                <p className="text-sm text-red-500">{fieldErrors.heureFin}</p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2 md:col-span-2">
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/10"
              >
                Annuler
              </button>

              <button
                type="submit"
                disabled={actionLoading}
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isEditMode ? "Mettre à jour" : "Enregistrer"}
              </button>
            </div>
          </form>
        </div>
      )}

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
                          {employee.fullName}
                        </span>
                        <span className="inline-flex items-center px-3 py-1 mt-2 text-xs font-medium text-blue-400 border rounded-full w-fit border-blue-500/20 bg-blue-500/10">
                          {employee.role}
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
                                const isOpened = openedActionId === horaireId;

                                return (
                                  <div key={horaireId} className="relative">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setOpenedActionId((prev) =>
                                          prev === horaireId ? null : horaireId
                                        )
                                      }
                                      className="w-full px-3 py-2 text-center transition border shadow-sm rounded-xl border-emerald-500/20 bg-emerald-500/10 hover:bg-emerald-500/15"
                                    >
                                      <span className="block text-xs font-medium text-emerald-300">
                                        {String(
                                          horaire?.heureDebut ?? ""
                                        ).slice(0, 5)}{" "}
                                        -{" "}
                                        {String(horaire?.heureFin ?? "").slice(
                                          0,
                                          5
                                        )}
                                      </span>
                                    </button>

                                    <div
                                      className={`mt-2 overflow-hidden transition-all duration-200 ${
                                        isOpened
                                          ? "max-h-28 opacity-100"
                                          : "max-h-0 opacity-0"
                                      }`}
                                    >
                                      <div className="grid grid-cols-1 gap-2">
                                        <button
                                          type="button"
                                          onClick={() => handleEdit(horaire)}
                                          className="w-full px-3 py-2 text-xs font-semibold text-blue-400 transition border rounded-lg border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 hover:text-blue-300"
                                        >
                                          Modifier
                                        </button>

                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleDelete(horaireId)
                                          }
                                          className="w-full px-3 py-2 text-xs font-semibold text-red-400 transition border rounded-lg border-red-500/30 bg-red-500/10 hover:bg-red-500/20 hover:text-red-300"
                                        >
                                          Supprimer
                                        </button>
                                      </div>
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

export default PlanningPage;