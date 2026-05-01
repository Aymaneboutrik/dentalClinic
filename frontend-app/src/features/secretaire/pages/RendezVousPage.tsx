import { useEffect, useState } from "react";
import {
  getRendezVous,
  createRendezVous,
  updateRendezVous,
  cancelRendezVous,
  type ApiError,
} from "@apis/services/rendezvous";
import { getEmployees } from "../../doctor/services/personnel.service";
import { patientService, type Patient } from "@apis/services/patient";
import type { RendezVous } from "../../../types/rendezvous/rendezvous";
import type { Employee } from "../../../types/employee/employee";
import useAuthStore from "@stores/auth-store";

type FormDataType = {
  patientId: number;
  dentisteId: number;
  date: string;
  heureDebut: string;
  motif: string;
  heureFinPrevue: string;
  estUrgent: boolean;
};

type FormFieldErrors = {
  patientId?: string;
  dentisteId?: string;
  date?: string;
  heureDebut?: string;
  motif?: string;
  heureFinPrevue?: string;
};

const RendezVousPage = () => {
  const { user } = useAuthStore();
  const initialFormData: FormDataType = {
    patientId: 0,
    dentisteId: 0,
    date: "",
    heureDebut: "",
    motif: "",
    heureFinPrevue: "",
    estUrgent: false,
  };

  const [appointments, setAppointments] = useState<RendezVous[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [dentists, setDentists] = useState<Employee[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormDataType>(initialFormData);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FormFieldErrors>({});

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const data = await getRendezVous();
      console.log("Rendez-vous récupérés (Secrétaire):", data);
      // RÈGLE MÉTIER : Ne pas afficher les rendez-vous annulés (statut 3)
      const validAppointments = data.filter((app: RendezVous) => app.statutId !== 3);
      setAppointments(validAppointments.sort((a: RendezVous, b: RendezVous) => {
        const dateA = new Date(`${a.date}T${a.heureDebut}`);
        const dateB = new Date(`${b.date}T${b.heureDebut}`);
        return dateA.getTime() - dateB.getTime();
      }));
    } catch (err) {
      console.error("Erreur récupération rendez-vous:", err);
      setError("Impossible de charger les rendez-vous.");
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      const results = await Promise.allSettled([
        patientService.secretaryListPatients(),
        getEmployees(),
      ]);

      if (results[0].status === "fulfilled") {
        setPatients(results[0].value);
      } else {
        console.error("Erreur chargement patients:", results[0].reason);
      }

      if (results[1].status === "fulfilled") {
        const employees = results[1].value;
        setDentists(
          employees.filter(
            (e: any) =>
              e.nomRole?.toLowerCase() === "docteur" ||
              e.nomRole?.toLowerCase() === "dentiste"
          )
        );
      } else {
        console.error("Erreur chargement personnel:", results[1].reason);
      }
    } catch (err) {
      console.error("Erreur lors du chargement des données auxiliaires", err);
    }
  };

  useEffect(() => {
    fetchAppointments();
    fetchData();
  }, []);

  useEffect(() => {
    if (successMessage || error) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, error]);

  const resetFormState = () => {
    setFormData(initialFormData);
    setFormError(null);
    setFieldErrors({});
    setIsEditMode(false);
    setEditingId(null);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const val = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: (name === "patientId" || name === "dentisteId") ? Number(val) : val,
    }));

    setFieldErrors((prev) => ({
      ...prev,
      [name]: undefined,
    }));
  };

  const validateForm = (): FormFieldErrors => {
    const errors: FormFieldErrors = {};

    if (formData.patientId === 0) errors.patientId = "Veuillez sélectionner un patient.";
    if (formData.dentisteId === 0) errors.dentisteId = "Veuillez sélectionner un dentiste.";
    if (!formData.date) errors.date = "La date est obligatoire.";
    if (!formData.heureDebut) errors.heureDebut = "L'heure de début est obligatoire.";
    if (!formData.heureFinPrevue) errors.heureFinPrevue = "L'heure de fin prévue est obligatoire.";
    if (!formData.motif.trim()) errors.motif = "Le motif est obligatoire.";

    if (formData.date) {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        errors.date = "La date ne peut pas être dans le passé.";
      }
    }

    if (formData.heureDebut && formData.heureFinPrevue) {
      if (formData.heureDebut >= formData.heureFinPrevue) {
        errors.heureDebut = "L'heure de début doit être inférieure à l'heure de fin.";
        errors.heureFinPrevue = "L'heure de fin doit être après l'heure de début.";
      }
    }

    return errors;
  };

  const handleOpenAddForm = () => {
    resetFormState();
    setSuccessMessage(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEdit = (appointment: RendezVous) => {
    setFormData({
      patientId: appointment.patientId,
      dentisteId: appointment.dentisteId,
      date: appointment.date,
      heureDebut: appointment.heureDebut,
      motif: appointment.motif,
      heureFinPrevue: appointment.heureFinPrevue,
      estUrgent: appointment.estUrgent || false,
    });
    setEditingId(appointment.id);
    setIsEditMode(true);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancel = async (id: number) => {
    if (!window.confirm("Voulez-vous vraiment annuler ce rendez-vous ?")) return;

    try {
      setActionLoading(true);
      await cancelRendezVous(id, user?.nom || "Secrétaire");
      setSuccessMessage("Rendez-vous annulé avec succès.");
      fetchAppointments();
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || "Erreur lors de l'annulation.");
    } finally {
      setActionLoading(false);
    }
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setFormError("Veuillez corriger les erreurs.");
      return;
    }

    try {
      setActionLoading(true);
      if (isEditMode && editingId) {
        await updateRendezVous(editingId, formData);
        setSuccessMessage("Rendez-vous mis à jour.");
      } else {
        await createRendezVous(formData);
        setSuccessMessage("Rendez-vous créé.");
      }
      setShowForm(false);
      resetFormState();
      fetchAppointments();
    } catch (err) {
      const apiError = err as ApiError;
      setFormError(apiError.message || "Erreur lors de l'enregistrement.");
    } finally {
      setActionLoading(false);
    }
  };

  const getPatientName = (id: number) => {
    const p = patients.find((p) => p.id === id);
    return p ? `${p.nom} ${p.prenom}` : `Patient #${id}`;
  };

  const getDentistName = (id: number) => {
    const d = dentists.find((d) => d.idEmploye === id);
    return d ? `${d.nom} ${d.prenom}` : `Dentiste #${id}`;
  };

  const getStatusLabel = (id: number) => {
    const statuses: Record<number, { label: string; color: string }> = {
      1: { label: "Planifié", color: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
      3: { label: "Annulé", color: "bg-red-500/15 text-red-400 border-red-500/30" },
      4: { label: "Effectué", color: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
      5: { label: "Absent", color: "bg-slate-500/15 text-slate-400 border-slate-500/30" },
      6: { label: "Reporté", color: "bg-purple-500/15 text-purple-400 border-purple-500/30" },
    };
    return statuses[id] || { label: "Inconnu", color: "bg-gray-500/15 text-gray-400 border-gray-500/30" };
  };

  return (
    <div className="w-full space-y-8">
      <div className="p-6 border shadow-sm rounded-2xl bg-card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-primary">Service Rendez-vous</p>
            <h1 className="text-3xl font-bold tracking-tight">Gestion des Rendez-vous</h1>
          </div>

          <button
            onClick={handleOpenAddForm}
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500"
          >
            Nouveau Rendez-vous
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="px-4 py-3 text-sm border rounded-2xl border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
          {successMessage}
        </div>
      )}

      {showForm && (
        <div className="rounded-2xl border border-white/10 bg-[#081028] p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-white mb-6">
            {isEditMode ? "Modifier le rendez-vous" : "Créer un rendez-vous"}
          </h2>

          {formError && <p className="mb-4 text-sm text-red-500">{formError}</p>}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">Patient</label>
              <select
                name="patientId"
                value={formData.patientId}
                onChange={handleChange}
                className="w-full rounded-xl border border-blue-500/20 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
              >
                <option value={0} className="bg-[#0B1739]">Sélectionner un patient</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id} className="bg-[#0B1739]">
                    {p.nom} {p.prenom} ({p.cin})
                  </option>
                ))}
              </select>
              {fieldErrors.patientId && <p className="text-xs text-red-500">{fieldErrors.patientId}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">Dentiste</label>
              <select
                name="dentisteId"
                value={formData.dentisteId}
                onChange={handleChange}
                className="w-full rounded-xl border border-blue-500/20 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
              >
                <option value={0} className="bg-[#0B1739]">Sélectionner un dentiste</option>
                {dentists.map((d) => (
                  <option key={d.idEmploye} value={d.idEmploye} className="bg-[#0B1739]">
                    Dr. {d.nom} {d.prenom}
                  </option>
                ))}
              </select>
              {fieldErrors.dentisteId && <p className="text-xs text-red-500">{fieldErrors.dentisteId}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full rounded-xl border border-blue-500/20 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
              />
              {fieldErrors.date && <p className="text-xs text-red-500">{fieldErrors.date}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">Heure Début</label>
                <input
                  type="time"
                  name="heureDebut"
                  value={formData.heureDebut}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-blue-500/20 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                />
                {fieldErrors.heureDebut && <p className="text-xs text-red-500">{fieldErrors.heureDebut}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">Heure Fin Prévue</label>
                <input
                  type="time"
                  name="heureFinPrevue"
                  value={formData.heureFinPrevue}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-blue-500/20 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                />
                {fieldErrors.heureFinPrevue && <p className="text-xs text-red-500">{fieldErrors.heureFinPrevue}</p>}
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-200">Motif</label>
              <textarea
                name="motif"
                value={formData.motif}
                onChange={handleChange}
                placeholder="Raison du rendez-vous..."
                className="w-full rounded-xl border border-blue-500/20 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-blue-500 h-24"
              />
              {fieldErrors.motif && <p className="text-xs text-red-500">{fieldErrors.motif}</p>}
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="estUrgent"
                name="estUrgent"
                checked={formData.estUrgent}
                onChange={handleChange}
                className="h-5 w-5 rounded border-blue-500/20 bg-white/5"
              />
              <label htmlFor="estUrgent" className="text-sm font-medium text-red-400">Marquer comme URGENCE</label>
            </div>

            <div className="flex justify-end gap-3 pt-4 md:col-span-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/10"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500 disabled:opacity-50"
              >
                {isEditMode ? "Mettre à jour" : "Créer le rendez-vous"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="border shadow-sm rounded-2xl bg-card">
        <div className="px-6 py-5 border-b">
          <h2 className="text-lg font-semibold">Liste des rendez-vous</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30">
              <tr className="text-left border-b">
                <th className="px-6 py-4 font-semibold">Patient</th>
                <th className="px-6 py-4 font-semibold">Dentiste</th>
                <th className="px-6 py-4 font-semibold">Date & Heure</th>
                <th className="px-6 py-4 font-semibold">Motif</th>
                <th className="px-6 py-4 font-semibold">Statut</th>
                <th className="px-6 py-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">Chargement...</td></tr>
              ) : appointments.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">Aucun rendez-vous trouvé.</td></tr>
              ) : (
                appointments.map((app) => {
                  const status = getStatusLabel(app.statutId);
                  return (
                    <tr key={app.id} className="border-b border-white/10 hover:bg-white/5 transition">
                      <td className="px-6 py-5 font-semibold text-white">
                        {getPatientName(app.patientId)}
                        {app.estUrgent && <span className="ml-2 text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded uppercase">Urgent</span>}
                      </td>
                      <td className="px-6 py-5 text-slate-300">{getDentistName(app.dentisteId)}</td>
                      <td className="px-6 py-5 text-slate-300">
                        {app.date} à {app.heureDebut}
                      </td>
                      <td className="px-6 py-5 text-slate-300 italic">"{app.motif}"</td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center gap-2">

                          <button
                            onClick={() => handleEdit(app)}
                            className="px-3 py-1.5 text-xs font-semibold text-blue-400 border border-blue-500/30 bg-blue-500/10 rounded-lg hover:bg-blue-500/20"
                          >
                            Modifier
                          </button>
                          {app.statutId !== 3 && (
                            <button
                              onClick={() => handleCancel(app.id)}
                              className="px-3 py-1.5 text-xs font-semibold text-red-400 border border-red-500/30 bg-red-500/10 rounded-lg hover:bg-red-500/20"
                            >
                              Annuler
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RendezVousPage;
