import { useEffect, useState } from "react";
import type {
  DemandeAbsence,
  CreateDemandeAbsenceRequest,
} from "../../../types/demandeAbsence/demandeAbsence";
import {
  createDemandeAbsence,
  getDemandesAbsenceByEmployeId,
  type ApiError,
} from "../services/demandeAbsence.service";

type FormDataType = {
  dateDebut: string;
  dateFin: string;
  typeDemande: string;
  motif: string;
};

type FormFieldErrors = {
  dateDebut?: string;
  dateFin?: string;
  typeDemande?: string;
  motif?: string;
};

const formatDate = (dateValue?: string | null): string => {
  if (!dateValue) return "-";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("fr-FR");
};

const getStatutBadgeClass = (statut?: string | null): string => {
  const normalizedStatut = String(statut || "").toLowerCase();

  if (
    normalizedStatut.includes("accept") ||
    normalizedStatut.includes("approuv")
  ) {
    return "border-emerald-500/20 bg-emerald-500/10 text-emerald-400";
  }

  if (normalizedStatut.includes("refus")) {
    return "border-red-500/20 bg-red-500/10 text-red-400";
  }

  return "border-amber-500/20 bg-amber-500/10 text-amber-400";
};

const AssistantDemandeAbsencePage = () => {
  const initialFormData: FormDataType = {
    dateDebut: "",
    dateFin: "",
    typeDemande: "",
    motif: "",
  };

  const [demandes, setDemandes] = useState<DemandeAbsence[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<FormDataType>(initialFormData);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FormFieldErrors>({});

  const fetchDemandes = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getDemandesAbsenceByEmployeId();
      setDemandes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      const apiError = error as ApiError;
      setError(
        apiError.message || "Impossible de charger les demandes d’absence."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDemandes();
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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
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
      errors.dateFin =
        "La date de fin doit être supérieure ou égale à la date de début.";
    }

    if (!formData.typeDemande.trim()) {
      errors.typeDemande = "Le type de demande est obligatoire.";
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
      typeDemande: errors.TypeDemande?.[0] || errors.typeDemande?.[0],
      motif: errors.Motif?.[0] || errors.motif?.[0],
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

      const payload: CreateDemandeAbsenceRequest = {
        dateDebut: formData.dateDebut,
        dateFin: formData.dateFin,
        typeDemande: formData.typeDemande,
        motif: formData.motif.trim() || null,
      };

      const result = await createDemandeAbsence(payload);

      await fetchDemandes();

      setSuccessMessage(
        result.message || "Demande d’absence envoyée avec succès."
      );
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
        setFormError(
          apiError.message || "Impossible d'envoyer la demande d’absence."
        );
      }
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="w-full space-y-8">
      <div className="p-6 border shadow-sm rounded-2xl bg-card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-primary">
              Gestion des demandes d’absence
            </p>
            <h1 className="text-3xl font-bold tracking-tight">
              Mes demandes d’absence
            </h1>
          </div>

          <button
            type="button"
            onClick={handleOpenAddForm}
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500"
          >
            Faire une demande
          </button>
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
              Nouvelle demande d’absence
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Remplissez les informations de votre demande.
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

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-200">
                Type de demande
              </label>
              <input
                type="text"
                name="typeDemande"
                value={formData.typeDemande}
                onChange={handleChange}
                placeholder="Ex : Congé annuel"
                className={`w-full rounded-xl border bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:bg-blue-500/5 ${
                  fieldErrors.typeDemande
                    ? "border-red-500/50 focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]"
                    : "border-blue-500/20 focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)]"
                }`}
              />
              {fieldErrors.typeDemande && (
                <p className="text-sm text-red-500">
                  {fieldErrors.typeDemande}
                </p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-200">
                Motif
              </label>
              <textarea
                name="motif"
                value={formData.motif}
                onChange={handleChange}
                rows={4}
                placeholder="Motif de la demande (optionnel)"
                className={`w-full rounded-xl border bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:bg-blue-500/5 ${
                  fieldErrors.motif
                    ? "border-red-500/50 focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]"
                    : "border-blue-500/20 focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)]"
                }`}
              />
              {fieldErrors.motif && (
                <p className="text-sm text-red-500">{fieldErrors.motif}</p>
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
                Envoyer
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

      <div className="border shadow-sm rounded-2xl bg-card">
        <div className="flex items-center justify-between px-6 py-5 border-b">
          <div>
            <h2 className="text-lg font-semibold">Historique de mes demandes</h2>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-sm">
            <thead className="bg-muted/30">
              <tr className="text-left border-b">
                <th className="px-6 py-4 font-semibold">Type</th>
                <th className="px-6 py-4 font-semibold">Date début</th>
                <th className="px-6 py-4 font-semibold">Date fin</th>
                <th className="px-6 py-4 font-semibold">Date création</th>
                <th className="px-6 py-4 font-semibold">Date traitement</th>
                <th className="px-6 py-4 font-semibold">Statut</th>
                <th className="px-6 py-4 font-semibold">Motif</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-sm text-center text-muted-foreground"
                  >
                    Chargement des demandes...
                  </td>
                </tr>
              ) : error && demandes.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-sm text-center text-red-500"
                  >
                    {error}
                  </td>
                </tr>
              ) : demandes.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-sm text-center text-muted-foreground"
                  >
                    Aucune demande d’absence à afficher pour le moment.
                  </td>
                </tr>
              ) : (
                demandes.map((demande) => (
                  <tr
                    key={demande.idDemande}
                    className="transition duration-200 border-b border-white/10 hover:bg-white/5"
                  >
                    <td className="px-6 py-5 text-slate-300">
                      {String(demande.typeDemande || "-")}
                    </td>

                    <td className="px-6 py-5 text-slate-300">
                      {formatDate(demande.dateDebut)}
                    </td>

                    <td className="px-6 py-5 text-slate-300">
                      {formatDate(demande.dateFin)}
                    </td>

                    <td className="px-6 py-5 text-slate-300">
                      {formatDate(demande.dateCreation)}
                    </td>

                    <td className="px-6 py-5 text-slate-300">
                      {formatDate(demande.dateTraitement)}
                    </td>

                    <td className="px-6 py-5">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getStatutBadgeClass(
                          demande.statut
                        )}`}
                      >
                        {String(demande.statut || "-")}
                      </span>
                    </td>

                    <td className="px-6 py-5 text-slate-300">
                      {String(demande.motif || "-")}
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

export default AssistantDemandeAbsencePage;