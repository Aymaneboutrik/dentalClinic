import { useEffect, useState } from "react";
import type {
  Absence,
  CreateAbsenceRequest,
} from "../../../types/absence/absence";
import {
  getAbsences,
  createAbsence,
  deleteAbsence,
  type ApiError,
} from "../services/absence.service";

type FormDataType = {
  dateDebut: string;
  dateFin: string;
  typeAbsence: string;
  employeId: number;
};

type FormFieldErrors = {
  dateDebut?: string;
  dateFin?: string;
  typeAbsence?: string;
  employeId?: string;
};

const formatDate = (dateValue?: string | null): string => {
  if (!dateValue) return "-";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("fr-FR");
};

const isSameDayAbsence = (
  dateDebut?: string | null,
  dateFin?: string | null
): boolean => {
  const formattedDateDebut = formatDate(dateDebut);
  const formattedDateFin = formatDate(dateFin);

  if (formattedDateDebut === "-" || formattedDateFin === "-") {
    return false;
  }

  return formattedDateDebut === formattedDateFin;
};

const AbsencePage = () => {
  const initialFormData: FormDataType = {
    dateDebut: "",
    dateFin: "",
    typeAbsence: "",
    employeId: 0,
  };

  const [absences, setAbsences] = useState<Absence[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<FormDataType>(initialFormData);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FormFieldErrors>({});

  const fetchAbsences = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getAbsences();
      setAbsences(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      const apiError = error as ApiError;
      setError(apiError.message || "Impossible de charger les absences.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAbsences();
  }, []);

  const resetFormState = () => {
    setFormData(initialFormData);
    setFormError(null);
    setFieldErrors({});
  };

  const handleOpenAddForm = () => {
    resetFormState();
    setSuccessMessage(null);
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
      [name]: name === "employeId" ? Number(value) : value,
    }));

    setFieldErrors((prev) => ({
      ...prev,
      [name]: undefined,
    }));
  };

  const validateForm = (): FormFieldErrors => {
    const errors: FormFieldErrors = {};

    if (!formData.dateDebut.trim()) {
      errors.dateDebut = "La date de début est obligatoire.";
    }

    if (!formData.dateFin.trim()) {
      errors.dateFin = "La date de fin est obligatoire.";
    }

    if (
      formData.dateDebut.trim() &&
      formData.dateFin.trim() &&
      formData.dateDebut > formData.dateFin
    ) {
      errors.dateFin = "La date de fin doit être supérieure à la date de début.";
    }

    if (!formData.typeAbsence.trim()) {
      errors.typeAbsence = "Le type d’absence est obligatoire.";
    }

    if (formData.employeId <= 0) {
      errors.employeId = "L'identifiant de l'employé doit être valide.";
    }

    return errors;
  };

  const mapBackendErrorsToFields = (
    errors?: Record<string, string[]>
  ): FormFieldErrors => {
    if (!errors) return {};

    return {
      dateDebut: errors.DateDebut?.[0] || errors.dateDebut?.[0],
      dateFin: errors.DateFin?.[0] || errors.dateFin?.[0],
      typeAbsence: errors.TypeAbsence?.[0] || errors.typeAbsence?.[0],
      employeId: errors.EmployeId?.[0] || errors.employeId?.[0],
    };
  };

  const handleDelete = async (idAbsence: number) => {
    const confirmed = window.confirm(
      "Voulez-vous vraiment supprimer cette absence ?"
    );

    if (!confirmed) return;

    try {
      setSuccessMessage(null);
      setError(null);

      const result = await deleteAbsence(idAbsence);
      await fetchAbsences();

      setSuccessMessage(result.message || "Absence supprimée avec succès.");
    } catch (error) {
      console.error(error);
      const apiError = error as ApiError;
      setError(apiError.message || "Impossible de supprimer l'absence.");
    }
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

      const payload: CreateAbsenceRequest = {
        dateDebut: formData.dateDebut,
        dateFin: formData.dateFin,
        typeAbsence: formData.typeAbsence,
        employeId: formData.employeId,
      };

      const result = await createAbsence(payload);

      await fetchAbsences();

      setSuccessMessage(result.message || "Absence ajoutée avec succès.");
      setShowAddForm(false);
      resetFormState();
    } catch (error) {
      console.error(error);

      const apiError = error as ApiError;
      const mappedErrors = mapBackendErrorsToFields(apiError.errors);

      setFieldErrors(mappedErrors);

      const hasFieldErrors = Object.values(mappedErrors).some(Boolean);

      if (hasFieldErrors) {
        setFormError("Veuillez corriger les champs du formulaire.");
      } else {
        setFormError(apiError.message || "Impossible d'ajouter l'absence.");
      }
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="w-full space-y-8">
      <div className="p-8 border shadow-2xl organic-card bg-card/40 backdrop-blur-md border-white/5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-primary uppercase tracking-widest">
              Gestion des absences
            </p>
            <h1 className="text-3xl font-black tracking-tight">
              Absences des employés
            </h1>
          </div>

          <button
            type="button"
            onClick={handleOpenAddForm}
            className="organic-button bg-blue-600 px-8 py-2.5 text-[10px] font-black uppercase tracking-widest text-white transition hover:bg-blue-500 shadow-lg shadow-blue-500/20"
          >
            Ajouter une absence
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="px-4 py-3 text-sm border rounded-2xl border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
          {successMessage}
        </div>
      )}

      {showAddForm && (
        <div className="organic-card border border-white/10 bg-[#081028]/80 backdrop-blur-xl p-8 shadow-2xl">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white">
              Ajouter une absence
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Remplissez les informations de la nouvelle absence.
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
                Date début
              </label>
              <input
                type="date"
                name="dateDebut"
                value={formData.dateDebut}
                onChange={handleChange}
                className={`w-full rounded-xl border bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:bg-blue-500/5 ${
                  fieldErrors.dateDebut
                    ? "border-red-500/50 focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]"
                    : "border-blue-500/20 focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)]"
                }`}
              />
              {fieldErrors.dateDebut && (
                <p className="text-sm text-red-500">{fieldErrors.dateDebut}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">
                Date fin
              </label>
              <input
                type="date"
                name="dateFin"
                value={formData.dateFin}
                onChange={handleChange}
                className={`w-full rounded-xl border bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:bg-blue-500/5 ${
                  fieldErrors.dateFin
                    ? "border-red-500/50 focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]"
                    : "border-blue-500/20 focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)]"
                }`}
              />
              {fieldErrors.dateFin && (
                <p className="text-sm text-red-500">{fieldErrors.dateFin}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">
                Type d’absence
              </label>
              <input
                type="text"
                name="typeAbsence"
                value={formData.typeAbsence}
                onChange={handleChange}
                placeholder="Ex : Congé annuel"
                className={`w-full rounded-xl border bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:bg-blue-500/5 ${
                  fieldErrors.typeAbsence
                    ? "border-red-500/50 focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]"
                    : "border-blue-500/20 focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)]"
                }`}
              />
              {fieldErrors.typeAbsence && (
                <p className="text-sm text-red-500">
                  {fieldErrors.typeAbsence}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">
                ID employé
              </label>
              <input
                type="number"
                name="employeId"
                value={formData.employeId || ""}
                onChange={handleChange}
                placeholder="Entrez l'identifiant de l'employé"
                className={`w-full rounded-xl border bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:bg-blue-500/5 ${
                  fieldErrors.employeId
                    ? "border-red-500/50 focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]"
                    : "border-blue-500/20 focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)]"
                }`}
              />
              {fieldErrors.employeId && (
                <p className="text-sm text-red-500">{fieldErrors.employeId}</p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2 md:col-span-2">
              <button
                type="button"
                onClick={handleCancel}
                className="organic-pill border border-white/10 bg-white/5 px-6 py-2.5 text-sm font-bold text-slate-200 transition hover:bg-white/10"
              >
                Annuler
              </button>

              <button
                type="submit"
                disabled={actionLoading}
                className="organic-button bg-blue-600 px-10 py-2.5 text-[10px] font-black uppercase tracking-widest text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-70 shadow-lg shadow-blue-500/20"
              >
                Enregistrer
              </button>
            </div>
          </form>
        </div>
      )}

      {error && (
        <div className="px-4 py-3 text-sm text-red-400 border rounded-2xl border-red-500/20 bg-red-500/10">
          {error}
        </div>
      )}

      <div className="border shadow-2xl organic-card bg-card/40 backdrop-blur-md border-white/5">
        <div className="flex items-center justify-between px-6 py-5 border-b">
          <div>
            <h2 className="text-lg font-semibold">Liste des absences</h2>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-sm">
            <thead className="bg-muted/30">
              <tr className="text-left border-b">
                <th className="px-6 py-4 font-semibold">Employé</th>
                <th className="px-6 py-4 font-semibold">Type d’absence</th>
                <th className="px-6 py-4 font-semibold">Date début</th>
                <th className="px-6 py-4 font-semibold">Date fin</th>
                <th className="px-6 py-4 font-semibold">Date validation</th>
                <th className="px-6 py-4 font-semibold text-center">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-sm text-center text-muted-foreground"
                  >
                    Chargement des absences...
                  </td>
                </tr>
              ) : error && absences.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-sm text-center text-red-500"
                  >
                    {error}
                  </td>
                </tr>
              ) : absences.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-sm text-center text-muted-foreground"
                  >
                    Aucune absence à afficher pour le moment.
                  </td>
                </tr>
              ) : (
                absences.map((absence) => (
                  <tr
                    key={absence.idAbsence}
                    className="transition duration-200 border-b border-white/10 hover:bg-white/5"
                  >
                    <td className="px-6 py-5 font-semibold text-white">
                      {String(absence.nom || "")} {String(absence.prenom || "")}
                    </td>

                    <td className="px-6 py-5 text-slate-300">
                      {String(absence.typeAbsence || "-")}
                    </td>

                    {isSameDayAbsence(absence.dateDebut, absence.dateFin) ? (
                      <td className="px-6 py-5 text-slate-300" colSpan={2}>
                        {formatDate(absence.dateDebut)}
                      </td>
                    ) : (
                      <>
                        <td className="px-6 py-5 text-slate-300">
                          {formatDate(absence.dateDebut)}
                        </td>

                        <td className="px-6 py-5 text-slate-300">
                          {formatDate(absence.dateFin)}
                        </td>
                      </>
                    )}

                    <td className="px-6 py-5 text-slate-300">
                      {formatDate(absence.dateValidation)}
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleDelete(absence.idAbsence)}
                          className="px-6 py-2 text-[9px] font-black uppercase tracking-widest text-red-400 transition border organic-pill border-red-500/30 bg-red-500/10 hover:bg-red-500 hover:text-white shadow-lg shadow-red-500/10"
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AbsencePage;